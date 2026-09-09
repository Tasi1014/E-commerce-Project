"""
classifier.py - Intent and Topic Classifier for PEAK E-Commerce Chatbot.

Classifies customer queries into one of six core intents:
1. product_search
2. payment_information
3. order_tracking
4. purchase_return
5. general_faq
6. out_of_scope

Key architectural principles:
- Dynamic topic key loading from knowledge_base.json at runtime (never hardcoded)
- Strict JSON output parsing and validation
- Primary path: LLM intent & topic -> strict validation
- Safety-net fallback: keyword matching activated only when LLM topic is missing/invalid
- Context-aware classification for conversational follow-ups
- Deterministic pre-filter for social messages (greetings, gratitude, farewells)
"""

import json
import logging
import re
from dataclasses import dataclass
from typing import Any, Dict, List, Optional

import ollama

from .tools.faq import KnowledgeBase, get_knowledge_base, find_faq_by_keywords

logger = logging.getLogger(__name__)

MODEL_NAME = "gemma3:4b"

INTENTS = [
    "product_search",
    "payment_information",
    "order_tracking",
    "purchase_return",
    "general_faq",
    "out_of_scope",
]

# Social message regex patterns for zero-cost pre-filtering
RE_GREETING = re.compile(
    r"^(hi+|hello+|hey+|hy+|heyy+|yo|good\s+(morning|afternoon|evening)|howdy)\b", re.IGNORECASE
)
RE_GRATITUDE = re.compile(
    r"\b(thanks?(\s+you|\s+a\s+lot|\s+so\s+much)?|thankyou|ty|thx|appreciate\s+it|much\s+appreciated)\b",
    re.IGNORECASE,
)
RE_FAREWELL = re.compile(
    r"\b(bye+|goodbye+|see\s+you(\s+later)?|see\s+ya|cya|have\s+a\s+(good|great|nice)\s+day)\b",
    re.IGNORECASE,
)
RE_AFFIRMATION = re.compile(
    r"^(ok+|okay+|k|cool|alright|got\s+it|sure|sounds\s+good)$", re.IGNORECASE
)

# Semantic glosses for topics to eliminate ambiguity
TOPIC_GLOSSES = {
    # general_faq
    "what_is_peak": "About PEAK, brand overview, company intro, products sold",
    "founding_year": "When PEAK was founded (2026)",
    "brand_philosophy": "Brand philosophy, ethical production, craftsmanship, luxury principles",
    "store_type": "Physical store presence, retail location, physical shop address (PEAK is online-only)",
    "store_hours": "Store operating hours, website opening/closing times (24/7 online)",
    "contact_info": "Customer support email, phone number, how to contact customer care",
    "support_response_time": "How long support takes to reply (24-48 hours)",
    "free_shipping_threshold": "Minimum order amount for free delivery ($150 worldwide)",
    "delivery_time": "How long shipping/delivery takes (3-5 days domestic, 7-14 days international)",
    "shipping_cost": "Shipping fees under $150 ($9.99 domestic Nepal, $19.99 international)",
    "international_shipping": "Worldwide shipping, customs duties, taxes, delivery regions",
    "same_day_weekend_delivery": "Same day or weekend delivery availability",
    "order_cancellation": "Cancelling an order within 24 hours / before shipment",
    # payment_information
    "payment_methods": "Accepted payment methods (Visa, Mastercard, cards via Stripe, COD)",
    "not_accepted_payment": "Unaccepted payment methods (eSewa, Khalti, Fonepay, UPI, mobile banking)",
    "cod_availability": "Cash on Delivery availability (domestic Nepal only, not international)",
    "currency": "Currency displayed and charged (USD)",
    "payment_security": "Card payment security via Stripe, card storage",
    "payment_failure": "Guidance when payment fails or card is declined",
    # purchase_return
    "return_policy": "General return eligibility window (30 days)",
    "condition_required": "Return condition rules (unworn, unused, original tags attached, tag removed questions)",
    "non_returnable_items": "Items excluded from return (final sale items, clearance items, sale purchases)",
    "return_shipping_cost": "Who pays return shipping cost (customer pays unless damaged)",
    "refund_process": "Refund method and processing timeline (5-7 business days to original method)",
    "exchange_policy": "Exchanging an item for different size or color",
    "damaged_defective_items": "Item arrived damaged, broken, defective, or wrong item sent",
}


@dataclass
class ClassificationResult:
    intent: str
    topic: Optional[str] = None
    social_type: Optional[str] = None
    is_prefiltered: bool = False
    is_fallback_topic: bool = False
    raw_response: Optional[str] = None


def pre_filter(query: str) -> Optional[ClassificationResult]:
    """
    Handles empty inputs and common social messages without calling the LLM.
    Returns ClassificationResult if handled, otherwise None.
    """
    normalized = query.strip().lower()
    normalized = re.sub(r"[!?.]+$", "", normalized).strip()

    if not normalized:
        return ClassificationResult(intent="out_of_scope", is_prefiltered=True)

    # Fast regex match for social phrases
    if RE_GREETING.match(normalized):
        return ClassificationResult(
            intent="general_faq",
            social_type="greeting",
            is_prefiltered=True,
        )

    if RE_GRATITUDE.search(normalized):
        return ClassificationResult(
            intent="general_faq",
            social_type="gratitude",
            is_prefiltered=True,
        )

    if RE_FAREWELL.search(normalized):
        return ClassificationResult(
            intent="general_faq",
            social_type="farewell",
            is_prefiltered=True,
        )

    if RE_AFFIRMATION.match(normalized):
        return ClassificationResult(
            intent="general_faq",
            social_type="affirmation",
            is_prefiltered=True,
        )

    return None


def format_topics_with_glosses(topic_keys: List[str]) -> str:
    lines = []
    for key in topic_keys:
        gloss = TOPIC_GLOSSES.get(key, "General topic")
        lines.append(f"  * {key} - {gloss}")
    return "\n".join(lines)


def build_dynamic_prompt(
    query: str,
    topics_by_intent: Dict[str, List[str]],
    context: Optional[Dict[str, Any]] = None,
) -> str:
    """
    Constructs the classification prompt dynamically injecting live topic keys
    with descriptive semantic glosses.
    """
    general_topics = format_topics_with_glosses(topics_by_intent.get("general_faq", []))
    payment_topics = format_topics_with_glosses(topics_by_intent.get("payment_information", []))
    return_topics = format_topics_with_glosses(topics_by_intent.get("purchase_return", []))

    context_str = ""
    if context:
        prev_intent = context.get("previous_intent")
        prev_topic = context.get("previous_topic")
        recent_user = context.get("last_user_message")
        recent_bot = context.get("last_bot_message")

        parts = []
        if prev_intent:
            parts.append(f"Previous Intent: {prev_intent}")
        if prev_topic:
            parts.append(f"Previous Topic: {prev_topic}")
        if recent_user:
            parts.append(f"Last User Message: \"{recent_user}\"")
        if recent_bot:
            parts.append(f"Last Bot Response: \"{recent_bot[:120]}...\"")

        if parts:
            context_str = (
                "\nRECENT CONVERSATION CONTEXT:\n"
                + "\n".join(parts)
                + "\nNOTE ON FOLLOW-UPS: If the customer query is a short follow-up (e.g. 'what about internationally?', 'only Nepal?', 'yes or no?', 'what if I removed the tag?'), resolve it as a continuation of the previous turn.\n"
            )

    prompt = f"""You are an e-commerce customer-support intent classifier for PEAK, an online-only apparel & accessories store.

Analyze the customer query and classify it into EXACTLY ONE intent and select the single best topic key.

AVAILABLE INTENTS AND LIVE TOPIC KEYS:

1. product_search
Finding or checking products, apparel, categories, colors, sizes, or stock availability. Topic: null.

2. payment_information
Payment options, cards, digital wallets, checkout, payment security:
{payment_topics}

3. order_tracking
Status, tracking, transit, or shipment of an EXISTING placed order. Topic: null.

4. purchase_return
Returns, refunds, exchanges, replacements, conditions, sale exclusions, damaged items:
{return_topics}

5. general_faq
Store facts, hours, store type/location, shipping policies, cancellation:
{general_topics}

6. out_of_scope
Requests unrelated to PEAK shopping (weather, coding, math, general trivia). Topic: null.

CRITICAL DISAMBIGUATION RULES:
- Tag removed / tag missing / if the tag is removed / worn or used item -> purchase_return (topic: condition_required), NOT return_policy, NOT damaged_defective_items
- Sale / clearance / final sale return eligibility -> purchase_return (topic: non_returnable_items), NOT return_policy
- Item arrived broken / defective / wrong item sent -> purchase_return (topic: damaged_defective_items)
- General return policy / return window (30 days) / how to return -> purchase_return (topic: return_policy)
- Store location / physical address / where is your store -> general_faq (topic: store_type)
- Store hours / opening hours / closing time -> general_faq (topic: store_hours)
- eSewa, Khalti, Fonepay, UPI, mobile banking -> payment_information (topic: not_accepted_payment)
- Accepted cards / general payment methods -> payment_information (topic: payment_methods)
- Cash on delivery -> payment_information (topic: cod_availability)
- Shipping fees / delivery charge -> general_faq (topic: shipping_cost)
{context_str}
CUSTOMER QUERY:
"{query}"

Respond with ONLY a valid JSON object in this exact format (no explanation, no markdown):
{{"intent": "<one of the 6 intents>", "topic": "<exact live topic key or null>"}}"""

    return prompt


class IntentClassifier:
    def __init__(
        self,
        kb: Optional[KnowledgeBase] = None,
        model_name: str = MODEL_NAME,
        keep_alive: str = "60m",
        client: Optional[ollama.Client] = None,
    ):
        self.kb = kb or get_knowledge_base()
        self.model_name = model_name
        self.keep_alive = keep_alive
        self.client = client or ollama.Client()
        self.topics_by_intent = self.kb.get_topics_by_intent()

    def classify(
        self,
        query: str,
        context: Optional[Dict[str, Any]] = None,
    ) -> ClassificationResult:
        """
        Full classification pipeline:
        1. Pre-filter check (fast zero-cost check)
        2. LLM Intent and Topic classification
        3. Strict JSON and schema validation
        4. Fallback to keyword matching ONLY if topic is missing/invalid for KB intent
        """
        query_clean = query.strip()

        # Step 1: Pre-filter
        pre_filtered = pre_filter(query_clean)
        if pre_filtered is not None:
            return pre_filtered

        # Step 2: Build prompt with dynamically injected topic keys
        prompt = build_dynamic_prompt(query_clean, self.topics_by_intent, context)

        # Step 3: LLM call with deterministic temperature=0 and capped generation length
        raw_text = ""
        try:
            response = self.client.chat(
                model=self.model_name,
                options={
                    "temperature": 0.0,
                    "num_predict": 45,  # Capped: JSON response only requires ~20 tokens
                    "num_ctx": 2048,     # Reduced context allocation
                },
                keep_alive=self.keep_alive,
                messages=[{"role": "user", "content": prompt}],
            )
            raw_text = response.get("message", {}).get("content", "").strip()
        except Exception as e:
            logger.error(f"Ollama chat call failed in classifier: {e}")
            # Fall back safely
            matched_faq = self.kb.find_faq_by_keywords(query_clean)
            if matched_faq:
                category = matched_faq.get("category", "general")
                intent = self.kb.CATEGORY_TO_INTENT.get(category, "general_faq")
                return ClassificationResult(
                    intent=intent,
                    topic=matched_faq.get("key"),
                    is_fallback_topic=True,
                    raw_response=f"Ollama Error: {e}",
                )
            return ClassificationResult(
                intent="out_of_scope",
                raw_response=f"Ollama Error: {e}",
            )

        # Step 4: Parse JSON
        parsed_json = self._extract_json(raw_text)

        intent = parsed_json.get("intent") if parsed_json else None
        topic = parsed_json.get("topic") if parsed_json else None

        # Validate intent
        if intent not in INTENTS:
            # Check if intent is actually a valid topic key (e.g. LLM returned {"intent": "shipping_cost"})
            found_intent = None
            for parent_intent, topic_list in self.topics_by_intent.items():
                if intent in topic_list:
                    found_intent = parent_intent
                    topic = intent
                    break
                if topic and topic in topic_list:
                    found_intent = parent_intent
                    break

            if found_intent:
                intent = found_intent
            else:
                # Fallback: check if exactly one known intent appears in raw_text
                matches = [i for i in INTENTS if re.search(rf"\b{i}\b", raw_text.lower())]
                if len(matches) == 1:
                    intent = matches[0]
                else:
                    intent = "out_of_scope"
                    topic = None

        # Format topic: normalize empty or null string
        if isinstance(topic, str):
            topic = topic.strip()
            if topic.lower() in ("null", "none", ""):
                topic = None

        # Validate topic against live valid keys for KB-backed intents
        is_fallback_topic = False
        if intent in ("general_faq", "payment_information", "purchase_return"):
            valid_topics = self.topics_by_intent.get(intent, [])
            if not topic or topic not in valid_topics:
                # LLM topic missing or invalid -> Safety-net keyword matching
                category = self.kb.INTENT_TO_CATEGORY.get(intent)
                matched_faq = self.kb.find_faq_by_keywords(query_clean, category=category)
                if matched_faq:
                    topic = matched_faq.get("key")
                    is_fallback_topic = True
                else:
                    # Also try global keyword match across all categories
                    matched_faq = self.kb.find_faq_by_keywords(query_clean)
                    if matched_faq:
                        topic = matched_faq.get("key")
                        is_fallback_topic = True
        else:
            # For product_search, order_tracking, out_of_scope: topic must be None
            topic = None

        return ClassificationResult(
            intent=intent,
            topic=topic,
            is_fallback_topic=is_fallback_topic,
            raw_response=raw_text,
        )

    def _extract_json(self, raw_text: str) -> Optional[dict]:
        """Extracts and parses JSON object from LLM response."""
        if not raw_text:
            return None

        # Remove markdown code blocks if present
        clean_text = re.sub(r"^```json\s*", "", raw_text, flags=re.IGNORECASE)
        clean_text = re.sub(r"^```\s*", "", clean_text)
        clean_text = re.sub(r"\s*```$", "", clean_text).strip()

        # Try direct json parse
        try:
            return json.loads(clean_text)
        except json.JSONDecodeError:
            pass

        # Search for first {...} block
        match = re.search(r"\{[^{}]*\}", raw_text, flags=re.DOTALL)
        if match:
            try:
                return json.loads(match.group(0))
            except json.JSONDecodeError:
                pass

        return None
