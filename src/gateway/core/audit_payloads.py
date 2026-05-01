import json
import sqlite3
from typing import Any

from cryptography.fernet import Fernet


def fetch_user_encryption_key(db_path: str, user_id: str | None) -> bytes | None:
    if not user_id:
        return None

    try:
        with sqlite3.connect(db_path) as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT encryption_key FROM user_encryption_keys WHERE user_id = ?",
                (user_id,),
            )
            row = cursor.fetchone()
    except sqlite3.Error:
        return None

    if not row or not row[0]:
        return None

    return str(row[0]).encode()


def decode_audit_payload(raw_payload: Any, *, db_path: str, user_id: str | None = None) -> Any:
    if raw_payload in (None, ""):
        return None

    if isinstance(raw_payload, (dict, list)):
        return raw_payload

    if not isinstance(raw_payload, str):
        return None

    try:
        return json.loads(raw_payload)
    except json.JSONDecodeError:
        pass

    user_key = fetch_user_encryption_key(db_path, user_id)
    if not user_key:
        return None

    try:
        decrypted = Fernet(user_key).decrypt(raw_payload.encode()).decode()
        return json.loads(decrypted)
    except Exception:
        return None
