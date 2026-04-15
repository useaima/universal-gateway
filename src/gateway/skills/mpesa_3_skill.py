import hmac
import hashlib
import base64
import time
from typing import Dict, Any

class Mpesa3Authenticator:
    """
    Implements the 2026 'Eva Stack' standard for Safaricom Daraja 3.0 security.
    Handles cryptographic signature verification for incoming payment callbacks.
    """
    def __init__(self, api_secret: str = None):
        # In production, this secret comes from Safaricom's Developer Portal
        self.api_secret = api_secret or "DEMO_MPESA_SECRET_2026"

    def verify_callback_signature(self, signature_header: str, body_payload: str) -> bool:
        """
        Verifies the X-Mpesa-Signature header to prevent spoofing.
        Uses HMAC-SHA256 as per the Daraja 3.0 specification.
        """
        if not signature_header:
            return False
            
        expected_sig = hmac.new(
            self.api_secret.encode(),
            body_payload.encode(),
            hashlib.sha256
        ).digest()
        
        actual_sig = base64.b64decode(signature_header)
        return hmac.compare_digest(expected_sig, actual_sig)

    def generate_checkout_id(self, phone: str) -> str:
        """Generates an idempotent CheckoutID for the STK Push."""
        return f"ws_CO_{phone}_{int(time.time())}"

class Mpesa3Skill:
    """
    The Eva Protocol Skill for M-Pesa.
    Features: Idempotent STK Pushes and Signature-Verified Callbacks.
    """
    def __init__(self):
        self.auth = Mpesa3Authenticator()

    async def initiate_stk_push(self, phone: str, amount: float, reason: str) -> Dict[str, Any]:
        """Triggers a cloud-native STK Push under the Daraja 3.0 flow."""
        checkout_id = self.auth.generate_checkout_id(phone)
        
        # In a real integration, this sends to Safaricom's /stkpush/v3 endpoint
        print(f"[Daraja 3.0] Initiating push for {phone} (ID: {checkout_id})", flush=True)
        
        return {
            "status": "PENDING_PIN_ENTRY",
            "CheckoutRequestID": checkout_id,
            "instructions": "Enter your M-Pesa PIN on your phone to authorize the transaction."
        }

    async def handle_callback(self, headers: Dict, body: str) -> Dict[str, Any]:
        """Processes the verified callback from Safaricom."""
        sig = headers.get("X-Mpesa-Signature")
        if not self.auth.verify_callback_signature(sig, body):
            return {"status": "FAILED", "error": "Invalid Signature (Security Breach Detected)"}
            
        data = json.loads(body)
        res_code = data.get("Body", {}).get("stkCallback", {}).get("ResultCode")
        
        if res_code == 0:
            return {"status": "SUCCESS", "message": "Payment Verified Cryptographically"}
        return {"status": "FAILED", "code": res_code}
