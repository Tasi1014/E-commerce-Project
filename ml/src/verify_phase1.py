"""
verify_phase1.py - Automated Verification Suite for Phase 1 Customer Support Chatbot.
"""

import sys
import os
import time

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
if sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from ML.src.tools.faq import get_knowledge_base
from ML.src.classifier import IntentClassifier, pre_filter
from ML.src.chatbot import Chatbot, MODEL_READY


def run_tests():
    print("=" * 65)
    print("PHASE 1 CHATBOT IMPROVEMENT & VERIFICATION SUITE")
    print("=" * 65)

    # 1. Test Knowledge Base
    print("\n[TEST 1] Knowledge Base Loading & Dynamic Topic Extraction")
    kb = get_knowledge_base()
    topics = kb.get_topics_by_intent()
    print(f"Loaded {len(kb.faqs_by_key)} FAQs.")
    assert "not_accepted_payment" in topics["payment_information"]
    assert "store_hours" in topics["general_faq"]
    assert "condition_required" in topics["purchase_return"]
    print("✓ Knowledge base verified with new dedicated topics.")

    # 2. Test Pre-filter with informal greetings
    print("\n[TEST 2] Social & Empty Pre-Filter (0 LLM Calls)")
    for text in ["hello", "hy", "heyy", "thanks so much", "goodbye", "okay"]:
        res = pre_filter(text)
        assert res is not None and res.social_type is not None, f"Failed for {text}"
        print(f" - '{text}' -> {res.social_type} (pre-filtered)")
    empty_res = pre_filter("   ")
    assert empty_res.intent == "out_of_scope"
    print("✓ Pre-filter verified successfully.")

    # 3. Model warm-up & Readiness
    chatbot = Chatbot()
    print("\nWarming up model (if not already warm)...")
    chatbot.start_background_warmup()
    chatbot.wait_until_ready(timeout=300.0)
    assert chatbot.is_ready()
    print("✓ Model status is MODEL_READY.")

    # 4. Standalone Direct Queries
    print("\n[TEST 3] Standalone Factual Queries (Direct or Tailored)")
    standalone_cases = [
        ("Do you accept eSewa?", ["not accept esewa", "does not accept esewa"]),
        ("Where is your store located?", ["online-only store", "don't currently have a physical retail location"]),
        ("What are your store hours?", ["online-only store", "24/7"]),
        ("What is your delivery charge?", ["orders under $150 have a flat shipping fee of $9.99"]),
    ]
    for q, expected_snippets in standalone_cases:
        reply = chatbot.process(q)
        print(f"\nQuery: \"{q}\"")
        print(f"  Reply: \"{reply}\"")
        matched = any(s.lower() in reply.lower() for s in expected_snippets)
        assert matched, f"Failed for {q}: {reply}"
    print("✓ Standalone factual queries answered accurately.")

    # 5. Conditional & Yes/No Queries (Tagged item, Sale item)
    print("\n[TEST 4] Conditional & Direct Yes/No Inquiries")
    cond_q = "If the tag is removed is the product still refundable?"
    cond_r = chatbot.process(cond_q)
    print(f"\nConditional Query: \"{cond_q}\"")
    print(f"  Reply: \"{cond_r}\"")
    assert cond_r.strip().lower().startswith("no") or "cannot be returned" in cond_r.lower() or "not eligible" in cond_r.lower()
    print("✓ Answered conditional tag removal inquiry correctly.")

    # 6. Multi-Turn Conversational Follow-Up Tests
    print("\n[TEST 5] Multi-Turn Conversational Follow-Up Flows")

    # Flow A: Return policy -> What if I removed the tag?
    chatbot.reset()
    fa_q1 = "What is your return policy?"
    fa_r1 = chatbot.process(fa_q1)
    print(f"\nFlow A Turn 1: \"{fa_q1}\"")
    print(f"Reply: \"{fa_r1}\"")

    fa_q2 = "What if I removed the tag?"
    fa_r2 = chatbot.process(fa_q2)
    print(f"Flow A Turn 2 (Follow-up): \"{fa_q2}\"")
    print(f"Reply: \"{fa_r2}\"")
    assert chatbot.previous_topic == "condition_required" or "tag" in fa_r2.lower()
    assert "no" in fa_r2.lower() or "cannot" in fa_r2.lower() or "not" in fa_r2.lower() or "unworn" in fa_r2.lower()
    print("✓ Tag removal follow-up resolved to condition/tag policy.")

    # Flow B: Shipping cost Nepal -> Only for inside Nepal?
    chatbot.reset()
    fb_q1 = "What's the shipping cost inside Nepal?"
    fb_r1 = chatbot.process(fb_q1)
    print(f"\nFlow B Turn 1: \"{fb_q1}\"")
    print(f"Reply: \"{fb_r1}\"")

    fb_q2 = "Only for inside Nepal?"
    fb_r2 = chatbot.process(fb_q2)
    print(f"Flow B Turn 2 (Follow-up): \"{fb_q2}\"")
    print(f"Reply: \"{fb_r2}\"")
    assert "nepal" in fb_r2.lower() and ("9.99" in fb_r2.lower() or "150" in fb_r2.lower())
    print("✓ Domestic shipping follow-up answered specifically.")

    # Flow C: COD -> What about internationally?
    chatbot.reset()
    fc_q1 = "Can I pay with COD?"
    fc_r1 = chatbot.process(fc_q1)
    print(f"\nFlow C Turn 1: \"{fc_q1}\"")
    print(f"Reply: \"{fc_r1}\"")

    fc_q2 = "What about internationally?"
    fc_r2 = chatbot.process(fc_q2)
    print(f"Flow C Turn 2 (Follow-up): \"{fc_q2}\"")
    print(f"Reply: \"{fc_r2}\"")
    assert "international" in fc_r2.lower() and ("not" in fc_r2.lower() or "nepal" in fc_r2.lower())
    print("✓ International COD follow-up answered specifically.")

    # Flow D: Sale items return -> yes or no?
    chatbot.reset()
    fd_q1 = "Can I return an item bought during a sale?"
    fd_r1 = chatbot.process(fd_q1)
    print(f"\nFlow D Turn 1: \"{fd_q1}\"")
    print(f"Reply: \"{fd_r1}\"")

    fd_q2 = "yes or no?"
    fd_r2 = chatbot.process(fd_q2)
    print(f"Flow D Turn 2 (Follow-up): \"{fd_q2}\"")
    print(f"Reply: \"{fd_r2}\"")
    assert fd_r2.strip().lower().startswith("no") or "final sale" in fd_r2.lower() or "clearance" in fd_r2.lower()
    print("✓ 'yes or no?' follow-up resolved previous topic and answered directly.")

    print("\n" + "=" * 65)
    print("ALL CONVERSATIONAL IMPROVEMENT TESTS PASSED SUCCESSFULLY!")
    print("=" * 65)


if __name__ == "__main__":
    run_tests()
