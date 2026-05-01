import secrets
import hashlib
import sqlite3
import os
from datetime import datetime
from core.secure_paths import resolve_vault_db_path

class ApiKeyManager:
    """
    Manages API Keys for secure MCP server access and tracking.
    Stored in the local vault (SQLite).
    """
    def __init__(self, db_path=None):
        db_path = db_path or str(resolve_vault_db_path())
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS api_keys (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    key_hash TEXT UNIQUE,
                    name TEXT,
                    created_at TIMESTAMP,
                    last_used TIMESTAMP,
                    is_active INTEGER DEFAULT 1
                )
            ''')
            conn.commit()

    def generate_key(self, name: str) -> str:
        """Generates a new API key, stores the hash, and returns the raw key."""
        raw_key = f"utg_{secrets.token_urlsafe(32)}"
        key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
        
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                "INSERT INTO api_keys (key_hash, name, created_at) VALUES (?, ?, ?)",
                (key_hash, name, datetime.now().isoformat())
            )
            conn.commit()
        
        return raw_key

    def validate_key(self, raw_key: str) -> bool:
        """Validates a raw API key against the stored hashes."""
        if not raw_key:
            return False
            
        key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT id FROM api_keys WHERE key_hash = ? AND is_active = 1",
                (key_hash,)
            )
            row = cursor.fetchone()
            if row:
                conn.execute(
                    "UPDATE api_keys SET last_used = ? WHERE id = ?",
                    (datetime.now().isoformat(), row[0])
                )
                conn.commit()
                return True
        return False

    def list_keys(self):
        """Returns metadata for all keys."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT name, created_at, last_used FROM api_keys")
            return cursor.fetchall()
