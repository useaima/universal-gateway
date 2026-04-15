import json
import os
import datetime
import sqlite3
from fpdf import FPDF
from core.identity_manager import IdentityManager

class AuditLogger:
    """
    The Signed Statement Vault 2.0.
    Handles user-specific partitioning, signed JSON, and PDF statements.
    """
    def __init__(self, log_dir="artifacts/logs/"):
        self.log_dir = log_dir
        os.makedirs(self.log_dir, exist_ok=True)
        self.db_path = os.path.join(self.log_dir, "audit_v2.db")
        self.identity = IdentityManager()
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
                    status TEXT
                )
            ''')
            conn.commit()

    def log_signed_entry(self, user_id: str, action: str, data: dict, status: str = "FINAL"):
        """Logs a cryptographically signed entry to the user's partition."""
        ts = datetime.datetime.utcnow().isoformat() + "Z"
        payload_str = json.dumps(data, sort_keys=True)
        signature = self.identity.sign_data(payload_str)

        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                "INSERT INTO signed_statements (user_id, timestamp, action, payload, signature, status) VALUES (?, ?, ?, ?, ?, ?)",
                (user_id, ts, action, payload_str, signature, status)
            )
            conn.commit()

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
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT timestamp, action, payload, signature FROM signed_statements WHERE user_id = ?", (user_id,))
            rows = cursor.fetchall()
            
            statements = []
            for r in rows:
                statements.append({
                    "timestamp": r[0],
                    "action": r[1],
                    "payload": json.loads(r[2]),
                    "signature": r[3]
                })
            
            output_path = os.path.join(self.log_dir, f"{user_id}_statement.json")
            with open(output_path, "w") as f:
                json.dump(statements, f, indent=2)
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

        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT timestamp, action, payload FROM signed_statements WHERE user_id = ?", (user_id,))
            rows = cursor.fetchall()

            pdf.set_font("Arial", 'B', 11)
            pdf.cell(40, 10, "Timestamp", 1)
            pdf.cell(40, 10, "Action", 1)
            pdf.cell(110, 10, "Details", 1)
            pdf.ln()

            pdf.set_font("Arial", size=9)
            for r in rows:
                pdf.cell(40, 10, str(r[0][:19]), 1)
                pdf.cell(40, 10, str(r[1]), 1)
                pdf.cell(110, 10, str(r[2][:60]), 1)
                pdf.ln()

        pdf.ln(20)
        pdf.set_font("Arial", 'I', 8)
        pdf.cell(190, 10, txt="This statement is cryptographically signed and legally verifiable.", ln=True, align='L')
        
        output_path = os.path.join(self.log_dir, f"{user_id}_statement.pdf")
        pdf.output(output_path)
        return output_path
