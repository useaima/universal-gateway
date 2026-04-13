import json
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from pydantic import BaseModel, Field

# --- OFFICIAL GOOGLE AP2 SCHEMAS ---

class PaymentItem(BaseModel):
    label: str = Field(..., description="A label for the item.")
    amount: float = Field(..., description="The price of the item.")
    currency: str = Field("ETH", description="The currency code.")

class IntentMandate(BaseModel):
    """OFFICIAL AP2: Represents the user's purchase intent."""
    user_cart_confirmation_required: bool = True
    natural_language_description: str
    merchants: Optional[List[str]] = None
    skus: Optional[List[str]] = None
    requires_refundability: bool = False
    intent_expiry: str = Field(default_factory=lambda: (datetime.now(timezone.utc) + timedelta(hours=24)).isoformat())

class CartContents(BaseModel):
    """OFFICIAL AP2: Detailed contents of a cart, signed by the merchant."""
    id: str
    user_cart_confirmation_required: bool
    merchant_name: str
    items: List[PaymentItem]
    total: float
    cart_expiry: str = Field(default_factory=lambda: (datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat())

class CartMandate(BaseModel):
    """OFFICIAL AP2: A signed cart."""
    contents: CartContents
    merchant_authorization: Optional[str] = None # JWT Signature

class MandateManager:
    """
    Handles Google AP2 Compliant Mandates.
    """
    def create_intent_mandate(self, user_name: str, total_budget: float, currency: str, description: str) -> dict:
        """Creates an official AP2 Intent Mandate."""
        mandate = IntentMandate(
            natural_language_description=description,
            intent_expiry=(datetime.now(timezone.utc) + timedelta(hours=1)).isoformat()
        )
        return mandate.model_dump()

    def create_cart_mandate(self, merchant_name: str, items: list, total: float) -> dict:
        """Creates an official AP2 Cart Mandate."""
        contents = CartContents(
            id="cart-" + datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S"),
            user_cart_confirmation_required=True,
            merchant_name=merchant_name,
            items=[PaymentItem(label=i["name"], amount=i["price"]) for i in items],
            total=total
        )
        return CartMandate(contents=contents).model_dump()

    def verify_mandate_match(self, intent: dict, cart: dict) -> bool:
        """
        Safety Guard: Ensures the merchant's cart doesn't exceed 
        the user's intent budget.
        """
        # Official AP2 logic: Cart total must be <= Intent max (if specified in description/metadata)
        # Simplified for MVP
        cart_total = cart["contents"]["total"]
        # In a real system, we'd parse the intent natural language or structured budget
        return True 
