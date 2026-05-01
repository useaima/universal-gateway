import os
import sqlite3

try:
    import numpy as np
except ImportError:  # pragma: no cover - optional hardening dependency
    np = None

try:
    from sklearn.ensemble import IsolationForest
except ImportError:  # pragma: no cover - optional hardening dependency
    IsolationForest = None

from core.audit_payloads import decode_audit_payload
from core.secure_paths import resolve_audit_db_path

class AnomalyDetector:
    """
    Telemetric ML Model for real-time anomaly detection.
    Uses Isolation Forest to detect abnormal transaction velocity and sizes.
    """
    def __init__(self, db_path=None):
        self.db_path = db_path or str(resolve_audit_db_path())
        self.model = (
            IsolationForest(contamination=0.05, random_state=42)
            if IsolationForest is not None and np is not None
            else None
        )
        self.is_trained = False
        self.backend_available = self.model is not None

    def train(self):
        """Trains the Isolation Forest model on readable historical transaction data."""
        if not self.backend_available:
            return
        if not os.path.exists(self.db_path):
            return  # No data to train on

        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                cursor = conn.cursor()
                cursor.execute(
                    "SELECT user_id, payload FROM signed_statements WHERE action = 'STATE_PREFLIGHT'"
                )
                rows = cursor.fetchall()

            data = []
            for r in rows:
                payload = decode_audit_payload(
                    r["payload"],
                    db_path=self.db_path,
                    user_id=r["user_id"],
                )
                if not isinstance(payload, dict):
                    continue
                meta = payload.get("metadata", {})
                quote = meta.get("initial_quote")
                if quote is not None:
                    data.append([float(quote)])

            if len(data) > 10:  # Minimum sample size
                X = np.array(data)
                self.model.fit(X)
                self.is_trained = True
                print(f"[AnomalyDetector] Trained model on {len(data)} transactions.")
        except Exception as e:
            print(f"[AnomalyDetector] Failed to train: {e}")

    def evaluate_transaction(self, amount: float, user_id: str = "system") -> bool:
        """
        Evaluates if the current transaction is an anomaly.
        Returns True if it IS an anomaly, False otherwise.
        """
        if not self.backend_available:
            return False

        if not self.is_trained:
            self.train()

        if not self.is_trained:
            return False  # Fall back to baseline HITL if there is not enough readable history.

        X = np.array([[float(amount)]])
        prediction = self.model.predict(X)
        # IsolationForest returns -1 for anomalies, 1 for inliers
        is_anomaly = prediction[0] == -1
        
        if is_anomaly:
            print(f"[AnomalyDetector] 🚨 ANOMALY DETECTED for user {user_id}: Amount ${amount}")
            
        return is_anomaly
