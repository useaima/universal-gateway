import sqlite3
import uuid
import os
import json
import sys
from typing import List
from core.firebase_live_publisher import get_live_publisher

class HITLManager:
    """
    Multi-Party Computation (MPC) Signature Share Manager.
    Supports requiring multiple signature shares (e.g., Alvins AND Alicia) before 
    unblocking a non-custodial transaction.
    """
    def __init__(self, db_path=None):
        if not db_path:
            storage_dir = os.environ.get("UTG_STORAGE_DIR", "artifacts/logs")
            db_path = os.path.join(storage_dir, "transactions.db")
            
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        self.db_path = db_path
        self.live_publisher = get_live_publisher()
        self._init_db()

    def _init_db(self):
        with sqlite3.connect(self.db_path) as conn:
            # Main transaction table
            conn.execute('''
                CREATE TABLE IF NOT EXISTS pending_transactions (
                    id TEXT PRIMARY KEY,
                    url TEXT,
                    item_details TEXT,
                    amount REAL,
                    status TEXT,
                    required_signatures TEXT
                )
            ''')
            
            # Migration: Check if required_signatures exist (for older DB files)
            cursor = conn.cursor()
            cursor.execute("PRAGMA table_info(pending_transactions)")
            columns = [info[1] for info in cursor.fetchall()]
            if 'required_signatures' not in columns:
                print(f"Migrating database: Adding 'required_signatures' column to {self.db_path}", file=sys.stderr)
                try:
                    conn.execute("ALTER TABLE pending_transactions ADD COLUMN required_signatures TEXT DEFAULT '[\"Alvins_Share\"]'")
                except sqlite3.OperationalError as e:
                    print(f"Migration error (already exists?): {e}", file=sys.stderr)

            # Table to track individual signature shares
            conn.execute('''
                CREATE TABLE IF NOT EXISTS signature_shares (
                    transaction_id TEXT,
                    signer_name TEXT,
                    signed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (transaction_id, signer_name)
                )
            ''')
            conn.commit()

    def request_signature(self, url: str, amount: float, details: str, required_signatures: List[str] = None) -> str:
        from core.anomaly_detector import AnomalyDetector
        ad = AnomalyDetector() # The detector uses the main audit db
        is_anomaly = ad.evaluate_transaction(amount)

        transaction_id = str(uuid.uuid4())[:8]
        if not required_signatures:
            required_signatures = ["Alvins_Share"] # Default to the owner's share
            
        if is_anomaly and "Security_Admin_Share" not in required_signatures:
            print("[HITL] Anomaly detected! Elevating signature requirements to include Security_Admin_Share.", file=sys.stderr)
            required_signatures.append("Security_Admin_Share")
        
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                "INSERT INTO pending_transactions (id, url, item_details, amount, status, required_signatures) VALUES (?, ?, ?, ?, ?, ?)",
                (transaction_id, url, details, amount, "PENDING_SIGNATURES", json.dumps(required_signatures))
            )
            conn.commit()
        self.live_publisher.sync_all()
        return transaction_id

    def get_status(self, transaction_id: str) -> str:
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            # 1. Check if transaction exists
            cursor.execute("SELECT status, required_signatures FROM pending_transactions WHERE id = ?", (transaction_id,))
            row = cursor.fetchone()
            if not row:
                return "NOT_FOUND"
            
            current_status, required_json = row
            if current_status != "PENDING_SIGNATURES":
                return current_status
            
            # 2. Check current signature shares
            cursor.execute("SELECT signer_name FROM signature_shares WHERE transaction_id = ?", (transaction_id,))
            signed_names = [r[0] for r in cursor.fetchall()]
            
            required_signatures = json.loads(required_json)
            
            missing = [a for a in required_signatures if a not in signed_names]
            
            if not missing:
                # Everyone has provided their share! Auto-update to FULLY_SIGNED
                self._update_master_status(transaction_id, "FULLY_SIGNED")
                return "FULLY_SIGNED"
            
            return f"PENDING_SIGNATURES (Awaiting Shares: {', '.join(missing)})"

    def submit_signature_share(self, transaction_id: str, signer_name: str = "Alvins_Share"):
        """Records an individual MPC signature share for a transaction."""
        with sqlite3.connect(self.db_path) as conn:
            try:
                conn.execute(
                    "INSERT INTO signature_shares (transaction_id, signer_name) VALUES (?, ?)",
                    (transaction_id, signer_name)
                )
                conn.commit()
            except sqlite3.IntegrityError:
                pass # Already approved by this person

        self.live_publisher.sync_all()
        
        # Trigger status check to see if we reached consensus
        return self.get_status(transaction_id)

    def reject(self, transaction_id: str):
        self._update_master_status(transaction_id, "REJECTED")

    def _update_master_status(self, transaction_id: str, status: str):
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("UPDATE pending_transactions SET status = ? WHERE id = ?", (status, transaction_id))
            conn.commit()
        self.live_publisher.sync_all()
