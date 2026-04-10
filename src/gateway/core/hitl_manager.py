import sqlite3
import uuid
import os
import json
import sys
from typing import List

class HITLManager:
    """
    Multi-Party Human-in-the-Loop Manager.
    Supports requiring multiple approvals (e.g., Alvins AND Alicia) before 
    unblocking a transaction.
    """
    def __init__(self, db_path="artifacts/logs/transactions.db"):
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        self.db_path = db_path
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
                    required_approvers TEXT
                )
            ''')
            
            # Migration: Check if required_approvers exist (for older DB files)
            cursor = conn.cursor()
            cursor.execute("PRAGMA table_info(pending_transactions)")
            columns = [info[1] for info in cursor.fetchall()]
            if 'required_approvers' not in columns:
                print(f"Migrating database: Adding 'required_approvers' column to {self.db_path}", file=sys.stderr)
                try:
                    conn.execute("ALTER TABLE pending_transactions ADD COLUMN required_approvers TEXT DEFAULT '[\"Alvins\"]'")
                except sqlite3.OperationalError as e:
                    print(f"Migration error (already exists?): {e}", file=sys.stderr)

            # Table to track individual approvals
            conn.execute('''
                CREATE TABLE IF NOT EXISTS individual_approvals (
                    transaction_id TEXT,
                    approver_name TEXT,
                    approved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (transaction_id, approver_name)
                )
            ''')
            conn.commit()

    def request_approval(self, url: str, amount: float, details: str, required_approvers: List[str] = None) -> str:
        transaction_id = str(uuid.uuid4())[:8]
        if not required_approvers:
            required_approvers = ["Alvins"] # Default to the owner
        
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                "INSERT INTO pending_transactions (id, url, item_details, amount, status, required_approvers) VALUES (?, ?, ?, ?, ?, ?)",
                (transaction_id, url, details, amount, "PENDING", json.dumps(required_approvers))
            )
            conn.commit()
        return transaction_id

    def get_status(self, transaction_id: str) -> str:
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            # 1. Check if transaction exists
            cursor.execute("SELECT status, required_approvers FROM pending_transactions WHERE id = ?", (transaction_id,))
            row = cursor.fetchone()
            if not row:
                return "NOT_FOUND"
            
            current_status, required_json = row
            if current_status != "PENDING":
                return current_status
            
            # 2. Check current approvals
            cursor.execute("SELECT approver_name FROM individual_approvals WHERE transaction_id = ?", (transaction_id,))
            approved_names = [r[0] for r in cursor.fetchall()]
            
            required_approvers = json.loads(required_json)
            
            missing = [a for a in required_approvers if a not in approved_names]
            
            if not missing:
                # Everyone has approved! Auto-update to APPROVED
                self._update_master_status(transaction_id, "APPROVED")
                return "APPROVED"
            
            return f"PENDING (Awaiting: {', '.join(missing)})"

    def approve(self, transaction_id: str, approver_name: str = "Alvins"):
        """Records an individual approval for a multi-party transaction."""
        with sqlite3.connect(self.db_path) as conn:
            try:
                conn.execute(
                    "INSERT INTO individual_approvals (transaction_id, approver_name) VALUES (?, ?)",
                    (transaction_id, approver_name)
                )
                conn.commit()
            except sqlite3.IntegrityError:
                pass # Already approved by this person
        
        # Trigger status check to see if we reached consensus
        return self.get_status(transaction_id)

    def reject(self, transaction_id: str):
        self._update_master_status(transaction_id, "REJECTED")

    def _update_master_status(self, transaction_id: str, status: str):
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("UPDATE pending_transactions SET status = ? WHERE id = ?", (status, transaction_id))
            conn.commit()
