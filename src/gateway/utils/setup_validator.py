import sys

from core.runtime_contract import FEATURE_REQUIREMENTS, missing_env


def _feature_status(feature_name: str) -> tuple[bool, list[str]]:
    required = FEATURE_REQUIREMENTS.get(feature_name, [])
    missing = missing_env(required)
    return (len(missing) == 0, missing)


def validate_environment():
    """Validates the self-hosted environment against the documented support tiers."""
    stable_gateway_ready, stable_gateway_missing = _feature_status("stable_gateway")
    evm_ready, evm_missing = _feature_status("evm_execution")
    commerce_ready, commerce_missing = _feature_status("commerce_search")
    handover_ready, handover_missing = _feature_status("browser_handover")
    mpesa_ready, mpesa_missing = _feature_status("mpesa_experimental")

    print("\n--- Universal Gateway Setup Validator ---", file=sys.stderr)

    stable_ready = stable_gateway_ready and evm_ready
    print(
        f"Stable surface ({'READY' if stable_ready else 'INCOMPLETE'}): "
        "Base/Ethereum transfers, HITL, MCP integration, dashboard telemetry",
        file=sys.stderr,
    )
    if not stable_gateway_ready:
        print(f"  Missing stable gateway vars: {', '.join(stable_gateway_missing)}", file=sys.stderr)
    if not evm_ready:
        print(f"  Missing EVM execution vars: {', '.join(evm_missing)}", file=sys.stderr)

    beta_ready = commerce_ready and handover_ready
    print(
        f"Beta surface ({'READY' if beta_ready else 'INCOMPLETE'}): "
        "commerce search and browser-assisted checkout handover",
        file=sys.stderr,
    )
    if not commerce_ready:
        print(f"  Missing commerce vars: {', '.join(commerce_missing)}", file=sys.stderr)
    if not handover_ready:
        print(f"  Missing handover vars: {', '.join(handover_missing)}", file=sys.stderr)

    print(
        f"Experimental surface ({'READY' if mpesa_ready else 'INCOMPLETE'}): "
        "M-Pesa and fiat-adjacent payment rails",
        file=sys.stderr,
    )
    if not mpesa_ready:
        print(f"  Missing experimental vars: {', '.join(mpesa_missing)}", file=sys.stderr)

    return {
        "stable_ready": stable_ready,
        "beta_ready": beta_ready,
        "experimental_ready": mpesa_ready,
    }


if __name__ == "__main__":
    validate_environment()
