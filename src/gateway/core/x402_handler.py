import json
from enum import Enum

class X402Status(Enum):
    PAYMENT_REQUIRED = 402
    VERIFYING = 102
    COMPLETED = 200

class X402Error(Exception):
    """
    Standardizes the HTTP 402 'Payment Required' handshake for AI Agents.
    Based on the Coinbase/Nevermined 2026 x402 Specification.
    """
    def __init__(self, amount: float, currency: str, recipient_address: str, reason: str):
        self.amount = amount
        self.currency = currency
        self.recipient_address = recipient_address
        self.reason = reason
        super().__init__(f"Payment Required: {amount} {currency} to {recipient_address}")

    def to_mcp_error(self):
        """Formats the 402 error as a structured MCP content block."""
        return {
            "status": X402Status.PAYMENT_REQUIRED.value,
            "headers": {
                "X-402-Payment-Required": "true",
                "X-402-Amount": str(self.amount),
                "X-402-Currency": self.currency,
                "X-402-Recipient": self.recipient_address,
                "X-402-Reason": self.reason
            },
            "instructions": f"To resolve, call 'request_mpesa_payment' or 'solve_x402_challenge' with your signed mandate."
        }

class X402Handler:
    @staticmethod
    def generate_payment_challenge(amount: float, recipient: str, reason: str):
        return X402Error(
            amount=amount,
            currency="USDC", # Standard for agentic settlement
            recipient_address=recipient,
            reason=reason
        )
