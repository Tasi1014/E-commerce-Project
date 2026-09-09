from ollama import chat
import re

MODEL_NAME = "gemma3:4b"

INTENTS = [
    "product_search",
    "payment_information",
    "order_tracking",
    "purchase_return",
    "general_faq",
    "out_of_scope"
]

# ============================================
# Layer 1: Cheap pre-filter (no LLM call)
# ============================================

GREETING_PATTERNS = {
    "hi","Hi","Hiii","Hello", "hello", "hey", "hii", "hiii", "yo","hy",
    "thanks", "thank you", "thankyou", "ty",
    "ok", "okay", "k", "cool", "bye", "goodbye"
}

def pre_filter(query: str):
    """
    Handles trivial cases without calling the LLM.
    Returns an intent string if handled here, otherwise None.
    """
    normalized = query.strip().lower()
    normalized = re.sub(r"[!?.]+$", "", normalized)  # strip trailing punctuation

    if not normalized:
        return "out_of_scope"

    if normalized in GREETING_PATTERNS:
        return "general_faq"  # or route to a canned greeting response in Node.js

    return None


# ============================================
# Layer 2: Classification Prompt (single LLM call)
# ============================================

PROMPT_TEMPLATE = """
You are an e-commerce customer-support intent classifier.

Classify the customer query into EXACTLY ONE of these intents:

1. product_search
- Finding or checking products, brands, categories, colors, sizes, or availability.
- Examples: "Do you have black Nike shoes?", "Looking for wireless headphones."
- NOT physical store/location questions.

2. payment_information
- Payment methods, checkout, payment options, payment fees, or payment problems.
- Includes COD, eSewa, Khalti, Fonepay, UPI, cards, and mobile banking.
- Example: "Can I pay with eSewa?", "Cash on delivery?"

3. order_tracking
- Status, location, shipment, or delivery of an EXISTING order.
- Examples: "Where is my order?", "Has my order shipped?"

4. purchase_return
- Returns, refunds, exchanges, replacements, damaged/defective/wrong items,
  or return eligibility.
- Examples: "Can I return this?", "I want a refund."

5. general_faq
- General store and service questions.
- Includes delivery/shipping policies, delivery time, delivery charges,
  delivery areas, international shipping, free shipping, same-day delivery,
  and physical store information.
- Examples: "How long does delivery take?",
  "What is the delivery charge?",
  "Do you deliver outside Kathmandu?",
  "Where is your store?",
  "Do you have a physical store I can visit?"

6. out_of_scope
- The query is NOT related to shopping, products, payments, orders, returns,
  or store information at THIS store.
- Includes: greetings beyond simple hello, small talk, general knowledge questions,
  requests unrelated to e-commerce (weather, coding help, medical advice, etc.),
  and requests to speak to a human.
- Before choosing any other label, ask: "Does this query relate to shopping,
  products, payments, orders, or returns at this store?" If the answer is no,
  the label MUST be out_of_scope.
- Examples: "What's the weather today?", "Can I talk to a human?",
  "Do you sell electronics?" (if electronics isn't in this store's domain),
  "Tell me a joke.", "What medicine should I take for a headache?"

IMPORTANT BOUNDARIES:

- General delivery/shipping question → general_faq
- Existing order status/location/shipment → order_tracking
- Payment method or payment problem → payment_information
- Delivery/shipping cost → general_faq, NOT payment_information
- Product search/availability → product_search
- Return/refund/exchange/replacement → purchase_return
- Physical store/location/nearby store → general_faq, NOT product_search
- "Cash on delivery" → payment_information
- Anything unrelated to this store's shopping/payment/order/return/service domain → out_of_scope

Do not classify using a single keyword. Determine the customer's PRIMARY intent.
If the query is ambiguous between a real intent and out_of_scope, prefer out_of_scope
only when there is no reasonable e-commerce interpretation.

Customer query:
{query}

Return ONLY ONE exact label, with no punctuation or explanation:
product_search
payment_information
order_tracking
purchase_return
general_faq
out_of_scope
"""


def classify_query(query: str) -> str:
    """
    Classify a single customer query using Gemma 3 4B.
    Falls back to out_of_scope for empty/unparseable output.
    """

    response = chat(
        model=MODEL_NAME,
        options={"temperature": 0},  # deterministic output for classification
        messages=[
            {
                "role": "user",
                "content": PROMPT_TEMPLATE.format(query=query)
            }
        ]
    )

    raw_prediction = response["message"]["content"].strip().lower()

    # ============================================
    # Layer 3: Strict output validation
    # ============================================
    # Exact match first (expected case)
    if raw_prediction in INTENTS:
        return raw_prediction

    # Fallback: check if exactly one known intent appears as a whole word
    matches = [intent for intent in INTENTS if re.search(rf"\b{intent}\b", raw_prediction)]

    if len(matches) == 1:
        return matches[0]

    # Anything else (multiple matches, no match, malformed output)
    # defaults to out_of_scope rather than guessing
    return "out_of_scope"


def get_intent(query: str) -> str:
    """
    Full pipeline: pre-filter -> LLM classification -> validated output.
    This is the function the FastAPI /predict endpoint should call.
    """
    query = query.strip()

    pre_filtered = pre_filter(query)
    if pre_filtered is not None:
        return pre_filtered

    return classify_query(query)


# ============================================
# Interactive Interface
# ============================================

def main():

    print("=" * 50)
    print("E-Commerce Customer Support Intent Classifier")
    print("=" * 50)

    print(f"Model: {MODEL_NAME}")
    print("Type 'exit' or 'quit' to stop.\n")

    while True:

        query = input("You: ").strip()

        if query.lower() in ["exit", "quit"]:
            print("\nGoodbye!")
            break

        if not query:
            print("Please enter a query.\n")
            continue

        try:
            intent = get_intent(query)
            print(f"Intent: {intent}\n")

        except Exception as e:
            print(f"Error: {e}\n")


if __name__ == "__main__":
    main()