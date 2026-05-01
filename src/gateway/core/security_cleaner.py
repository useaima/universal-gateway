import sqlite3
import os
import sys
from core.secure_paths import resolve_transactions_db_path

class SecurityCleaner:
    """
    Handles secure wiping of ephemeral session data (PINs, signatures) 
    after task completion to ensure no residue is left for malicious actors.
    """
    def __init__(self, db_path=None):
        self.db_path = db_path or str(resolve_transactions_db_path())

    def wipe_transaction_data(self, transaction_id: str):
        """Removes all traces of a transaction's signature shares and sensitive metadata."""
        if not os.path.exists(self.db_path):
            return

        print(f"[Security] Wiping ephemeral data for transaction: {transaction_id}", file=sys.stderr)
        try:
            with sqlite3.connect(self.db_path) as conn:
                # 1. Clear signature shares (The most sensitive part)
                conn.execute("DELETE FROM signature_shares WHERE transaction_id = ?", (transaction_id,))
                
                # 2. Update transaction status to SCRUBBED or remove if needed
                # We keep the transaction record for audit but scrub the details if required
                conn.execute("UPDATE pending_transactions SET item_details = '[SCRUBBED]' WHERE id = ?", (transaction_id,))
                
                conn.commit()
                print(f"✅ Secure wipe complete for {transaction_id}", file=sys.stderr)
        except Exception as e:
            print(f"⚠️ Security Wipe Failed: {e}", file=sys.stderr)

    def panic_wipe_all(self):
        """Emergency wipe of all pending signatures."""
        if not os.path.exists(self.db_path):
            return

        print("[!!!] PANIC WIPE INITIATED: Clearing all signature shares", file=sys.stderr)
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM signature_shares")
            conn.execute("UPDATE pending_transactions SET status = 'PANIC_RESET'")
            conn.commit()
