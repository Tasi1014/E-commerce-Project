"""
faq.py - Knowledge Base Access Layer for PEAK E-Commerce Chatbot.

Loads, validates, and queries knowledge_base.json.
Maintains in-memory data as the single source of truth.
Provides:
- Exact FAQ retrieval by key
- Live dynamic intent -> topic keys mapping
- Pure data context extraction (without duplicating policy logic)
- Keyword matching as a safety net fallback
"""

import json
import os
import re
from pathlib import Path
from typing import Dict, List, Optional, Any


class KnowledgeBase:
    _instance: Optional["KnowledgeBase"] = None

    REQUIRED_TOP_LEVEL_KEYS = [
        "store_information",
        "shipping",
        "payment",
        "returns",
        "cancellation",
        "customer_support",
        "faqs",
    ]

    CATEGORY_TO_INTENT = {
        "general": "general_faq",
        "payment": "payment_information",
        "returns": "purchase_return",
    }

    INTENT_TO_CATEGORY = {
        "general_faq": "general",
        "payment_information": "payment",
        "purchase_return": "returns",
    }

    def __init__(self, kb_path: Optional[str] = None):
        if kb_path is None:
            # Default to ML/data/knowledge_base.json relative to this file
            base_dir = Path(__file__).resolve().parent.parent.parent
            kb_path = os.path.join(base_dir, "data", "knowledge_base.json")

        self.kb_path = Path(kb_path)
        self.data: Dict[str, Any] = {}
        self.faqs_by_key: Dict[str, dict] = {}
        self.faqs_by_id: Dict[str, dict] = {}
        self.topics_by_intent: Dict[str, List[str]] = {
            "general_faq": [],
            "payment_information": [],
            "purchase_return": [],
        }

        self._load_and_validate()

    def _load_and_validate(self) -> None:
        """Loads knowledge_base.json and performs strict validation."""
        if not self.kb_path.exists():
            raise FileNotFoundError(
                f"Knowledge base file not found at: {self.kb_path.resolve()}"
            )

        try:
            with open(self.kb_path, "r", encoding="utf-8") as f:
                self.data = json.load(f)
        except json.JSONDecodeError as e:
            raise ValueError(f"Corrupted or invalid JSON in {self.kb_path}: {e}") from e

        # Validate required top-level keys
        missing_keys = [k for k in self.REQUIRED_TOP_LEVEL_KEYS if k not in self.data]
        if missing_keys:
            raise ValueError(
                f"Knowledge base is missing required top-level keys: {missing_keys}"
            )

        faqs = self.data.get("faqs", [])
        if not isinstance(faqs, list) or not faqs:
            raise ValueError("Knowledge base 'faqs' section must be a non-empty list.")

        # Index FAQs and validate uniqueness
        seen_keys = set()
        seen_ids = set()

        for idx, faq in enumerate(faqs):
            faq_key = faq.get("key")
            faq_id = faq.get("id")

            if not faq_key or not isinstance(faq_key, str):
                raise ValueError(f"FAQ at index {idx} missing valid 'key'.")
            if not faq_id or not isinstance(faq_id, str):
                raise ValueError(f"FAQ at index {idx} missing valid 'id'.")

            if faq_key in seen_keys:
                raise ValueError(f"Duplicate FAQ key detected: '{faq_key}'. FAQ keys must be unique.")
            if faq_id in seen_ids:
                raise ValueError(f"Duplicate FAQ id detected: '{faq_id}'. FAQ ids must be unique.")

            seen_keys.add(faq_key)
            seen_ids.add(faq_id)
            self.faqs_by_key[faq_key] = faq
            self.faqs_by_id[faq_id] = faq

            category = faq.get("category", "")
            intent = self.CATEGORY_TO_INTENT.get(category)
            if intent and intent in self.topics_by_intent:
                self.topics_by_intent[intent].append(faq_key)

    def get_faq(self, key: str) -> Optional[dict]:
        """Retrieve a specific FAQ record by exact key."""
        return self.faqs_by_key.get(key)

    def get_topics_by_intent(self) -> Dict[str, List[str]]:
        """Return dynamically extracted topic keys for each intent."""
        return {k: list(v) for k, v in self.topics_by_intent.items()}

    def get_context_for_faq(self, faq_record: dict) -> dict:
        """
        Extract authoritative raw facts from knowledge_base.json corresponding to the FAQ.
        Does NOT duplicate policy rules in Python; directly returns the relevant
        structured sections from the loaded JSON.
        """
        context: Dict[str, Any] = {
            "faq_question": faq_record.get("question"),
            "faq_answer": faq_record.get("answer"),
        }

        category = faq_record.get("category", "")
        key = faq_record.get("key", "")

        # Attach corresponding raw KB section for grounding
        if category == "returns" or "return" in key or "refund" in key or "exchange" in key or "condition" in key:
            context["returns_policy"] = self.data.get("returns", {})
        elif "cod" in key:
            # Provide only COD facts to avoid model conflating card processors with cash payments
            context["cod_policy"] = self.data.get("payment", {}).get("cod", {})
        elif category == "payment" or "payment" in key or "currency" in key:
            context["payment_policy"] = self.data.get("payment", {})
        elif "ship" in key or "delivery" in key:
            context["shipping_policy"] = self.data.get("shipping", {})
        elif "cancel" in key:
            context["cancellation_policy"] = self.data.get("cancellation", {})
        elif "contact" in key or "support" in key or "hours" in key:
            context["customer_support"] = self.data.get("customer_support", {})
            context["store_information"] = self.data.get("store_information", {})
        else:
            context["store_information"] = self.data.get("store_information", {})

        return context

    def find_faq_by_keywords(self, query: str, category: Optional[str] = None) -> Optional[dict]:
        """
        Safety-net keyword fallback:
        Matches user query words against the 'keywords' array and question of each FAQ.
        Only called when LLM topic extraction is missing or invalid.
        """
        normalized_query = re.sub(r"[^\w\s]", " ", query.lower()).strip()
        query_tokens = set(normalized_query.split())

        if not query_tokens:
            return None

        best_match = None
        highest_score = 0

        # Filter candidate FAQs by category if specified
        candidates = self.data.get("faqs", [])
        if category:
            candidates = [f for f in candidates if f.get("category") == category]

        for faq in candidates:
            score = 0
            keywords = [k.lower() for k in faq.get("keywords", [])]

            # 1. Exact keyword phrase matching in query (high weight)
            for kw in keywords:
                if kw in normalized_query:
                    score += 5 + len(kw.split())

            # 2. Token overlap with keywords
            for kw in keywords:
                kw_tokens = set(re.sub(r"[^\w\s]", " ", kw).split())
                overlap = len(query_tokens & kw_tokens)
                if overlap > 0:
                    score += overlap

            # 3. Token overlap with question
            question_tokens = set(re.sub(r"[^\w\s]", " ", faq.get("question", "").lower()).split())
            score += len(query_tokens & question_tokens) * 0.5

            if score > highest_score and score >= 2.0:
                highest_score = score
                best_match = faq

        return best_match

    @classmethod
    def get_instance(cls, kb_path: Optional[str] = None) -> "KnowledgeBase":
        """Singleton accessor for KnowledgeBase."""
        if cls._instance is None:
            cls._instance = cls(kb_path)
        return cls._instance


# Module-level convenience functions
def get_knowledge_base(kb_path: Optional[str] = None) -> KnowledgeBase:
    return KnowledgeBase.get_instance(kb_path)


def get_faq(key: str) -> Optional[dict]:
    return get_knowledge_base().get_faq(key)


def get_topics_by_intent() -> Dict[str, List[str]]:
    return get_knowledge_base().get_topics_by_intent()


def find_faq_by_keywords(query: str, category: Optional[str] = None) -> Optional[dict]:
    return get_knowledge_base().find_faq_by_keywords(query, category)
