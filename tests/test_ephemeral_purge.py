import pytest
import os
import sqlite3
import tempfile
import sys
from src.gateway.core.security_cleaner import SecurityCleaner
from src.gateway.core.hitl_manager import HITLManager

@pytest.fixture
def mock_db_path():
    # Create a temporary DB file for testing to not corrupt production Vault
    fd, path = tempfile.mkstemp(suffix=".db")
    os.close(fd)
    yield path
    os.unlink(path)

def test_security_cleaner_wipes_shares(mock_db_path):
    # Setup HITL Manager with the test database
    hitl = HITLManager(db_path=mock_db_path)
    
    # 1. Simulate an Agent creating an intent
    txn_id = hitl.request_signature("mock_url", 1.0, "Test Transaction", ["Alvins_Share"])
    
    # 2. Simulate User providing the PIN/Signature
    hitl.submit_signature_share(txn_id, "Alvins_Share")
    
    # Verify signature exists
    with sqlite3.connect(mock_db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM signature_shares WHERE transaction_id=?", (txn_id,))
        assert cursor.fetchone()[0] == 1, "Signature share was not successfully added."

    # 3. Simulate the Ephemeral Purge (SecurityCleaner)
    cleaner = SecurityCleaner(db_path=mock_db_path)
    cleaner.wipe_transaction_data(txn_id)
    
    # 4. Verify signature is obliterated from the database
    with sqlite3.connect(mock_db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM signature_shares WHERE transaction_id=?", (txn_id,))
        assert cursor.fetchone()[0] == 0, "SecurityCleaner failed to wipe the sensitive signature shares!"

        # 5. Verify the Intent Details were scrubbed
        cursor.execute("SELECT item_details FROM pending_transactions WHERE id=?", (txn_id,))
        assert cursor.fetchone()[0] == "[SCRUBBED]", "SecurityCleaner failed to scrub transaction details."

def test_panic_wipe_all(mock_db_path):
    hitl = HITLManager(db_path=mock_db_path)
    txn_1 = hitl.request_signature("mock1", 1.0, "Details", ["Alvins_Share"])
    txn_2 = hitl.request_signature("mock2", 2.0, "Details", ["Alvins_Share"])
    
    hitl.submit_signature_share(txn_1, "Alvins_Share")
    hitl.submit_signature_share(txn_2, "Alvins_Share")
    
    cleaner = SecurityCleaner(db_path=mock_db_path)
    cleaner.panic_wipe_all()
    
    with sqlite3.connect(mock_db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM signature_shares")
        assert cursor.fetchone()[0] == 0, "Panic wipe failed to drop all signatures!"
