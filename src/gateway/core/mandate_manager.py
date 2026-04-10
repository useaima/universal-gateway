import json
import hashlib
import time
from typing import Dict, Any, List

class MandateManager:
    """
    Implements Google AP2 (Agent Payments Protocol) Mandates.
    Handles Intent Mandates (User Goal) and Cart Mandates (Agent Proposal).
    """

    def create_intent_mandate(self, user_id: str, budget: float, currency: str, goal: str) -> Dict[str, Any]:
        """Creates a signed 'Intent Mandate' from the user."""
        mandate = {
            "type": "IntentMandate",
            "version": "1.0",
            "issuer": user_id,
            "issuedAt": int(time.time()),
            "expiresAt": int(time.time()) + 3600, # 1 hour expiry
            "constraints": {
                "budget": budget,
                "currency": currency,
                "goal": goal
            }
        }
        mandate["signature"] = self._sign_mandate(mandate)
        return mandate

    def create_cart_mandate(self, agent_id: str, intent_id: str, items: List[Dict[str, Any]], total: float) -> Dict[str, Any]:
        """Creates a 'Cart Mandate' response from an agent/merchant."""
        mandate = {
            "type": "CartMandate",
            "version": "1.0",
            "issuer": agent_id,
            "intentReference": intent_id,
            "issuedAt": int(time.time()),
            "items": items,
            "total": total
        }
        mandate["signature"] = self._sign_mandate(mandate)
        return mandate

    def verify_mandate(self, mandate: Dict[str, Any]) -> bool:
        """Verifies the integrity of a mandate (simulated cryptographic check)."""
        if "signature" not in mandate:
            return False
            
        temp_mandate = mandate.copy()
        sig = temp_mandate.pop("signature")
        
        # In a real GaaS, we would verify the ECDSA signature here
        expected_sig = self._sign_mandate(temp_mandate)
        return sig == expected_sig

    def _sign_mandate(self, mandate: Dict[str, Any]) -> str:
        """Simulated signing for AP2 Mandates."""
        mandate_str = json.dumps(mandate, sort_keys=True)
        return hashlib.sha256(mandate_str.encode()).hexdigest()
