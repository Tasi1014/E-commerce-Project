"""
chatbot.py - Main Conversational Orchestration Layer & Terminal Interface for PEAK.

Orchestrates:
1. Knowledge base loading & validation
2. Bounded conversation history & context tracking
3. Dynamic intent & topic classification (reusable Ollama client)
4. Safe guardrails for out-of-scope requests
5. Phase 2 placeholder routing for product_search & order_tracking
6. OPTIONAL Response Generation:
   - Direct authoritative answer for simple FAQ queries (1 LLM call)
   - Synthesis via ResponseGenerator only when query is compound / conversational
7. Asynchronous background model warm-up with keep_alive="60m"
8. Decoupled design: chatbot.process() has zero dependency on input() or print()
"""

import logging
import os
import re
import sys
import threading
import time
from typing import Any, Dict, List, Optional, Tuple

import ollama

from .tools.faq import KnowledgeBase, get_knowledge_base
from .classifier import IntentClassifier, ClassificationResult, pre_filter
from .response_generator import ResponseGenerator

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stderr)],
)
logger = logging.getLogger("peak_chatbot")
logging.getLogger("httpx").setLevel(logging.WARNING)

# Model readiness states
MODEL_LOADING = "MODEL_LOADING"
MODEL_READY = "MODEL_READY"
MODEL_ERROR = "MODEL_ERROR"

# Guardrail and canned responses
OUT_OF_SCOPE_RESPONSE = (
    "I'm here to help with PEAK's products, orders, payments, returns, "
    "and store information. I can't help with that request."
)

PHASE2_PRODUCT_SEARCH_RESPONSE = (
    "I can help you find products, but live product search is not connected yet."
)

PHASE2_ORDER_TRACKING_RESPONSE = (
    "I can help with order tracking, but live order tracking is not connected yet."
)

SOCIAL_RESPONSES = {
    "greeting": "Hello! Welcome to PEAK. How can I help you today?",
    "gratitude": "You're very welcome! Please let me know if you have any other questions.",
    "farewell": "Goodbye! Thank you for shopping with PEAK. Have a wonderful day!",
    "affirmation": "Understood! Let me know if there's anything else I can assist you with.",
}

UNKNOWN_POLICY_RESPONSE = (
    "I'm sorry, I couldn't find specific information regarding that request in "
    "PEAK's current store policies. Please contact customer support at "
    "info@peak.com or +977 9803901467, and our team will be happy to assist you."
)


def is_contextual_followup(query: str, previous_intent: Optional[str]) -> bool:
    """
    Detects if the query is an elliptical or conversational follow-up to the previous turn.
    """
    if not previous_intent:
        return False
    clean = query.strip().lower()

    # Direct follow-up phrases
    if re.match(r"^(yes\s+or\s+no\??|why\??|why\s+not\??|and\s+.*|only\s+.*|what\s+about\s+.*|what\s+if\s*.*\??)$", clean):
        return True

    # Short dependent queries (<= 5 words starting with linking or interrogative words)
    words = clean.split()
    if len(words) <= 5 and words[0] in ("only", "what", "how", "and", "is", "can", "will", "yes", "no", "internationally?", "internationally"):
        return True

    return False


def resolve_contextual_followup(
    query: str,
    previous_intent: Optional[str],
    previous_topic: Optional[str],
    kb: KnowledgeBase,
) -> Optional[Tuple[str, Optional[str]]]:
    """
    Priority 2: Resolve conversation context first.
    Detects if the query is an elliptical or contextual follow-up to an active conversation turn.
    Determines if it inherits the previous topic, shifts to a specific subtopic within the domain,
    or confirms a binary answer (yes/no).
    Returns (intent, topic) if resolved, or None if it should be classified independently.
    """
    if not previous_intent:
        return None

    clean = query.strip().lower()
    words = clean.split()

    # 1. Direct polarity / binary confirmation: "yes or no?", "is that a yes or no?"
    if re.match(r"^(yes\s+or\s+no\??|is\s+that\s+a\s+yes\s+or\s+no\??|just\s+tell\s+me\s+yes\s+or\s+no\??)$", clean):
        return (previous_intent, previous_topic)

    # 2. Check if the query is an elliptical follow-up structure
    is_elliptical = False
    if re.match(r"^(only\b|what\s+about\b|how\s+about\b|what\s+if\b|and\b|why\b|why\s+not\b)", clean):
        is_elliptical = True
    elif len(words) <= 4 and words[0] in ("internationally?", "internationally", "domestic?", "domestically"):
        is_elliptical = True
    elif len(words) <= 5 and words[0] in ("only", "what", "how", "and", "is", "can", "will", "why"):
        is_elliptical = True

    if not is_elliptical:
        return None

    # 3. Check if the follow-up introduces a domain-specific subtopic keyword
    if previous_intent == "purchase_return":
        if re.search(r"\b(tag|tags|unworn|worn|opened|wash|washed|used|condition)\b", clean):
            return ("purchase_return", "condition_required")
        if re.search(r"\b(sale|clearance|final\s+sale|discount|discounted)\b", clean):
            return ("purchase_return", "non_returnable_items")
        if re.search(r"\b(broken|damaged|defective|faulty|wrong)\b", clean):
            return ("purchase_return", "damaged_defective_items")
        if re.search(r"\b(refund|refunds|money\s+back)\b", clean):
            return ("purchase_return", "refund_timing" if "refund_timing" in kb.faqs_by_key else "return_policy")
        if re.search(r"\b(exchange|exchanges|replace|replacement)\b", clean):
            return ("purchase_return", "exchange_policy")

    # In general, if query matches known keywords within the previous domain:
    cat = kb.INTENT_TO_CATEGORY.get(previous_intent)
    if cat:
        matched_faq = kb.find_faq_by_keywords(clean, category=cat)
        if matched_faq and matched_faq.get("key") != previous_topic:
            return (previous_intent, matched_faq.get("key"))

    # 4. Pure elliptical qualifiers / continuations on the SAME topic:
    # e.g., "Only for inside Nepal?", "What about internationally?", "only Nepal?", "what if?", "why?"
    if previous_topic:
        return (previous_intent, previous_topic)

    return (previous_intent, None)


def should_use_response_generator(
    query: str,
    is_followup: bool,
    context: Optional[Dict[str, Any]] = None,
) -> bool:
    """
    Determines whether a query requires ResponseGenerator synthesis or direct KB answer.

    Direct KB answer when:
    - Standalone single question that maps directly to one authoritative KB fact.
    - No contextual follow-up or interpretation needed.

    ResponseGenerator when:
    - Multiple KB facts must be combined.
    - Contextual follow-up to a previous turn.
    - Conditional question ("if", "what if", "suppose", "accidentally").
    - Explicit yes/no confirmation question ("yes or no?", "is it refundable?").
    - Adapting a policy to the user's specific scenario.
    """
    clean = query.strip().lower()

    # 1. Any contextual follow-up to a previous turn needs conversational tailoring
    if is_followup:
        return True

    # 2. Multi-question indicators
    if clean.count("?") > 1:
        return True

    # 3. Explicit yes/no or confirmation inquiries
    if re.search(r"\b(yes\s+or\s+no|is\s+.*\b(refundable|returnable|allowed|possible|eligible)|can\s+i\s+still|will\s+it\s+be\s+refunded)\b", clean):
        return True

    # 4. Conditional or scenario inquiries
    if re.search(r"\b(if\b|what\s+if|suppose|in\s+case|accidentally|tag.*(removed|missing|cut)|(removed|missing|cut).*tag)\b", clean):
        return True

    # 5. Compound / comparison indicators
    compound_patterns = [
        r"\b(options?|what\s+should\s+i\s+do|what\s+can\s+i\s+do)\b",
        r"\b(and\s+(how|what|can|do|is|will|where)|also\b|plus\b)",
        r"\b(i\s+(bought|ordered|received)).*\b(but|however|damaged|broken|wrong|defective)\b",
        r"\b(both|either|difference\s+between)\b",
        r"\b(as\s+well\s+as|in\s+addition)\b",
    ]
    return any(re.search(pat, clean) for pat in compound_patterns)


class Chatbot:
    """
    Core conversational customer support engine for PEAK.
    Completely decoupled from I/O (no print() or input()).
    """

    def __init__(
        self,
        kb_path: Optional[str] = None,
        model_name: str = "gemma3:4b",
        keep_alive: str = "60m",
        max_history_turns: int = 6,
        client=None,
        classifier=None,
        response_generator=None,
    ):
        self.model_name = model_name
        self.keep_alive = keep_alive
        self.max_history_turns = max_history_turns

        # Shared Ollama client instance for connection reuse
        self.client = client or ollama.Client()

        # Initialize knowledge base
        self.kb = KnowledgeBase.get_instance(kb_path)

        # Initialize subcomponents with shared client
        self.classifier = classifier or IntentClassifier(
            kb=self.kb,
            model_name=self.model_name,
            keep_alive=self.keep_alive,
            client=self.client,
        )
        self.response_generator = response_generator or ResponseGenerator(
            model_name=self.model_name,
            keep_alive=self.keep_alive,
            client=self.client,
        )

        # Bounded conversation state
        self.history: List[Dict[str, str]] = []
        self.previous_intent: Optional[str] = None
        self.previous_topic: Optional[str] = None
        self.last_user_message: Optional[str] = None
        self.last_bot_message: Optional[str] = None

        # Model readiness state
        self._warmup_event = threading.Event()
        self._warmup_thread: Optional[threading.Thread] = None

        if self.check_model_resident():
            self.model_status: str = MODEL_READY
            self._warmup_event.set()
        else:
            self.model_status: str = MODEL_LOADING

        # Latency instrumentation
        self.last_timing: Dict[str, float] = {
            "classification_ms": 0.0,
            "retrieval_ms": 0.0,
            "response_gen_ms": 0.0,
            "total_ms": 0.0,
            "llm_calls": 0,
        }

    def check_model_resident(self) -> bool:
        """
        Checks Ollama's active models via client.ps().
        Returns True if the model is currently resident in memory.
        """
        try:
            ps_result = self.client.ps()
            active_models = getattr(ps_result, "models", [])
            for m in active_models:
                m_name = getattr(m, "name", getattr(m, "model", ""))
                if self.model_name in m_name:
                    return True
        except Exception as e:
            logger.debug(f"Unable to query client.ps(): {e}")
        return False

    def start_background_warmup(self) -> None:
        """Starts background model warm-up only if not already resident in memory."""
        if self.model_status == MODEL_READY or self.check_model_resident():
            self.model_status = MODEL_READY
            self._warmup_event.set()
            return

        if self._warmup_thread and self._warmup_thread.is_alive():
            return

        self._warmup_thread = threading.Thread(
            target=self._run_warmup,
            name="OllamaWarmupThread",
            daemon=True,
        )
        self._warmup_thread.start()

    def _run_warmup(self) -> None:
        """
        Executes minimal warm-up query to load Gemma 3 4B into memory/VRAM.
        num_predict=1 prevents wasting time generating tokens.
        num_ctx=2048 matches the context window used by classifier and response generator.
        """
        logger.info(f"Initiating background warm-up for {self.model_name}...")
        start_time = time.time()
        try:
            self.client.chat(
                model=self.model_name,
                messages=[{"role": "user", "content": "ping"}],
                options={"temperature": 0.0, "num_predict": 1, "num_ctx": 2048},
                keep_alive=self.keep_alive,
            )
            elapsed = time.time() - start_time
            self.model_status = MODEL_READY
            logger.info(f"Model {self.model_name} loaded and ready (took {elapsed:.2f}s).")
        except Exception as e:
            self.model_status = MODEL_ERROR
            logger.warning(f"Model warm-up encountered an error: {e}")
        finally:
            self._warmup_event.set()

    def is_ready(self) -> bool:
        """Returns True if the background warm-up has completed successfully."""
        return self.model_status == MODEL_READY

    def wait_until_ready(self, timeout: float = 300.0) -> bool:
        """Waits for warm-up to finish if called while warming up."""
        self._warmup_event.wait(timeout=timeout)
        return self.model_status == MODEL_READY

    def get_context(self) -> Dict[str, Any]:
        """Returns current conversation context for intent understanding and response generation."""
        return {
            "previous_intent": self.previous_intent,
            "previous_topic": self.previous_topic,
            "last_user_message": self.last_user_message,
            "last_bot_message": self.last_bot_message,
        }

    def reset(self) -> None:
        """Resets conversation state and history."""
        self.history.clear()
        self.previous_intent = None
        self.previous_topic = None
        self.last_user_message = None
        self.last_bot_message = None

    def create_session_instance(self) -> "Chatbot":
        """
        Creates an isolated session-specific Chatbot instance that shares
        the heavy Ollama client, classifier, response generator, and KB singleton,
        while maintaining independent conversation history and context.
        """
        child = Chatbot(
            kb_path=str(self.kb.kb_path),
            model_name=self.model_name,
            keep_alive=self.keep_alive,
            max_history_turns=self.max_history_turns,
            client=self.client,
            classifier=self.classifier,
            response_generator=self.response_generator,
        )
        child._warmup_event = self._warmup_event
        child.model_status = self.model_status
        return child

    def process(self, user_message: str) -> str:
        """
        Process a user message and return the chatbot's response.
        Thread-safe and independent of console I/O.
        """
        t_start = time.perf_counter()
        cleaned_query = user_message.strip()

        # Reset timing stats
        self.last_timing = {
            "classification_ms": 0.0,
            "retrieval_ms": 0.0,
            "response_gen_ms": 0.0,
            "total_ms": 0.0,
            "llm_calls": 0,
        }

        if not cleaned_query:
            return "Please enter a question or message so I can assist you."

        # If background warm-up is still active, wait for it
        if self.model_status == MODEL_LOADING and self._warmup_thread and self._warmup_thread.is_alive():
            self._warmup_event.wait(timeout=300.0)

        # Priority 1: Deterministic greetings / social handling (0 LLM calls)
        pre_result = pre_filter(cleaned_query)
        if pre_result and pre_result.social_type:
            response = SOCIAL_RESPONSES.get(
                pre_result.social_type,
                SOCIAL_RESPONSES["greeting"],
            )
            self._update_state(cleaned_query, response, pre_result.intent, None)
            self.last_timing["total_ms"] = (time.perf_counter() - t_start) * 1000.0
            self.last_timing["llm_calls"] = 0
            return response

        # Priority 2: Resolve conversation context first
        is_followup = is_contextual_followup(cleaned_query, self.previous_intent)
        resolved_context = resolve_contextual_followup(
            cleaned_query,
            self.previous_intent,
            self.previous_topic,
            self.kb,
        )

        if resolved_context is not None:
            resolved_intent, resolved_topic = resolved_context
            classification = ClassificationResult(
                intent=resolved_intent,
                topic=resolved_topic,
            )
            is_followup = True
            self.last_timing["classification_ms"] = 0.0
        else:
            # Priority 3: Classify intent + topic with descriptive topic glosses
            context = self.get_context()
            t_clf_start = time.perf_counter()
            classification = self.classifier.classify(
                cleaned_query,
                context=context,
            )
            self.last_timing["classification_ms"] = (time.perf_counter() - t_clf_start) * 1000.0
            self.last_timing["llm_calls"] = 1

            if classification.social_type:
                response = SOCIAL_RESPONSES.get(
                    classification.social_type,
                    SOCIAL_RESPONSES["greeting"],
                )
                self._update_state(cleaned_query, response, classification.intent, None)
                self.last_timing["total_ms"] = (time.perf_counter() - t_start) * 1000.0
                self.last_timing["llm_calls"] = 0
                return response

        # 3. Step: Route based on intent
        intent = classification.intent
        topic = classification.topic

        if intent == "out_of_scope":
            response = OUT_OF_SCOPE_RESPONSE
            self._update_state(cleaned_query, response, intent, None)
            self.last_timing["total_ms"] = (time.perf_counter() - t_start) * 1000.0
            return response

        elif intent == "product_search":
            response = PHASE2_PRODUCT_SEARCH_RESPONSE
            self._update_state(cleaned_query, response, intent, None)
            self.last_timing["total_ms"] = (time.perf_counter() - t_start) * 1000.0
            return response

        elif intent == "order_tracking":
            response = PHASE2_ORDER_TRACKING_RESPONSE
            self._update_state(cleaned_query, response, intent, None)
            self.last_timing["total_ms"] = (time.perf_counter() - t_start) * 1000.0
            return response

        elif intent in ("general_faq", "payment_information", "purchase_return"):
            t_ret_start = time.perf_counter()
            faq_record = None
            if topic:
                faq_record = self.kb.get_faq(topic)

            # Safety-net keyword matching if topic lookup failed
            if not faq_record:
                category = self.kb.INTENT_TO_CATEGORY.get(intent)
                faq_record = self.kb.find_faq_by_keywords(cleaned_query, category=category)
                if not faq_record:
                    faq_record = self.kb.find_faq_by_keywords(cleaned_query)

            self.last_timing["retrieval_ms"] = (time.perf_counter() - t_ret_start) * 1000.0

            if not faq_record:
                response = UNKNOWN_POLICY_RESPONSE
                self._update_state(cleaned_query, response, intent, None)
                self.last_timing["total_ms"] = (time.perf_counter() - t_start) * 1000.0
                return response

            resolved_topic = faq_record.get("key")
            raw_answer = faq_record.get("answer", "")

            # DECISION MECHANISM: Direct Answer vs Response Generator
            context = self.get_context()
            needs_synthesis = should_use_response_generator(cleaned_query, is_followup, context)

            if not needs_synthesis and raw_answer:
                # Direct authoritative answer: 1 LLM call total, 0 hallucination
                response = raw_answer
                self.last_timing["response_gen_ms"] = 0.0
            else:
                # Conversational / compound synthesis: 2nd LLM call
                t_gen_start = time.perf_counter()
                facts = self.kb.get_context_for_faq(faq_record)

                synth_query = cleaned_query
                if is_followup and self.last_user_message and len(cleaned_query.split()) <= 7:
                    synth_query = f"{self.last_user_message} -> {cleaned_query}"

                response = self.response_generator.generate(
                    user_query=synth_query,
                    retrieved_facts=facts,
                    context=context,
                )
                self.last_timing["response_gen_ms"] = (time.perf_counter() - t_gen_start) * 1000.0
                self.last_timing["llm_calls"] += 1

            self._update_state(cleaned_query, response, intent, resolved_topic)
            self.last_timing["total_ms"] = (time.perf_counter() - t_start) * 1000.0
            return response

        else:
            # Fallback for unexpected intent
            response = OUT_OF_SCOPE_RESPONSE
            self._update_state(cleaned_query, response, "out_of_scope", None)
            self.last_timing["total_ms"] = (time.perf_counter() - t_start) * 1000.0
            return response

    def _update_state(
        self,
        user_message: str,
        bot_response: str,
        intent: Optional[str],
        topic: Optional[str],
    ) -> None:
        """Updates bounded conversation history and state."""
        self.previous_intent = intent
        self.previous_topic = topic
        self.last_user_message = user_message
        self.last_bot_message = bot_response

        self.history.append({"role": "user", "content": user_message})
        self.history.append({"role": "assistant", "content": bot_response})

        # Keep history bounded
        if len(self.history) > self.max_history_turns * 2:
            self.history = self.history[-(self.max_history_turns * 2):]


def main():
    """Terminal Interface for PEAK AI Customer Support."""
    # Ensure UTF-8 output encoding for Windows consoles
    if sys.stdout.encoding.lower() != "utf-8":
        try:
            sys.stdout.reconfigure(encoding="utf-8")
        except Exception:
            pass

    chatbot = Chatbot()

    # Determine status dynamically from Ollama residency
    if chatbot.is_ready():
        status_text = "Status: Model ready"
    else:
        status_text = "Status: Loading Gemma 3 4B in background..."
        chatbot.start_background_warmup()

    print("=" * 50)
    print("PEAK AI Customer Support")
    print("=" * 50)
    print("Model: gemma3:4b")
    print("Knowledge base: loaded")
    print(status_text)
    print("Type 'exit' or 'quit' to stop.\n")

    while True:
        try:
            user_input = input("You: ").strip()

            if user_input.lower() in ("exit", "quit"):
                print("\nPEAK: Thank you for visiting PEAK. Have a great day!")
                break

            if not user_input:
                continue

            # Indicate status if first query is submitted during warm-up
            if not chatbot.is_ready():
                print("[Warming model in background, please wait...]")

            response = chatbot.process(user_input)
            print(f"\nPEAK: {response}\n")

        except (KeyboardInterrupt, EOFError):
            print("\n\nPEAK: Goodbye!")
            break
        except Exception as e:
            logger.error(f"Unexpected error during processing: {e}", exc_info=True)
            print("\nPEAK: Sorry, I'm temporarily unable to process that request. Please try again.\n")


if __name__ == "__main__":
    main()

