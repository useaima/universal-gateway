import sys
import os

# Add src/gateway to path
sys.path.insert(0, os.path.abspath("src/gateway"))

import asyncio
from core.audit_logger import AuditLogger
from core.safety_policy import SafetyPolicy
from core.browser_manager import human_delay
from core.hitl_manager import HITLManager
from core.anomaly_detector import AnomalyDetector

async def run_tests():
    print("--- 1. Testing SafetyPolicy ---")
    sp = SafetyPolicy()
    try:
        amt = sp.validate_price("49,99 €")
        print(f"[OK] Parsed European price successfully: {amt}")
    except Exception as e:
        print(f"[FAIL] Failed to parse price: {e}")
        
    try:
        sp.validate_price("$100.00")
        print("[FAIL] Failed: Should have thrown ValueError for >$50")
    except ValueError:
        print("[OK] Correctly rejected >$50 price")

    print(f"[OK] URL amazon.com allowed? {sp.is_domain_allowed('http://amazon.com')}") # Should be False
    print(f"[OK] URL https://amazon.com allowed? {sp.is_domain_allowed('https://amazon.com')}") # Should be True

    print("\n--- 2. Testing AuditLogger Chaining ---")
    logger = AuditLogger(log_dir="test_artifacts/logs")
    logger.log_signed_entry("test_user", "STATE_PREFLIGHT", {"metadata": {"initial_quote": "12.50"}})
    logger.log_signed_entry("test_user", "STATE_PREFLIGHT", {"metadata": {"initial_quote": "14.50"}})
    
    import sqlite3
    with sqlite3.connect(logger.db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT previous_hash FROM signed_statements ORDER BY id DESC LIMIT 2")
        rows = cursor.fetchall()
        print(f"[OK] Last two hashes: {rows[0][0][:10]}..., {rows[1][0][:10]}...")

    print("\n--- 3. Testing Anomaly Detector & HITL ---")
    hm = HITLManager(db_path="test_artifacts/logs/transactions.db")
    
    # Let's seed some data for Anomaly Detector
    for i in range(15):
        logger.log_signed_entry("test_user", "STATE_PREFLIGHT", {"metadata": {"initial_quote": "45.00"}})
    
    # The anomaly detector loads from logger.db_path by default
    # This should be an anomaly (way lower than 45, or we can just try a tiny amount)
    req_id = hm.request_signature("https://amazon.com", 1.0, "Test Item")
    print(f"[OK] Completed HITL Anomaly test, requested signature ID: {req_id}")
    
    with sqlite3.connect(hm.db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT required_signatures FROM pending_transactions WHERE id = ?", (req_id,))
        row = cursor.fetchone()
        print(f"[OK] Required Signatures for anomalous transaction: {row[0]}")


if __name__ == "__main__":
    os.environ["ALLOWED_DOMAINS"] = "amazon.com,ebay.com"
    asyncio.run(run_tests())
