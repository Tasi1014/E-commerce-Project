# ml/src/chatbot.py

import copy
import logging
import re
import threading
from typing import Any, Dict, Optional

from .classifier import IntentClassifier, ClassificationResult
from .response_generator import ResponseGenerator
from .tools.faq import KnowledgeBase


logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Responses
# ---------------------------------------------------------------------------

OUT_OF_SCOPE_RESPONSE = (
    "I'm here to help with PEAK's products, orders, payments, returns, "
    "and store information. I can't help with that request."
)

SOCIAL_RESPONSES = {
    "greeting": "Hello! Welcome to PEAK. How can I help you today?",
    "gratitude": (
        "You're very welcome! Please let me know if you have any other questions."
    ),
    "farewell": (
        "Goodbye! Thank you for shopping with PEAK. Have a wonderful day!"
    ),
    "affirmation": (
        "Understood! Let me know if there's anything else I can assist you with."
    ),
}

UNKNOWN_POLICY_RESPONSE = (
    "I'm sorry, I couldn't find specific information regarding that request in "
    "PEAK's current store policies. Please contact customer support at "
    "info@peak.com or +977 9803901467, and our team will be happy to assist you."
)


# ---------------------------------------------------------------------------
# Intent groups
# ---------------------------------------------------------------------------

LIVE_DATA_INTENTS = {
    "product_search",
    "order_tracking",
}

KB_INTENTS = {
    "payment_information",
    "purchase_return",
    "general_faq",
}


class Chatbot:

    def __init__(
        self,
        classifier: Optional[IntentClassifier] = None,
        response_generator: Optional[ResponseGenerator] = None,
        knowledge_base: Optional[KnowledgeBase] = None,
    ):
        self.classifier = classifier or IntentClassifier()
        self.response_generator = response_generator or ResponseGenerator()
        self.kb = knowledge_base or KnowledgeBase()

        self._conversation_state = {
            "previous_intent": None,
            "previous_topic": None,
            "waiting_for": None,
        }

        self._warmup_lock = threading.Lock()
        self._warmed_up = False

        logger.info("Chatbot initialized successfully.")

    # -----------------------------------------------------------------------
    # Session handling
    # -----------------------------------------------------------------------

    def create_session_instance(self) -> "Chatbot":
        """Create an independent chatbot session."""

        session_bot = Chatbot(
            classifier=self.classifier,
            response_generator=self.response_generator,
            knowledge_base=self.kb,
        )

        session_bot._conversation_state = copy.deepcopy(
            self._conversation_state
        )

        session_bot._warmed_up = self._warmed_up

        return session_bot

    def reset(self) -> None:
        """Reset conversation state."""

        self._conversation_state = {
            "previous_intent": None,
            "previous_topic": None,
            "waiting_for": None,
        }

    # -----------------------------------------------------------------------
    # Warm-up
    # -----------------------------------------------------------------------

    def warm_up(self) -> None:
        """Warm up both LLM components."""

        with self._warmup_lock:
            if self._warmed_up:
                return

            if hasattr(self.classifier, "warm_up"):
                self.classifier.warm_up()

            if hasattr(self.response_generator, "warm_up"):
                self.response_generator.warm_up()

            self._warmed_up = True

            logger.info("Chatbot warm-up completed.")

    # -----------------------------------------------------------------------
    # Context
    # -----------------------------------------------------------------------

    def _get_context(self) -> Dict[str, Any]:
        return {
            "previous_intent": self._conversation_state["previous_intent"],
            "previous_topic": self._conversation_state["previous_topic"],
            "waiting_for": self._conversation_state["waiting_for"],
        }

    def _update_context(
        self,
        intent: Optional[str],
        topic: Optional[str],
        waiting_for: Optional[str] = None,
    ) -> None:
        self._conversation_state["previous_intent"] = intent
        self._conversation_state["previous_topic"] = topic
        self._conversation_state["waiting_for"] = waiting_for

    # -----------------------------------------------------------------------
    # Social pre-filter
    # -----------------------------------------------------------------------

    def _pre_filter(self, message: str) -> Optional[str]:
        """Handle simple social messages without using the LLM."""

        normalized = message.strip().lower()

        greetings = {
            "hi",
            "hello",
            "hey",
            "hey there",
            "hi there",
            "good morning",
            "good afternoon",
            "good evening",
        }

        gratitude = {
            "thanks",
            "thank you",
            "thanks!",
            "thank you!",
            "thx",
            "appreciate it",
        }

        farewells = {
            "bye",
            "goodbye",
            "see you",
            "see you later",
            "good night",
        }

        if normalized in greetings:
            return SOCIAL_RESPONSES["greeting"]

        if normalized in gratitude:
            return SOCIAL_RESPONSES["gratitude"]

        if normalized in farewells:
            return SOCIAL_RESPONSES["farewell"]

        return None

    # -----------------------------------------------------------------------
    # Contextual follow-up
    # -----------------------------------------------------------------------

    def _resolve_contextual_followup(
        self,
        message: str,
    ) -> Optional[Dict[str, Any]]:
        """
        Resolve short follow-up messages using the existing conversation state.
        """

        previous_intent = self._conversation_state["previous_intent"]
        previous_topic = self._conversation_state["previous_topic"]
        waiting_for = self._conversation_state["waiting_for"]

        if not previous_intent:
            return None

        message = message.strip()

        if not message:
            return None

        # Previous turn requested a missing entity.
        if waiting_for:
            entities = {}

            if waiting_for == "order_number":
                match = re.search(
                    r"\bPK-[0-9A-Fa-f]{8}\b",
                    message,
                )

                if match:
                    entities["order_number"] = match.group(0).upper()

            return {
                "intent": previous_intent,
                "topic": previous_topic,
                "entities": entities,
                "social_type": None,
                "is_prefiltered": False,
                "is_followup": True,
            }

        # Short follow-up such as:
        # "What about Kathmandu?"
        # "What about COD?"
        if len(message.split()) <= 4:
            return {
                "intent": previous_intent,
                "topic": previous_topic,
                "entities": {},
                "social_type": None,
                "is_prefiltered": False,
                "is_followup": True,
            }

        return None

    # -----------------------------------------------------------------------
    # LLM CALL 1
    # -----------------------------------------------------------------------

    def classify_message(self, user_message: str) -> Dict[str, Any]:
        """
        Understand the customer message.

        This performs:
            - social pre-filter
            - contextual follow-up handling
            - LLM intent classification
            - topic extraction
            - entity extraction
            - classifier-level validation/guardrails

        It does NOT:
            - query MongoDB
            - execute ProductTool
            - execute OrderTool
            - generate the final response
        """

        if not isinstance(user_message, str):
            raise TypeError("user_message must be a string")

        user_message = user_message.strip()

        if not user_message:
            raise ValueError("user_message cannot be empty")

        if not self._warmed_up:
            self.warm_up()

        # ---------------------------------------------------------------
        # Social pre-filter
        # ---------------------------------------------------------------

        social_response = self._pre_filter(user_message)

        if social_response:
            social_type = None

            normalized = user_message.lower()

            if normalized in {
                "hi",
                "hello",
                "hey",
                "hey there",
                "hi there",
                "good morning",
                "good afternoon",
                "good evening",
            }:
                social_type = "greeting"

            elif normalized in {
                "thanks",
                "thank you",
                "thanks!",
                "thank you!",
                "thx",
                "appreciate it",
            }:
                social_type = "gratitude"

            elif normalized in {
                "bye",
                "goodbye",
                "see you",
                "see you later",
                "good night",
            }:
                social_type = "farewell"

            return {
                "intent": "general_faq",
                "topic": None,
                "entities": {},
                "social_type": social_type,
                "is_prefiltered": True,
                "is_followup": False,
            }

        # ---------------------------------------------------------------
        # Contextual follow-up
        # ---------------------------------------------------------------

        followup = self._resolve_contextual_followup(user_message)

        if followup:
            logger.info(
                "Contextual follow-up resolved: %s",
                followup,
            )
            return followup

        # ---------------------------------------------------------------
        # LLM classification
        # ---------------------------------------------------------------

        result: ClassificationResult = self.classifier.classify(
            user_message,
            context=self._get_context(),
        )

        classification = {
            "intent": result.intent,
            "topic": result.topic,
            "entities": result.entities or {},
            "social_type": result.social_type,
            "is_prefiltered": result.is_prefiltered,
            "is_followup": False,
        }

        logger.info(
            "Classification: intent=%s, topic=%s, entities=%s",
            classification["intent"],
            classification["topic"],
            classification["entities"],
        )

        return classification

    # -----------------------------------------------------------------------
    # KB retrieval
    # -----------------------------------------------------------------------

    def retrieve_kb_facts(
        self,
        classification: Dict[str, Any],
        user_message: str,
    ) -> Dict[str, Any]:
        """
        Retrieve authoritative facts from knowledge_base.json.

        Topic lookup is attempted first.
        Keyword matching is the safety-net fallback already implemented
        by faq.py.
        """

        intent = classification.get("intent")
        topic = classification.get("topic")

        if intent not in KB_INTENTS:
            return {}

        # ---------------------------------------------------------------
        # Primary topic-based retrieval
        # ---------------------------------------------------------------

        if topic:
            faq = self.kb.get_faq(topic)

            if faq:
                return self.kb.get_context_for_faq(faq)

        # ---------------------------------------------------------------
        # Existing keyword fallback
        # ---------------------------------------------------------------

        category = self.kb.INTENT_TO_CATEGORY.get(intent)

        faq = self.kb.find_faq_by_keywords(
            user_message,
            category=category,
        )

        if faq:
            logger.info(
                "KB keyword fallback matched FAQ: %s",
                faq.get("key"),
            )

            return self.kb.get_context_for_faq(faq)

        return {}

    # -----------------------------------------------------------------------
    # LLM CALL 2
    # -----------------------------------------------------------------------

    def generate_response(
        self,
        user_message: str,
        classification: Dict[str, Any],
        tool_result: Optional[Dict[str, Any]] = None,
    ) -> str:
        """
        Generate the final response.

        For KB intents:
            Python retrieves authoritative KB facts.

        For live-data intents:
            Node provides tool_result.

        ResponseGenerator then turns the trusted information into the
        final natural-language response.
        """

        intent = classification.get("intent")
        topic = classification.get("topic")
        entities = classification.get("entities") or {}
        social_type = classification.get("social_type")

        # ---------------------------------------------------------------
        # Social
        # ---------------------------------------------------------------

        if social_type in SOCIAL_RESPONSES:
            response = SOCIAL_RESPONSES[social_type]

            self._update_context(
                intent=intent,
                topic=topic,
            )

            return response

        # ---------------------------------------------------------------
        # AI guardrail: out of scope
        # ---------------------------------------------------------------

        if intent == "out_of_scope":
            self._update_context(
                intent=intent,
                topic=topic,
            )

            return OUT_OF_SCOPE_RESPONSE

        # ---------------------------------------------------------------
        # Live-data intents
        # ---------------------------------------------------------------

        if intent in LIVE_DATA_INTENTS:

            # Node should have executed the required tool before
            # generate_response() is called.

            if tool_result is None:
                logger.warning(
                    "No tool result supplied for live-data intent: %s",
                    intent,
                )

                # This prevents the LLM from inventing live data.
                if intent == "product_search":
                    return (
                        "I couldn't retrieve the latest product information "
                        "right now. Please try again in a moment."
                    )

                return (
                    "I couldn't retrieve your order information right now. "
                    "Please try again in a moment."
                )

            # -----------------------------------------------------------
            # Order-specific guardrails
            # -----------------------------------------------------------

            if (
                intent == "order_tracking"
                and tool_result.get("error") == "Order number is required"
            ):
                self._update_context(
                    intent="order_tracking",
                    topic=topic,
                    waiting_for="order_number",
                )

                return (
                    "Sure, I can help you track your order. "
                    "Please provide your PEAK order number, for example "
                    "`PK-745B8012`."
                )

            if (
                intent == "order_tracking"
                and tool_result.get("error") == "Order not found"
            ):
                self._update_context(
                    intent="order_tracking",
                    topic=topic,
                    waiting_for="order_number",
                )

                return (
                    "I couldn't find that order. Please check the order "
                    "number and make sure it belongs to your PEAK account."
                )

        # ---------------------------------------------------------------
        # Static KB intents
        # ---------------------------------------------------------------

        kb_facts = {}

        if intent in KB_INTENTS:
            kb_facts = self.retrieve_kb_facts(
                classification,
                user_message,
            )

            # AI guardrail:
            # Never allow the LLM to invent a PEAK policy when the KB
            # contains no authoritative information for the request.
            if not kb_facts:
                self._update_context(
                    intent=intent,
                    topic=topic,
                )

                return UNKNOWN_POLICY_RESPONSE

        # ---------------------------------------------------------------
        # Prepare trusted information
        # ---------------------------------------------------------------

        retrieved_facts = {
            "intent": intent,
            "topic": topic,
            "entities": entities,
        }

        if kb_facts:
            retrieved_facts["knowledge_base"] = kb_facts

        if tool_result:
            retrieved_facts["tool_result"] = tool_result

        # ---------------------------------------------------------------
        # LLM CALL 2
        # ---------------------------------------------------------------

        try:
            response = self.response_generator.generate(
                user_query=user_message,
                retrieved_facts=retrieved_facts,
                context=self._get_context(),
            )

        except Exception:
            logger.exception("Response generation failed.")

            return (
                "I'm sorry, I couldn't generate a response right now. "
                "Please try again in a moment."
            )

        # ---------------------------------------------------------------
        # Conversation state
        # ---------------------------------------------------------------

        waiting_for = None

        if (
            intent == "order_tracking"
            and not entities.get("order_number")
            and (
                tool_result is None
                or tool_result.get("error") == "Order number is required"
            )
        ):
            waiting_for = "order_number"

        self._update_context(
            intent=intent,
            topic=topic,
            waiting_for=waiting_for,
        )

        return response

    # -----------------------------------------------------------------------
    # Legacy terminal interface
    # -----------------------------------------------------------------------

    def process(
        self,
        user_message: str,
        user_id: Optional[str] = None,
    ) -> str:
        """
        Local/terminal compatibility method.

        Production API should use:
            classify_message()
            generate_response()

        Live MongoDB data cannot be accessed through this method because
        ProductTool and OrderTool belong to Node.js.
        """

        classification = self.classify_message(user_message)

        intent = classification.get("intent")

        if classification.get("social_type"):
            return self.generate_response(
                user_message,
                classification,
            )

        if intent == "out_of_scope":
            return self.generate_response(
                user_message,
                classification,
            )

        if intent == "product_search":
            return (
                "I can help you find products, but live product search "
                "is available through the application."
            )

        if intent == "order_tracking":

            entities = classification.get("entities") or {}

            if not entities.get("order_number"):
                self._update_context(
                    intent="order_tracking",
                    topic=classification.get("topic"),
                    waiting_for="order_number",
                )

                return (
                    "Sure, I can help you track your order. "
                    "Please provide your PEAK order number, for example "
                    "`PK-745B8012`."
                )

            return (
                "I can help you track that order, but live order tracking "
                "is available through the application."
            )

        return self.generate_response(
            user_message,
            classification,
        )


# ---------------------------------------------------------------------------
# Terminal mode
# ---------------------------------------------------------------------------

if __name__ == "__main__":

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname)s | %(message)s",
    )

    bot = Chatbot()

    print("Warming up chatbot...")
    bot.warm_up()

    print("\nPEAK Chatbot")
    print("Type 'exit' to quit.\n")

    while True:
        try:
            user_input = input("You: ").strip()

            if user_input.lower() in {"exit", "quit"}:
                print("Bot: Goodbye!")
                break

            if not user_input:
                continue

            response = bot.process(user_input)

            print(f"Bot: {response}\n")

        except KeyboardInterrupt:
            print("\nBot: Goodbye!")
            break

        except Exception:
            logger.exception("Terminal chatbot error.")

            print(
                "Bot: Sorry, something went wrong. "
                "Please try again.\n"
            )