import json
import sqlite3
from pathlib import Path

import pytest

pytest.importorskip("sklearn")

from src.gateway.core.anomaly_detector import AnomalyDetector
from src.gateway.core.audit_logger import AuditLogger
from src.gateway.skills.defi_eth_skill import DeFiEthSkill


def _read_required_signatures(db_path: str, transaction_id: str) -> list[str]:
    with sqlite3.connect(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT required_signatures FROM pending_transactions WHERE id = ?",
            (transaction_id,),
        )
        row = cursor.fetchone()

    assert row is not None
    return json.loads(row[0])


def test_anomaly_detector_trains_on_encrypted_preflight_history(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
):
    storage_dir = tmp_path / "logs"
    monkeypatch.setenv("UTG_STORAGE_DIR", str(storage_dir))

    logger = AuditLogger(log_dir=str(storage_dir))
    for _ in range(15):
        logger.log_signed_entry(
            "test_user",
            "STATE_PREFLIGHT",
            {"metadata": {"initial_quote": "45.00"}},
        )

    detector = AnomalyDetector()
    detector.train()

    assert detector.is_trained is True


@pytest.mark.asyncio
async def test_transfer_retry_stays_halted_until_required_share_is_present(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
):
    storage_dir = tmp_path / "logs"
    monkeypatch.setenv("UTG_STORAGE_DIR", str(storage_dir))

    skill = DeFiEthSkill()
    args = {
        "to_address": "0xAliciaWalletAddress000000000000000000000000",
        "amount_eth": 0.1,
        "user_id": "Alvins",
        "network": "base",
    }

    first = await skill.handle_tool_call("request_eth_transfer_reliable", args)
    second = await skill.handle_tool_call("request_eth_transfer_reliable", args)

    assert "TRANSACTION HALTED" in first[0].text
    assert "pending approval" in second[0].text.lower()
    assert "Funds securely settled" not in second[0].text


@pytest.mark.asyncio
async def test_transfer_creation_uses_anomaly_escalation_when_detector_flags_outlier(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
):
    storage_dir = tmp_path / "logs"
    monkeypatch.setenv("UTG_STORAGE_DIR", str(storage_dir))
    monkeypatch.setattr(
        AnomalyDetector,
        "evaluate_transaction",
        lambda self, amount, user_id="system": True,
    )

    skill = DeFiEthSkill()
    args = {
        "to_address": "0xSecurityReview0000000000000000000000000000",
        "amount_eth": 4.2,
        "user_id": "Alvins",
        "network": "base",
    }

    first = await skill.handle_tool_call("request_eth_transfer_reliable", args)
    transaction_id = first[0].text.split("transaction_id: '")[1].split("'")[0]
    required = _read_required_signatures(
        str(storage_dir / "transactions.db"),
        transaction_id,
    )

    assert "Security_Admin_Share" in required
