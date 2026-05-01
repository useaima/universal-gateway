from pathlib import Path

import pytest

from src.gateway.core.a2a_adapter import A2AAdapter
from src.gateway.core.x402_handler import X402Handler
from src.gateway.skills.commerce_skill import CommerceSkill
from src.gateway.skills.handover_skill import HandoverSkill
from src.gateway.utils.setup_validator import validate_environment


def test_agent_card_matches_gateway_contract():
    adapter = A2AAdapter(
        agent_id="utg-gateway-001",
        capabilities=["mcp_finance_gateway", "hitl_approval_enforcement"],
    )

    card = adapter.get_agent_card()

    assert card["deployment_model"] == "self_hosted"
    assert card["integration_model"] == "mcp_first"
    assert card["governance"]["human_in_the_loop"] == "always_enforced"
    assert card["networks"]["execution"] == ["base", "ethereum"]
    assert card["networks"]["observed"] == ["bitcoin", "solana"]
    assert "request_eth_transfer_reliable" in card["public_tools"]
    assert card["docs"]["skill"].endswith("/docs/skill.md")


def test_x402_payload_is_canonical():
    payload = X402Handler.generate_payment_challenge(
        amount=10.5,
        recipient="0xabc",
        reason="premium settlement route",
        network="base",
    ).to_mcp_error()

    assert payload["status"] == "payment_required"
    assert payload["code"] == 402
    assert payload["payment"]["rail"] == "x402"
    assert payload["payment"]["asset"] == "USDC"
    assert payload["payment"]["network"] == "base"
    assert payload["resolve"]["type"] == "present_payment_proof_and_retry"


@pytest.mark.asyncio
async def test_handover_requires_runtime_adapter(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.delenv("BROWSER_HANDOVER_URL", raising=False)

    skill = HandoverSkill()
    result = await skill.handle_tool_call("request_human_handover", {"reason": "2FA wall"})

    text = result[0].text
    assert "beta capability" in text.lower()
    assert "BROWSER_HANDOVER_URL" in text


@pytest.mark.asyncio
async def test_commerce_requires_provider_configuration(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.delenv("COMMERCE_SEARCH_PROVIDER", raising=False)

    skill = CommerceSkill()
    result = await skill.handle_tool_call(
        "search_and_compare",
        {"item_name": "Ledger Nano", "max_price": 120},
    )

    text = result[0].text
    assert "beta capability" in text.lower()
    assert "COMMERCE_SEARCH_PROVIDER" in text


def test_setup_validator_uses_support_tiers(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setenv("GATEWAY_PASSCODE", "123456")
    monkeypatch.setenv("SIWE_NONCE_SECRET", "nonce-secret-for-tests")
    monkeypatch.setenv("UTG_STORAGE_DIR", "/tmp/utg-validator")
    monkeypatch.setenv("UTG_IDENTITY_PRIVATE_KEY_PEM", "test-identity")
    monkeypatch.setenv("TREASURY_ADDRESS", "0xabc")
    monkeypatch.setenv("BASE_RPC_URL", "https://mainnet.base.org")
    monkeypatch.setenv("ETHEREUM_RPC_URL", "https://rpc.example.org")
    monkeypatch.delenv("COMMERCE_SEARCH_PROVIDER", raising=False)
    monkeypatch.delenv("BROWSER_HANDOVER_URL", raising=False)
    monkeypatch.delenv("MPESA_API_SECRET", raising=False)
    monkeypatch.delenv("MPESA_SHORTCODE", raising=False)
    monkeypatch.delenv("MPESA_CALLBACK_URL", raising=False)

    status = validate_environment()

    assert status["stable_ready"] is True
    assert status["beta_ready"] is False
    assert status["experimental_ready"] is False


def test_skill_artifact_matches_public_tools():
    skill_doc = Path("src/web_dashboard/public/docs/skill.md").read_text(encoding="utf-8")

    assert "request_eth_transfer_reliable" in skill_doc
    assert "submit_signature_share" in skill_doc
    assert "search_and_compare" in skill_doc
    assert "request_order" in skill_doc
    assert "request_human_handover" in skill_doc
    assert "get_a2a_agent_card" in skill_doc
    assert "`stable`" in skill_doc
    assert "`beta`" in skill_doc
    assert "`experimental`" in skill_doc
