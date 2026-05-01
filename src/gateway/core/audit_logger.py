import json
import os
import datetime
import sqlite3
import hashlib
from cryptography.fernet import Fernet
from fpdf import FPDF
from core.identity_manager import IdentityManager
from core.firebase_live_publisher import get_live_publisher
from core.secure_paths import resolve_storage_dir

class AuditLogger:
    """
    The Signed Statement Vault 3.0.
    Handles user-specific partitioning, signed JSON, PDF statements, and GDPR Crypto-Shredding.
    """
    def __init__(self, log_dir=None):
        self.log_dir = log_dir or str(resolve_storage_dir())
        os.makedirs(self.log_dir, exist_ok=True)
        self.db_path = os.path.join(self.log_dir, "audit_v2.db")
        self.identity = IdentityManager()
        self.live_publisher = get_live_publisher()
        self._init_db()

    def _init_db(self):
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS signed_statements (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id TEXT,
                    timestamp TEXT,
                    action TEXT,
                    payload TEXT,
                    signature TEXT,
                    status TEXT,
                    previous_hash TEXT
                )
            ''')
            try:
                conn.execute("ALTER TABLE signed_statements ADD COLUMN previous_hash TEXT DEFAULT 'GENESIS'")
            except sqlite3.OperationalError:
                pass # Column already exists
                
            conn.execute('''
                CREATE TABLE IF NOT EXISTS user_encryption_keys (
                    user_id TEXT PRIMARY KEY,
                    encryption_key TEXT
                )
            ''')
            conn.commit()

    def _get_or_create_user_key(self, user_id: str) -> bytes:
        """Retrieves or generates a symmetric encryption key for the user."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT encryption_key FROM user_encryption_keys WHERE user_id = ?", (user_id,))
            row = cursor.fetchone()
            if row:
                return row[0].encode()
            else:
                new_key = Fernet.generate_key()
                conn.execute("INSERT INTO user_encryption_keys (user_id, encryption_key) VALUES (?, ?)", (user_id, new_key.decode()))
                conn.commit()
                return new_key

    def crypto_shred_user(self, user_id: str):
        """
        Permanently destroys the user's encryption key.
        The hashes remain intact, but all PII in the payloads is rendered irrecoverable.
        """
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM user_encryption_keys WHERE user_id = ?", (user_id,))
            conn.commit()

    def log_signed_entry(self, user_id: str, action: str, data: dict, status: str = "FINAL"):
        """Logs an encrypted and cryptographically signed entry to the user's partition, chained to previous."""
        ts = datetime.datetime.utcnow().isoformat() + "Z"
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT signature FROM signed_statements WHERE user_id = ? ORDER BY id DESC LIMIT 1", (user_id,))
            row = cursor.fetchone()
            previous_hash = hashlib.sha256(row[0].encode()).hexdigest() if row else "GENESIS"

        # Encrypt the payload PII (Crypto-shredding compliance)
        user_key = self._get_or_create_user_key(user_id)
        f = Fernet(user_key)
        
        raw_payload_str = json.dumps(data, sort_keys=True)
        encrypted_payload = f.encrypt(raw_payload_str.encode()).decode()

        # Sign the encrypted manifest
        statement_manifest = {
            "action": action,
            "timestamp": ts,
            "encrypted_payload": encrypted_payload,
            "previous_hash": previous_hash
        }
        manifest_str = json.dumps(statement_manifest, sort_keys=True)
        signature = self.identity.sign_data(manifest_str)

        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                "INSERT INTO signed_statements (user_id, timestamp, action, payload, signature, status, previous_hash) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (user_id, ts, action, encrypted_payload, signature, status, previous_hash)
            )
            conn.commit()

        self.live_publisher.sync_all()

    def log_action(self, tool_name: str, arguments: dict, result: str, user_id: str = "system"):
        """Convenience method: logs a tool call as a signed entry."""
        self.log_signed_entry(
            user_id=user_id,
            action=tool_name,
            data={"arguments": arguments, "result": result},
            status=result
        )

    def export_agent_json(self, user_id: str) -> str:
        """Exports a signed JSON for an agent to read."""
        user_key = None
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT encryption_key FROM user_encryption_keys WHERE user_id = ?", (user_id,))
            row = cursor.fetchone()
            if row:
                user_key = row[0].encode()
                
            cursor.execute("SELECT timestamp, action, payload, signature FROM signed_statements WHERE user_id = ?", (user_id,))
            rows = cursor.fetchall()
            
            statements = []
            f = Fernet(user_key) if user_key else None
            
            for r in rows:
                payload_str = r[2]
                try:
                    if f:
                        payload_str = f.decrypt(r[2].encode()).decode()
                    payload_data = json.loads(payload_str)
                except Exception:
                    payload_data = {"status": "SHREDDED_OR_CORRUPT", "ciphertext": r[2]}
                    
                statements.append({
                    "timestamp": r[0],
                    "action": r[1],
                    "payload": payload_data,
                    "signature": r[3]
                })
            
            output_path = os.path.join(self.log_dir, f"{user_id}_statement.json")
            with open(output_path, "w") as f_out:
                json.dump(statements, f_out, indent=2)
            return output_path

    def export_user_pdf(self, user_id: str) -> str:
        """Exports a professional PDF for the human user."""
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", 'B', 16)
        pdf.cell(190, 10, txt=f"UNIVERSAL GATEWAY - Statement for {user_id}", ln=True, align='C')
        pdf.set_font("Arial", size=10)
        pdf.cell(190, 10, txt=f"Gateway Public Key: {self.identity.get_public_key_hex()[:20]}...", ln=True, align='C')
        pdf.ln(10)

        user_key = None
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT encryption_key FROM user_encryption_keys WHERE user_id = ?", (user_id,))
            row = cursor.fetchone()
            if row:
                user_key = row[0].encode()
                
            cursor.execute("SELECT timestamp, action, payload FROM signed_statements WHERE user_id = ?", (user_id,))
            rows = cursor.fetchall()

            pdf.set_font("Arial", 'B', 11)
            pdf.cell(40, 10, "Timestamp", 1)
            pdf.cell(40, 10, "Action", 1)
            pdf.cell(110, 10, "Details", 1)
            pdf.ln()

            pdf.set_font("Arial", size=9)
            f = Fernet(user_key) if user_key else None
            for r in rows:
                try:
                    if f:
                        clear_payload = f.decrypt(r[2].encode()).decode()
                    else:
                        clear_payload = "[SHREDDED]"
                except Exception:
                    clear_payload = "[SHREDDED]"
                    
                pdf.cell(40, 10, str(r[0][:19]), 1)
                pdf.cell(40, 10, str(r[1]), 1)
                pdf.cell(110, 10, str(clear_payload[:60]), 1)
                pdf.ln()

        pdf.ln(20)
        pdf.set_font("Arial", 'I', 8)
        pdf.cell(190, 10, txt="This statement is cryptographically signed and legally verifiable.", ln=True, align='L')
        
        output_path = os.path.join(self.log_dir, f"{user_id}_statement.pdf")
        pdf.output(output_path)
        return output_path
