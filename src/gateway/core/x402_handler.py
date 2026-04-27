from enum import Enum

from core.runtime_contract import EXECUTION_NETWORKS


class X402Status(Enum):
    PAYMENT_REQUIRED = 402
    VERIFYING = 102
    COMPLETED = 200


class X402Error(Exception):
    """
    Standardizes the x402 payment-required handshake for agent-facing MCP flows.
    """

    def __init__(
        self,
        amount: float,
        currency: str,
        recipient_address: str,
        reason: str,
        network: str = "base",
    ):
        self.amount = amount
        self.currency = currency
        self.recipient_address = recipient_address
        self.reason = reason
        self.network = network if network in EXECUTION_NETWORKS else "base"
        super().__init__(f"Payment Required: {amount} {currency} to {recipient_address}")

    def to_mcp_error(self):
        """Formats the x402 challenge as a stable MCP-facing contract."""
        return {
            "status": "payment_required",
            "code": X402Status.PAYMENT_REQUIRED.value,
            "headers": {
                "X-402-Payment-Required": "true",
                "X-402-Amount": str(self.amount),
                "X-402-Currency": self.currency,
                "X-402-Recipient": self.recipient_address,
                "X-402-Reason": self.reason,
                "X-402-Network": self.network,
            },
            "payment": {
                "rail": "x402",
                "asset": self.currency,
                "amount": self.amount,
                "network": self.network,
                "recipient": self.recipient_address,
                "reason": self.reason,
                "supportTier": "stable",
            },
            "resolve": {
                "type": "present_payment_proof_and_retry",
                "instructions": (
                    "Present a signed mandate or Base-settled payment proof through your operator workflow, "
                    "then retry the original tool call with the same idempotency key."
                ),
            },
        }


class X402Handler:
    @staticmethod
    def generate_payment_challenge(
        amount: float,
        recipient: str,
        reason: str,
        network: str = "base",
    ):
        return X402Error(
            amount=amount,
            currency="USDC",
            recipient_address=recipient,
            reason=reason,
            network=network,
        )
