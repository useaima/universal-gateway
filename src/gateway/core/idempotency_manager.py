import sqlite3
import json
import time

from core.secure_paths import resolve_idempotency_db_path

class IdempotencyManager:
    """
    Ensures that high-stakes transactions are processed exactly once.
    Part of the 'Eva Protocol Stack' Consistency (CP) goal.
    """
    def __init__(self, db_path=None):
        if not db_path:
            db_path = str(resolve_idempotency_db_path())
            
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS idempotency_keys (
                    id_key TEXT PRIMARY KEY,
                    user_id TEXT,
                    status TEXT,
                    response_json TEXT,
                    timestamp REAL
                )
            ''')
            conn.commit()

    def check_key(self, id_key: str, user_id: str) -> dict:
        """Checks if a key has already been processed."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT status, response_json FROM idempotency_keys WHERE id_key = ? AND user_id = ?", (id_key, user_id))
            row = cursor.fetchone()
            if row:
                return {"status": row[0], "response": json.loads(row[1])}
        return None

    def lock_key(self, id_key: str, user_id: str):
        """Reserved for future use to prevent race conditions (Consistency priority)."""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                "INSERT INTO idempotency_keys (id_key, user_id, status, response_json, timestamp) VALUES (?, ?, ?, ?, ?)",
                (id_key, user_id, "PENDING", json.dumps({}), time.time())
            )
            conn.commit()

    def finalize_key(self, id_key: str, user_id: str, status: str, response: dict):
        """Saves the final result for a specific key."""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                "UPDATE idempotency_keys SET status = ?, response_json = ?, timestamp = ? WHERE id_key = ? AND user_id = ?",
                (status, json.dumps(response), time.time(), id_key, user_id)
            )
            conn.commit()
