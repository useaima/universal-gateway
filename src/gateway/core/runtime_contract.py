import os
from typing import Dict, List

GATEWAY_NAME = "Universal Transaction Gateway"
GATEWAY_AGENT_ID = "utg-gateway-001"
GATEWAY_VERSION = "1.1.0"

EXECUTION_NETWORKS = ["base", "ethereum"]
OBSERVER_NETWORKS = ["bitcoin", "solana"]

PUBLIC_TOOL_NAMES = [
    "request_eth_transfer_reliable",
    "search_and_compare",
    "request_order",
    "request_human_handover",
    "submit_signature_share",
    "get_a2a_agent_card",
]

SUPPORT_MATRIX: Dict[str, Dict[str, List[str] | str]] = {
    "stable": {
        "label": "Stable",
        "capabilities": [
            "Base and Ethereum transfers",
            "HITL approval enforcement",
            "Dashboard telemetry publication",
            "MCP integration for OpenClaw and custom agents",
        ],
    },
    "beta": {
        "label": "Beta",
        "capabilities": [
            "Commerce search and browser-assisted checkout handover",
            "Operator handover sessions through a configured browser adapter",
        ],
    },
    "experimental": {
        "label": "Experimental",
        "capabilities": [
            "M-Pesa and fiat-adjacent payment rails",
        ],
    },
}

FEATURE_REQUIREMENTS = {
    "stable_gateway": ["GATEWAY_PASSCODE", "TREASURY_ADDRESS", "SIWE_NONCE_SECRET", "UTG_STORAGE_DIR"],
    "evm_execution": ["BASE_RPC_URL", "ETHEREUM_RPC_URL"],
    "commerce_search": ["COMMERCE_SEARCH_PROVIDER", "ALLOWED_DOMAINS"],
    "browser_handover": ["BROWSER_HANDOVER_URL"],
    "browserbase_runtime": ["BROWSERBASE_API_KEY", "BROWSERBASE_PROJECT_ID"],
    "mpesa_experimental": ["MPESA_API_SECRET", "MPESA_SHORTCODE", "MPESA_CALLBACK_URL"],
}


def missing_env(var_names: List[str]) -> List[str]:
    return [name for name in var_names if not os.environ.get(name)]


def docs_urls() -> Dict[str, str]:
    base_url = os.environ.get("UTG_PUBLIC_DOCS_URL", "https://utg.useaima.com/docs").rstrip("/")
    return {
        "site": base_url,
        "skill": f"{base_url}/skill.md",
    }


def support_matrix_payload() -> Dict[str, Dict[str, List[str] | str]]:
    return SUPPORT_MATRIX


def agent_card_payload(verification_key: str = "TODO_FETCH_FROM_IDENTITY_MANAGER") -> dict:
    docs = docs_urls()
    return {
        "a2a_version": "1.0",
        "agent_id": GATEWAY_AGENT_ID,
        "name": GATEWAY_NAME,
        "version": GATEWAY_VERSION,
        "description": (
            "Open-source, self-hosted MCP gateway for agentic finance. "
            "UTG enforces HITL on value-moving actions and keeps Base/Ethereum as first-class execution rails."
        ),
        "deployment_model": "self_hosted",
        "integration_model": "mcp_first",
        "networks": {
            "execution": EXECUTION_NETWORKS,
            "observed": OBSERVER_NETWORKS,
        },
        "governance": {
            "human_in_the_loop": "always_enforced",
            "non_custodial": True,
            "idempotency": "required_on_retries",
        },
        "support_tiers": support_matrix_payload(),
        "public_tools": PUBLIC_TOOL_NAMES,
        "operator_channels": [
            "OpenClaw",
            "Claude Desktop",
            "Custom MCP client",
            "Telegram or other chat channels layered on top of the gateway",
        ],
        "docs": docs,
        "endpoints": {
            "mcp": "stdio://src/gateway/server.py",
            "a2a_rpc": "/a2a-rpc",
        },
        "security": {
            "type": "Ed25519",
            "verification_key": verification_key,
        },
    }
