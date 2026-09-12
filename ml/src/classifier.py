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
import time
import json
import logging
import re
from dataclasses import dataclass
from typing import Any, Dict, List, Optional

import ollama

from .tools.faq import KnowledgeBase, get_knowledge_base

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
    r"^(hi+|hello+|hey+|hy+|heyy+|yo|good\s+(morning|afternoon|evening)|howdy)\b",
    re.IGNORECASE,
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
    r"^(ok+|okay+|k|cool|alright|got\s+it|sure|sounds\s+good)$",
    re.IGNORECASE,
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
    entities: Optional[Dict[str, Any]] = None
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
        return ClassificationResult(
            intent="out_of_scope",
            is_prefiltered=True,
        )

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
    Build a compact LLM classification prompt.
    Keeps intent/topic/entity rules while minimizing unnecessary tokens.
    """

    general_topics = format_topics_with_glosses(
        topics_by_intent.get("general_faq", [])
    )

    payment_topics = format_topics_with_glosses(
        topics_by_intent.get("payment_information", [])
    )

    return_topics = format_topics_with_glosses(
        topics_by_intent.get("purchase_return", [])
    )

    context_str = ""

    if context:
        prev_intent = context.get("previous_intent")
        prev_topic = context.get("previous_topic")
        recent_user = context.get("last_user_message")
        recent_bot = context.get("last_bot_message")

        parts = []

        if prev_intent:
            parts.append(f"Previous intent: {prev_intent}")

        if prev_topic:
            parts.append(f"Previous topic: {prev_topic}")

        if recent_user:
            parts.append(f'Previous user message: "{recent_user}"')

        if recent_bot:
            parts.append(f'Previous bot response: "{recent_bot[:120]}..."')

        if parts:
            context_str = (
                "\nCONTEXT:\n"
                + "\n".join(parts)
                + "\nShort follow-ups should continue the previous conversation.\n"
            )

    prompt = f"""You are PEAK's e-commerce customer-support classifier.

Classify the customer query into EXACTLY ONE intent, select the best topic when applicable, and extract only explicitly present entities.

INTENTS:

1. product_search
Finding, browsing, or checking products, categories, brands, colors, sizes, prices, or availability.
Topic: null.

2. payment_information
Payment methods, cards, digital wallets, checkout, payment security, or payment problems.
Topics:
{payment_topics}

3. order_tracking
Status, tracking, transit, shipment, or delivery of an EXISTING placed order.
Topic: null.

4. purchase_return
Returns, refunds, exchanges, replacements, return conditions, sale exclusions, damaged or wrong items.
Topics:
{return_topics}

5. general_faq
General PEAK information, store details, hours, location, shipping policies, delivery policies, and cancellation.
Topics:
{general_topics}

6. out_of_scope
Anything unrelated to PEAK shopping or customer support.

DISAMBIGUATION:

- Store location/address/physical store -> general_faq / store_type
- Store hours -> general_faq / store_hours
- Shipping cost/delivery charge -> general_faq / shipping_cost
- General delivery time/policy -> general_faq
- Existing order's expected arrival/status -> order_tracking
- "Why hasn't my order arrived?" -> order_tracking
- eSewa/Khalti/Fonepay/UPI/mobile banking -> payment_information / not_accepted_payment
- Accepted cards/payment methods -> payment_information / payment_methods
- Cash on delivery -> payment_information / cod_availability
- Tag removed/missing/worn/used item -> purchase_return / condition_required
- Sale/clearance/final-sale return eligibility -> purchase_return / non_returnable_items
- Broken/defective/wrong item -> purchase_return / damaged_defective_items
- General return policy/return window/how to return -> purchase_return / return_policy

ENTITY RULES:

Extract only values explicitly present or clearly implied by the query.
Never invent values. Omit absent fields.

Supported entities:
- order_number
- product_name
- category
- brand
- color
- size
- price_min
- price_max

For product_search:
- Extract the product being requested as product_name.
- A product type such as "shoes", "shirts", "bracelets", "bags", etc. is a valid product_name.
- Extract category, brand, color, size, and price constraints when present.

For order_tracking/purchase_return:
- Extract order_number when present.
- Format order numbers like PK-745B8012.

Price rules:
- under/below/less than/up to/maximum $200 -> price_max: 200
- over/above/more than/minimum $100 -> price_min: 100
- between $100 and $200 -> price_min: 100, price_max: 200
- Remove $, NPR, Rs., or रु.; return numbers only.
- price_min and price_max must be numbers.

EXAMPLES:

Query: "Where is my order PK-745B8012?"
{{
  "intent": "order_tracking",
  "topic": null,
  "entities": {{
    "order_number": "PK-745B8012"
  }}
}}

Query: "Do you have shoes under $200?"
{{
  "intent": "product_search",
  "topic": null,
  "entities": {{
    "product_name": "shoes",
    "category": "shoes",
    "price_max": 200
  }}
}}

Query: "Can I return order PK-745B8012?"
{{
  "intent": "purchase_return",
  "topic": "return_policy",
  "entities": {{
    "order_number": "PK-745B8012"
  }}
}}

Query: "Can I pay with eSewa?"
{{
  "intent": "payment_information",
  "topic": "not_accepted_payment",
  "entities": {{}}
}}
{context_str}

CUSTOMER QUERY:
"{query}"

Return ONLY valid JSON:

{{
  "intent": "<one of the 6 intents>",
  "topic": "<exact topic key or null>",
  "entities": {{}}
}}

No explanation. No markdown. No code fences.
"""

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
        2. LLM intent, topic and entity classification
        3. Strict JSON and schema validation
        4. Fallback to keyword matching ONLY if topic is missing/invalid
           for KB-backed intents
        """

        query_clean = query.strip()

        # Step 1: Pre-filter

        pre_filtered = pre_filter(query_clean)

        if pre_filtered is not None:
            return pre_filtered

        # Step 2: Build prompt with dynamically injected topic keys

        prompt = build_dynamic_prompt(
            query_clean,
            self.topics_by_intent,
            context,
        )

        # Step 3: LLM call

        raw_text = ""

        try:
            start_time = time.perf_counter()
            response = self.client.chat(
                model=self.model_name,
                options={
                    "temperature": 0.0,
                    "num_predict": 60,
                    "num_ctx": 2048,
                },
                keep_alive=self.keep_alive,
                messages=[
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
            )

            print(
                f"Prompt tokens: {response.get('prompt_eval_count')}",
                flush=True,
            )

            print(
                f"Generated tokens: {response.get('eval_count')}",
                flush=True,
            )

            print(
                f"Prompt evaluation: "
                f"{response.get('prompt_eval_duration', 0) / 1e9:.2f}s",
                flush=True,
            )

            print(
                f"Generation: "
                f"{response.get('eval_duration', 0) / 1e9:.2f}s",
                flush=True,
            )

            elapsed = time.perf_counter() - start_time

            print(f"LLM Call 1 completed in {elapsed:.2f} seconds", flush=True)
            
            raw_text = response.get(
                "message",
                {},
            ).get(
                "content",
                "",
            ).strip()

        except Exception as e:
            logger.error(
                f"Ollama chat call failed in classifier: {e}"
            )

            # Fallback safely

            matched_faq = self.kb.find_faq_by_keywords(
                query_clean
            )

            if matched_faq:
                category = matched_faq.get(
                    "category",
                    "general",
                )

                intent = self.kb.CATEGORY_TO_INTENT.get(
                    category,
                    "general_faq",
                )

                return ClassificationResult(
                    intent=intent,
                    topic=matched_faq.get("key"),
                    entities=None,
                    is_fallback_topic=True,
                    raw_response=f"Ollama Error: {e}",
                )

            return ClassificationResult(
                intent="out_of_scope",
                entities=None,
                raw_response=f"Ollama Error: {e}",
            )

        # Step 4: Parse JSON

        parsed_json = self._extract_json(raw_text)

        intent = (
            parsed_json.get("intent")
            if parsed_json
            else None
        )

        topic = (
            parsed_json.get("topic")
            if parsed_json
            else None
        )

        entities = (
            parsed_json.get("entities")
            if parsed_json
            else None
        )

        # Basic entity validation

        if not isinstance(entities, dict):
            entities = None

        # Validate intent

        if intent not in INTENTS:

            # Check if intent is actually a valid topic key
            # e.g. LLM returned {"intent": "shipping_cost"}

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
                # Fallback: check if exactly one known intent
                # appears in raw response

                matches = [
                    i
                    for i in INTENTS
                    if re.search(
                        rf"\b{i}\b",
                        raw_text.lower(),
                    )
                ]

                if len(matches) == 1:
                    intent = matches[0]

                else:
                    intent = "out_of_scope"
                    topic = None
                    entities = None

        # Format topic:
        # normalize empty/null string

        if isinstance(topic, str):
            topic = topic.strip()

            if topic.lower() in (
                "null",
                "none",
                "",
            ):
                topic = None

        # Validate topic against live valid keys
        # for KB-backed intents

        is_fallback_topic = False

        if intent in (
            "general_faq",
            "payment_information",
            "purchase_return",
        ):

            valid_topics = self.topics_by_intent.get(
                intent,
                [],
            )

            if not topic or topic not in valid_topics:

                # LLM topic missing or invalid
                # -> Safety-net keyword matching

                category = self.kb.INTENT_TO_CATEGORY.get(
                    intent
                )

                matched_faq = self.kb.find_faq_by_keywords(
                    query_clean,
                    category=category,
                )

                if matched_faq:
                    topic = matched_faq.get("key")
                    is_fallback_topic = True

                else:

                    # Also try global keyword match
                    # across all categories

                    matched_faq = self.kb.find_faq_by_keywords(
                        query_clean
                    )

                    if matched_faq:
                        topic = matched_faq.get("key")
                        is_fallback_topic = True

        else:
            # For product_search, order_tracking and
            # out_of_scope, topic must be None.

            topic = None

        # Final result

        return ClassificationResult(
            intent=intent,
            topic=topic,
            entities=entities,
            is_fallback_topic=is_fallback_topic,
            raw_response=raw_text,
        )

    def _extract_json(
        self,
        raw_text: str,
    ) -> Optional[dict]:
        """
        Extracts and parses a JSON object from the LLM response.
        """

        if not raw_text:
            return None

        # Remove markdown code blocks if present

        clean_text = re.sub(
            r"^```json\s*",
            "",
            raw_text,
            flags=re.IGNORECASE,
        )

        clean_text = re.sub(
            r"^```\s*",
            "",
            clean_text,
        )

        clean_text = re.sub(
            r"\s*```$",
            "",
            clean_text,
        ).strip()

        # Try direct JSON parse

        try:
            return json.loads(clean_text)

        except json.JSONDecodeError:
            pass

        # Search for first {...} block

        match = re.search(
            r"\{[^{}]*\}",
            raw_text,
            flags=re.DOTALL,
        )

        if match:

            try:
                return json.loads(
                    match.group(0)
                )

            except json.JSONDecodeError:
                pass

        return None

