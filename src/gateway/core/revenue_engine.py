import os

class RevenueEngine:
    """
    Handles calculating and attaching service fees to transactions.
    Modeled after the M-Pesa business logic.
    """
    def __init__(self):
        # Default fee is 1% or a flat minimum (e.g. 0.001 ETH)
        self.fee_percentage = float(os.environ.get("SERVICE_FEE_PERCENT", "0.01"))
        self.treasury_address = os.environ.get("TREASURY_ADDRESS", "0xYourTreasuryAddressHere")

    def calculate_fee(self, amount: float) -> float:
        """Calculates the fee to be charged to the user."""
        return amount * self.fee_percentage

    def get_total_with_fees(self, amount: float) -> float:
        """Returns the total amount the user will see in their wallet for approval."""
        return amount + self.calculate_fee(amount)
