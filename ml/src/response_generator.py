"""
response_generator.py - Grounded Natural Language Response Generation for PEAK.

Converts retrieved authoritative PEAK knowledge-base facts into natural,
polite, and concise customer-support responses.

Strict grounding guardrails:
- The LLM is instructed to use ONLY the supplied facts from knowledge_base.json.
- Hallucination and invention of policies, fees, or timelines is strictly forbidden.
- If Ollama is unavailable or an error occurs, falls back cleanly to the verified FAQ answer.
"""

import time
import json
import logging
from typing import Any, Dict, Optional

import ollama

logger = logging.getLogger(__name__)

MODEL_NAME = "gemma3:4b"


class ResponseGenerator:
    def __init__(
        self,
        model_name: str = MODEL_NAME,
        temperature: float = 0.1,
        keep_alive: str = "60m",
        client: Optional[ollama.Client] = None,
    ):
        self.model_name = model_name
        self.temperature = temperature
        self.keep_alive = keep_alive
        self.client = client or ollama.Client()

    def generate(
        self,
        user_query: str,
        retrieved_facts: Dict[str, Any],
        context: Optional[Dict[str, Any]] = None,
    ) -> str:
        """
        Generates a natural-language response strictly grounded in retrieved facts.
        Falls back to raw FAQ answer if LLM fails.
        """
        raw_answer = retrieved_facts.get("faq_answer", "")

        # Format context into prompt
        facts_text = json.dumps(retrieved_facts, indent=2)

        context_str = ""
        if context:
            recent_user = context.get("last_user_message")
            recent_bot = context.get("last_bot_message")
            if recent_user and recent_bot:
                context_str = (
                    f"\nPrevious Turn:\nCustomer: {recent_user}\nPEAK Support: {recent_bot[:150]}\n"
                )

        prompt = f"""You are the official customer support assistant for PEAK, an online-only apparel & accessories store.

Generate a polite, concise, and helpful customer-support response to the customer's question using ONLY the authoritative PEAK facts provided below.

STRICT GROUNDING RULES:
1. Use ONLY the facts explicitly provided below. Every factual statement must be directly supported by the text below.
2. Do NOT invent policies, fees, dates, contact channels, URLs, or exceptions.
3. Do NOT combine unrelated facts (for example, Stripe is only for card payments; do NOT say COD is processed via Stripe).
4. Do NOT claim 24/7 phone or live chat availability unless explicitly stated in the provided facts.
5. Only if the customer's question is phrased as a direct yes/no question (e.g., contains "is it...", "can I...", "does PEAK...", "do you...", "yes or no?"), begin with a single-word "Yes." or "No." based strictly on the facts, then explain in 1-2 sentences.
6. For all other question types (what, how, who, explain, describe, or statements like "I received a defective item"), do NOT begin with Yes/No — answer directly and naturally, as a helpful support agent would.
7. If the facts do not contain the answer, state that the detail is not specified in PEAK store policies and direct the customer to info@peak.com.
8. Keep the response natural, professional, and concise (2 to 3 sentences).
{context_str}
AUTHORITATIVE PEAK FACTS:
{facts_text}

CUSTOMER QUESTION:
"{user_query}"

PEAK CUSTOMER SUPPORT RESPONSE:"""

        try:
            start_timer = time.perf_counter()
            response = self.client.chat(
                model=self.model_name,
                options={
                    "temperature": self.temperature,
                    "num_predict": 120,
                    "num_ctx": 2048,
                },
                keep_alive=self.keep_alive,
                messages=[{"role": "user", "content": prompt}],
            )

            elapsed = time.perf_counter() - start_timer
            print(f"LLM Call 2 completed in {elapsed:.2f} seconds", flush=True)
            
            generated_text = response.get("message", {}).get("content", "").strip()

            if generated_text:
                return generated_text

        except Exception as e:
            logger.error(f"ResponseGenerator Ollama call failed: {e}")

        # Fallback to deterministic raw FAQ answer
        return raw_answer if raw_answer else "Thank you for reaching out. Please contact PEAK customer support at info@peak.com or +977 9803901467 for further assistance."
