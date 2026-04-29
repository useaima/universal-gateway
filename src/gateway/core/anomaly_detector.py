import os
import json
import sqlite3
import numpy as np
from sklearn.ensemble import IsolationForest

class AnomalyDetector:
    """
    Telemetric ML Model for real-time anomaly detection.
    Uses Isolation Forest to detect abnormal transaction velocity and sizes.
    """
    def __init__(self, db_path="artifacts/logs/audit_v2.db"):
        self.db_path = db_path
        self.model = IsolationForest(contamination=0.05, random_state=42)
        self.is_trained = False

    def train(self):
        """Trains the Isolation Forest model on historical transaction data."""
        if not os.path.exists(self.db_path):
            return  # No data to train on

        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT payload FROM signed_statements WHERE action = 'STATE_PREFLIGHT'")
                rows = cursor.fetchall()

            data = []
            for r in rows:
                payload = json.loads(r[0])
                meta = payload.get("metadata", {})
                quote = meta.get("initial_quote")
                if quote is not None:
                    data.append([float(quote)])

            if len(data) > 10: # Minimum sample size
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
        if not self.is_trained:
            self.train()

        if not self.is_trained:
            return False # Default to false if not enough data to train

        X = np.array([[float(amount)]])
        prediction = self.model.predict(X)
        # IsolationForest returns -1 for anomalies, 1 for inliers
        is_anomaly = prediction[0] == -1
        
        if is_anomaly:
            print(f"[AnomalyDetector] 🚨 ANOMALY DETECTED for user {user_id}: Amount ${amount}")
            
        return is_anomaly
