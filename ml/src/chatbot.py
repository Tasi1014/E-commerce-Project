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
            "previous_entities": {},
            "last_user_message": None,
            "last_bot_message": None,
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
            "previous_entities": {},
            "last_user_message": None,
            "last_bot_message": None,
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
            "previous_entities": self._conversation_state["previous_entities"],
            "last_user_message": self._conversation_state["last_user_message"],
            "last_bot_message": self._conversation_state["last_bot_message"],
            "waiting_for": self._conversation_state["waiting_for"],
        }

    def _update_context(
        self,
        intent: Optional[str],
        topic: Optional[str],
        entities: Optional[Dict[str, Any]] = None,
        user_message: Optional[str] = None,
        bot_message: Optional[str] = None,
        waiting_for: Optional[str] = None,
    ) -> None:
        self._conversation_state["previous_intent"] = intent
        self._conversation_state["previous_topic"] = topic
        self._conversation_state["previous_entities"] = entities or {}
        self._conversation_state["last_user_message"] = user_message
        self._conversation_state["last_bot_message"] = bot_message
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
        Resolve only clear contextual follow-ups.

        Short messages are NOT automatically treated as follow-ups.
        The current message must contain a clear contextual signal.
        """

        previous_intent = self._conversation_state["previous_intent"]
        previous_topic = self._conversation_state["previous_topic"]
        previous_entities = self._conversation_state["previous_entities"]
        waiting_for = self._conversation_state["waiting_for"]

        if not previous_intent:
            return None

        message = message.strip()

        if not message:
            return None

        normalized = message.lower()

        # ---------------------------------------------------------------
        # Waiting for a missing order number
        # ---------------------------------------------------------------

        if waiting_for == "order_number":
            match = re.search(
                r"\bPK-[0-9A-Fa-f]{8}\b",
                message,
            )

            if match:
                return {
                    "intent": "order_tracking",
                    "topic": previous_topic,
                    "entities": {
                        "order_number": match.group(0).upper()
                    },
                    "social_type": None,
                    "is_prefiltered": False,
                    "is_followup": True,
                }

            # Do NOT automatically force unrelated messages
            # into order tracking.
            return None

        # ---------------------------------------------------------------
        # Clear order-tracking follow-ups
        # ---------------------------------------------------------------

        if previous_intent == "order_tracking":

            order_number = previous_entities.get("order_number")

            order_followup_patterns = [
                r"\bthat order\b",
                r"\bthis order\b",
                r"\bthe order\b",
                r"\bwhen will .* arrive\b",
                r"\bwhen will .* be delivered\b",
                r"\bwhen .* arrive\b",
                r"\bwhen .* delivered\b",
                r"\bwhat is the status\b",
                r"\bwhat's the status\b",
                r"\bstatus of (?:that|this|the) order\b",
                r"\bwhere is (?:that|this|the) order\b",
                r"\bhas .* been delivered\b",
                r"\bhas .* shipped\b",
                r"\bhas .* been shipped\b",
            ]

            is_order_followup = any(
                re.search(pattern, normalized)
                for pattern in order_followup_patterns
            )

            if is_order_followup and order_number:
                return {
                    "intent": "order_tracking",
                    "topic": None,
                    "entities": {
                        "order_number": order_number
                    },
                    "social_type": None,
                    "is_prefiltered": False,
                    "is_followup": True,
                }

        # ---------------------------------------------------------------
        # Payment follow-ups
        # ---------------------------------------------------------------

        if previous_intent == "payment_information":

            payment_followup_patterns = [
                r"^what about (?:cod|cash on delivery)$",
                r"^what about (?:that|this) payment method$",
                r"^and (?:cod|cash on delivery)$",
                r"^how about (?:cod|cash on delivery)$",
            ]

            is_payment_followup = any(
                re.search(pattern, normalized)
                for pattern in payment_followup_patterns
            )

            if is_payment_followup:
                # Let the LLM classify payment follow-ups.
                return None

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

            classification = {
                "intent": "general_faq",
                "topic": None,
                "entities": {},
                "social_type": social_type,
                "is_prefiltered": True,
                "is_followup": False,
            }

            self._update_context(
                intent=classification["intent"],
                topic=None,
                entities={},
                user_message=user_message,
            )

            return classification

        # ---------------------------------------------------------------
        # Contextual follow-up
        # ---------------------------------------------------------------

        followup = self._resolve_contextual_followup(user_message)

        if followup:
            logger.info(
                "Contextual follow-up resolved: %s",
                followup,
            )

            self._update_context(
                intent=followup["intent"],
                topic=followup["topic"],
                entities=followup["entities"],
                user_message=user_message,
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

        self._update_context(
            intent=classification["intent"],
            topic=classification["topic"],
            entities=classification["entities"],
            user_message=user_message,
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
                entities=entities,
                user_message=user_message,
                bot_message=response,
            )

            return response

        # ---------------------------------------------------------------
        # AI guardrail: out of scope
        # ---------------------------------------------------------------

        if intent == "out_of_scope":
            response = OUT_OF_SCOPE_RESPONSE

            self._update_context(
                intent=intent,
                topic=topic,
                entities=entities,
                user_message=user_message,
                bot_message=response,
            )

            return response

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

                if intent == "product_search":
                    response = (
                        "I couldn't retrieve the latest product information "
                        "right now. Please try again in a moment."
                    )
                else:
                    response = (
                        "I couldn't retrieve your order information right now. "
                        "Please try again in a moment."
                    )

                self._update_context(
                    intent=intent,
                    topic=topic,
                    entities=entities,
                    user_message=user_message,
                    bot_message=response,
                )

                return response

            # -----------------------------------------------------------
            # Order-specific guardrails
            # -----------------------------------------------------------

            if (
                intent == "order_tracking"
                and tool_result.get("error") == "Order number is required"
            ):
                response = (
                    "Sure, I can help you track your order. "
                    "Please provide your PEAK order number, for example "
                    "`PK-745B8012`."
                )

                self._update_context(
                    intent="order_tracking",
                    topic=topic,
                    entities=entities,
                    user_message=user_message,
                    bot_message=response,
                    waiting_for="order_number",
                )

                return response

            if (
                intent == "order_tracking"
                and tool_result.get("error") == "Order not found"
            ):
                response = (
                    "I couldn't find that order. Please check the order "
                    "number and make sure it belongs to your PEAK account."
                )

                self._update_context(
                    intent="order_tracking",
                    topic=topic,
                    entities=entities,
                    user_message=user_message,
                    bot_message=response,
                    waiting_for="order_number",
                )

                return response

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
                response = UNKNOWN_POLICY_RESPONSE

                self._update_context(
                    intent=intent,
                    topic=topic,
                    entities=entities,
                    user_message=user_message,
                    bot_message=response,
                )

                return response

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

            response = (
                "I'm sorry, I couldn't generate a response right now. "
                "Please try again in a moment."
            )

            self._update_context(
                intent=intent,
                topic=topic,
                entities=entities,
                user_message=user_message,
                bot_message=response,
            )

            return response

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
            entities=entities,
            user_message=user_message,
            bot_message=response,
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
            response = (
                "I can help you find products, but live product search "
                "is available through the application."
            )

            self._update_context(
                intent=intent,
                topic=classification.get("topic"),
                entities=classification.get("entities") or {},
                user_message=user_message,
                bot_message=response,
            )

            return response

        if intent == "order_tracking":

            entities = classification.get("entities") or {}

            if not entities.get("order_number"):
                response = (
                    "Sure, I can help you track your order. "
                    "Please provide your PEAK order number, for example "
                    "`PK-745B8012`."
                )

                self._update_context(
                    intent="order_tracking",
                    topic=classification.get("topic"),
                    entities=entities,
                    user_message=user_message,
                    bot_message=response,
                    waiting_for="order_number",
                )

                return response

            response = (
                "I can help you track that order, but live order tracking "
                "is available through the application."
            )

            self._update_context(
                intent="order_tracking",
                topic=classification.get("topic"),
                entities=entities,
                user_message=user_message,
                bot_message=response,
            )

            return response

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