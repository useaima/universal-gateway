import json
import os
import sqlite3
import sys
import threading
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List

try:
    import firebase_admin
    from firebase_admin import credentials, db as firebase_db
except ImportError:  # pragma: no cover - dependency may not be present in all environments
    firebase_admin = None
    credentials = None
    firebase_db = None

DEFAULT_DATABASE_URL = "https://universal-transaction-gateway-default-rtdb.europe-west1.firebasedatabase.app"

_publisher = None
_publisher_lock = threading.Lock()


def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


class FirebaseLivePublisher:
    def __init__(self):
        self.enabled = False
        self.storage_dir = os.environ.get("UTG_STORAGE_DIR", "artifacts/logs")
        self.transactions_db_path = os.path.join(self.storage_dir, "transactions.db")
        self.audit_db_path = os.path.join(self.storage_dir, "audit_v2.db")
        self.database_url = os.environ.get("FIREBASE_DATABASE_URL") or DEFAULT_DATABASE_URL

        if not firebase_admin or not firebase_db:
            print("[RTDB] firebase-admin is unavailable; live dashboard publishing is disabled.", file=sys.stderr)
            return

        try:
            self._ensure_app()
            self.root_ref = firebase_db.reference("dashboard_live")
            self.enabled = True
        except Exception as error:  # pragma: no cover - depends on environment credentials
            print(f"[RTDB] Firebase Admin initialization failed: {error}", file=sys.stderr)
            self.enabled = False

    def _ensure_app(self):
        if firebase_admin._apps:
            return firebase_admin.get_app()

        options = {"databaseURL": self.database_url}
        credentials_json = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS_JSON")
        credentials_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")

        if credentials_json and credentials:
            parsed = json.loads(credentials_json)
            return firebase_admin.initialize_app(credentials.Certificate(parsed), options)

        if credentials_path and os.path.exists(credentials_path) and credentials:
            return firebase_admin.initialize_app(credentials.Certificate(credentials_path), options)

        if credentials:
            return firebase_admin.initialize_app(credentials.ApplicationDefault(), options)

        return firebase_admin.initialize_app(options=options)

    def sync_all(self):
        if not self.enabled:
            return

        try:
            transactions = self._build_transactions_snapshot()
            summary, throughput = self._build_aggregates(transactions)
            self.root_ref.set(
                {
                    "summary": summary,
                    "throughput_30d": throughput,
                    "transactions": transactions,
                }
            )
        except Exception as error:
            print(f"[RTDB] Sync failed: {error}", file=sys.stderr)

    def _build_transactions_snapshot(self) -> Dict[str, Dict[str, Any]]:
        current = self.root_ref.child("transactions").get() or {}
        transactions: Dict[str, Dict[str, Any]] = {}

        for row in self._query_rows(
            self.transactions_db_path,
            """
            SELECT id, url, item_details, amount, status, required_signatures
            FROM pending_transactions
            ORDER BY id
            """,
        ):
            tx_id = row["id"]
            transactions[tx_id] = self._build_hitl_transaction(row, current.get(tx_id))

        for row in self._query_rows(
            self.audit_db_path,
            """
            SELECT id, user_id, timestamp, action, payload, status
            FROM signed_statements
            ORDER BY id ASC
            """,
        ):
            self._merge_audit_transaction(transactions, row, current)

        return transactions

    def _query_rows(self, db_path: str, query: str) -> List[sqlite3.Row]:
        if not os.path.exists(db_path):
            return []

        try:
            with sqlite3.connect(db_path) as conn:
                conn.row_factory = sqlite3.Row
                cursor = conn.cursor()
                cursor.execute(query)
                return cursor.fetchall()
        except sqlite3.Error as error:
            print(f"[RTDB] SQLite read failed for {db_path}: {error}", file=sys.stderr)
            return []

    def _build_hitl_transaction(self, row: sqlite3.Row, existing: Dict[str, Any] | None) -> Dict[str, Any]:
        created_at = (existing or {}).get("createdAt") or _utc_now_iso()
        updated_at = _utc_now_iso()
        status_raw = str(row["status"] or "PENDING_SIGNATURES")
        requested_action = str(row["item_details"] or "Pending gateway action")
        target = str(row["url"] or "Policy-controlled route")
        required_signatures = self._safe_json_load(row["required_signatures"]) or []
        reason = self._reason_from_status(status_raw, required_signatures)

        return {
            "id": row["id"],
            "agent": (existing or {}).get("agent") or "Safety Sandwich",
            "userId": (existing or {}).get("userId") or "system",
            "network": self._infer_network(target, requested_action),
            "target": target,
            "itemDetails": requested_action,
            "amount": float(row["amount"] or 0),
            "statusRaw": status_raw,
            "statusUi": self._status_ui(status_raw),
            "reasoning": reason,
            "gas": (existing or {}).get("gas") or "Policy-controlled",
            "contract": (existing or {}).get("contract") or "",
            "payload": json.dumps(
                {
                    "url": target,
                    "itemDetails": requested_action,
                    "requiredSignatures": required_signatures,
                },
                sort_keys=True,
            ),
            "timeline": self._timeline_from_status(status_raw),
            "createdAt": created_at,
            "updatedAt": updated_at,
            "policyReason": reason,
            "requestedAction": requested_action,
            "policyRule": self._policy_rule_from_status(status_raw, required_signatures),
        }

    def _merge_audit_transaction(self, transactions: Dict[str, Dict[str, Any]], row: sqlite3.Row, current: Dict[str, Any]):
        payload = self._safe_json_load(row["payload"])
        action = str(row["action"] or "")
        timestamp = str(row["timestamp"] or _utc_now_iso())

        if action.startswith("STATE_") and isinstance(payload, dict):
            transaction_id = payload.get("transaction_id") or payload.get("session_id") or f"audit-{row['id']}"
            state = str(payload.get("state") or action.replace("STATE_", ""))
            task = self._humanize_agent(str(payload.get("task") or "Gateway Runtime"))
            metadata = payload.get("metadata") if isinstance(payload.get("metadata"), dict) else {}
            existing = transactions.get(transaction_id) or self._base_transaction(transaction_id, current.get(transaction_id), timestamp)

            timeline = self._merge_timeline(existing.get("timeline"), self._timeline_label_for_state(state, metadata))
            amount = existing.get("amount", 0)
            if metadata.get("initial_quote") is not None:
                try:
                    amount = float(metadata["initial_quote"])
                except (TypeError, ValueError):
                    pass

            existing.update(
                {
                    "id": transaction_id,
                    "agent": existing.get("agent") or task,
                    "userId": str(payload.get("user_id") or row["user_id"] or existing.get("userId") or "system"),
                    "amount": amount,
                    "statusRaw": state,
                    "statusUi": self._status_ui(state),
                    "reasoning": str(metadata.get("error") or metadata.get("result") or f"{task} lifecycle reached {state.title()}."),
                    "payload": json.dumps(payload, sort_keys=True),
                    "timeline": timeline,
                    "updatedAt": timestamp,
                    "policyReason": str(metadata.get("error") or existing.get("policyReason") or "Gateway lifecycle checkpoint."),
                    "policyRule": existing.get("policyRule") or "Lifecycle record derived from gateway audit state.",
                }
            )
            transactions[transaction_id] = existing
            return

        if not isinstance(payload, dict):
            return

        transaction_id = payload.get("transaction_id") or payload.get("tx_hash") or f"audit-{row['id']}"
        existing = transactions.get(transaction_id) or self._base_transaction(transaction_id, current.get(transaction_id), timestamp)
        status_raw = str(payload.get("status") or action or row["status"] or "SETTLED")
        target = str(payload.get("to") or existing.get("target") or "Policy-controlled route")
        network = str(payload.get("network") or existing.get("network") or self._infer_network(target, action))
        reasoning = str(payload.get("reasoning") or f"{self._humanize_agent(action)} settled through the gateway lifecycle.")

        existing.update(
            {
                "id": transaction_id,
                "agent": str(payload.get("agent") or existing.get("agent") or self._humanize_agent(action)),
                "userId": str(row["user_id"] or existing.get("userId") or "system"),
                "network": network,
                "target": target,
                "itemDetails": str(payload.get("item_details") or existing.get("itemDetails") or payload.get("to") or "Settled gateway action"),
                "amount": float(payload.get("amount") or existing.get("amount") or 0),
                "statusRaw": status_raw,
                "statusUi": self._status_ui(status_raw),
                "reasoning": reasoning,
                "gas": str(payload.get("gas") or existing.get("gas") or "Policy-controlled"),
                "contract": str(payload.get("contract") or existing.get("contract") or ""),
                "payload": json.dumps(payload, sort_keys=True),
                "timeline": self._merge_timeline(existing.get("timeline"), self._timeline_label_for_action(status_raw)),
                "createdAt": existing.get("createdAt") or timestamp,
                "updatedAt": timestamp,
                "policyReason": str(payload.get("policy_reason") or existing.get("policyReason") or reasoning),
                "requestedAction": str(payload.get("item_details") or payload.get("requested_action") or existing.get("requestedAction") or target),
                "policyRule": str(payload.get("policy_rule") or existing.get("policyRule") or "Published from the gateway settlement log."),
            }
        )
        transactions[transaction_id] = existing

    def _build_aggregates(self, transactions: Dict[str, Dict[str, Any]]):
        now = datetime.now(timezone.utc)
        cutoff = now - timedelta(days=30)
        throughput: Dict[str, Dict[str, float]] = {}
        active_agents = set()

        summary = {
            "thirtyDayVolumeUsd": 0.0,
            "activeAgents": 0,
            "pendingSignatures": 0,
            "settledCount": 0,
            "blockedCount": 0,
            "lastSyncedAt": _utc_now_iso(),
        }

        for transaction in transactions.values():
            status_ui = str(transaction.get("statusUi") or "Pending Review")

            if status_ui == "Pending Review":
                summary["pendingSignatures"] += 1
            elif status_ui == "Completed":
                summary["settledCount"] += 1
            elif status_ui == "Blocked":
                summary["blockedCount"] += 1

            updated_at = self._parse_date(transaction.get("updatedAt") or transaction.get("createdAt"))
            if not updated_at or updated_at < cutoff:
                continue

            active_agents.add(str(transaction.get("agent") or "Gateway Runtime"))

            if status_ui == "Completed":
                amount = float(transaction.get("amount") or 0)
                summary["thirtyDayVolumeUsd"] += amount
                day_key = updated_at.date().isoformat()
                bucket = throughput.setdefault(day_key, {"volumeUsd": 0.0, "count": 0})
                bucket["volumeUsd"] += amount
                bucket["count"] += 1

        summary["activeAgents"] = len(active_agents)
        return summary, throughput

    def _base_transaction(self, transaction_id: str, existing: Dict[str, Any] | None, timestamp: str) -> Dict[str, Any]:
        created_at = (existing or {}).get("createdAt") or timestamp
        return {
            "id": transaction_id,
            "agent": (existing or {}).get("agent") or "Gateway Runtime",
            "userId": (existing or {}).get("userId") or "system",
            "network": (existing or {}).get("network") or "Unassigned",
            "target": (existing or {}).get("target") or "Policy-controlled route",
            "itemDetails": (existing or {}).get("itemDetails") or "Gateway activity",
            "amount": float((existing or {}).get("amount") or 0),
            "statusRaw": (existing or {}).get("statusRaw") or "PENDING",
            "statusUi": (existing or {}).get("statusUi") or "Pending Review",
            "reasoning": (existing or {}).get("reasoning") or "Gateway lifecycle update.",
            "gas": (existing or {}).get("gas") or "Policy-controlled",
            "contract": (existing or {}).get("contract") or "",
            "payload": (existing or {}).get("payload") or "{}",
            "timeline": (existing or {}).get("timeline") or [],
            "createdAt": created_at,
            "updatedAt": timestamp,
            "policyReason": (existing or {}).get("policyReason") or "Gateway lifecycle update.",
            "requestedAction": (existing or {}).get("requestedAction") or "Gateway activity",
            "policyRule": (existing or {}).get("policyRule") or "Published from the gateway runtime.",
        }

    def _safe_json_load(self, value: Any):
        if value in (None, ""):
            return None
        if isinstance(value, (dict, list)):
            return value
        try:
            return json.loads(value)
        except (TypeError, json.JSONDecodeError):
            return None

    def _status_ui(self, raw_status: str) -> str:
        normalized = raw_status.upper()

        if any(flag in normalized for flag in ("REJECT", "FAILED", "HALT", "BLOCK")):
            return "Blocked"

        if any(flag in normalized for flag in ("SETTLED", "VERIFY", "SUCCESS", "FULLY_SIGNED", "APPROVED")):
            return "Completed"

        return "Pending Review"

    def _infer_network(self, target: str, details: str) -> str:
        source = f"{target} {details}".lower()
        if "bitcoin" in source or "btc" in source:
            return "Bitcoin"
        if "solana" in source or "sol" in source:
            return "Solana"
        if "base" in source:
            return "Base"
        if "ethereum" in source or " eth" in source:
            return "Ethereum"
        if "arbitrum" in source:
            return "Arbitrum"
        if "polygon" in source:
            return "Polygon"
        if "optimism" in source:
            return "Optimism"
        return "Gateway"

    def _reason_from_status(self, status: str, required_signatures: List[str]) -> str:
        normalized = status.upper()
        if "PENDING" in normalized:
            if required_signatures:
                return f"Waiting for required signature shares: {', '.join(required_signatures)}."
            return "Waiting for required review before settlement."
        if "APPROVED" in normalized or "FULLY_SIGNED" in normalized:
            return "Required signatures were collected and the request advanced."
        if "REJECT" in normalized or "HALT" in normalized or "FAILED" in normalized:
            return "This transaction was halted before settlement."
        return "Gateway transaction updated."

    def _policy_rule_from_status(self, status: str, required_signatures: List[str]) -> str:
        normalized = status.upper()
        if "PENDING" in normalized:
            return f"Manual approval required before settlement ({len(required_signatures)} required shares)."
        if "APPROVED" in normalized or "FULLY_SIGNED" in normalized:
            return "Signature policy satisfied."
        if "REJECT" in normalized or "HALT" in normalized or "FAILED" in normalized:
            return "Policy or operator rejected execution."
        return "Gateway lifecycle update."

    def _timeline_from_status(self, status: str) -> List[str]:
        normalized = status.upper()
        if "PENDING" in normalized:
            return ["Intent recorded", "Awaiting signature shares"]
        if "APPROVED" in normalized or "FULLY_SIGNED" in normalized:
            return ["Intent recorded", "Required approvals collected", "Ready for execution"]
        if "REJECT" in normalized or "HALT" in normalized or "FAILED" in normalized:
            return ["Intent recorded", "Execution halted"]
        return ["Gateway lifecycle update"]

    def _timeline_label_for_state(self, state: str, metadata: Dict[str, Any]) -> str:
        normalized = state.upper()
        if normalized == "PREFLIGHT":
            return "Preflight policy checks completed"
        if normalized == "EXECUTE":
            return "Execution path started"
        if normalized == "VERIFY":
            return "Settlement verified"
        if normalized == "FAILED":
            return str(metadata.get("error") or "Execution failed")
        return state.title()

    def _timeline_label_for_action(self, action: str) -> str:
        normalized = action.upper()
        if "SETTLED" in normalized or "SUCCESS" in normalized:
            return "Transaction settled"
        if "REJECT" in normalized:
            return "Transaction rejected"
        return self._humanize_agent(action)

    def _merge_timeline(self, existing: Any, next_label: str) -> List[str]:
        timeline = list(existing) if isinstance(existing, list) else []
        if next_label and next_label not in timeline:
            timeline.append(next_label)
        return timeline[-8:]

    def _humanize_agent(self, value: str) -> str:
        if not value:
            return "Gateway Runtime"
        parts = value.replace("-", " ").replace("_", " ").split()
        return " ".join(part.capitalize() for part in parts)

    def _parse_date(self, value: Any):
        if not value or not isinstance(value, str):
            return None
        try:
            return datetime.fromisoformat(value.replace("Z", "+00:00"))
        except ValueError:
            return None


def get_live_publisher() -> FirebaseLivePublisher:
    global _publisher

    if _publisher is not None:
        return _publisher

    with _publisher_lock:
        if _publisher is None:
            _publisher = FirebaseLivePublisher()

    return _publisher
