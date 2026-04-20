import os
import sys
from typing import List
import mcp.types as types
from core.skill_base import SkillBase

class HandoverSkill(SkillBase):
    """
    Handles 'Human-in-the-Loop' Handover via Browserbase Live View.
    Triggers when the agent hits a 2FA wall or CAPTCHA failure.
    """
    
    @property
    def name(self) -> str:
        return "handover"

    async def get_tools(self) -> List[types.Tool]:
        return [
            types.Tool(
                name="request_human_handover",
                description="Generates a Live View URL for the user to take manual control of the browser.",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "reason": {"type": "string", "description": "Why is handover needed? (e.g. 2FA, CAPTCHA failure)"}
                    },
                    "required": ["reason"]
                }
            ),
            types.Tool(
                name="submit_signature_share",
                description="Use this when the user gives you their secret 6-digit approval PIN to unlock a pending transaction.",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "transaction_id": {"type": "string"},
                        "pin": {"type": "string"}
                    },
                    "required": ["transaction_id", "pin"]
                }
            )
        ]

    async def handle_tool_call(self, name: str, arguments: dict) -> List[types.TextContent]:
        if name == "request_human_handover":
            return await self._generate_handover_url(arguments)
        elif name == "submit_signature_share":
            return await self._submit_pin(arguments)
        return []

    async def _generate_handover_url(self, args: dict) -> List[types.TextContent]:
        reason = args["reason"]
        
        # 1. 2FA NOTIFICATION (System Signal)
        print(f"\n[!!!] 2FA/HANDOVER REQUIRED: {reason}", file=sys.stderr)
        print(f"[!!!] ALERT: Manual control session starting...", file=sys.stderr)

        # 2. Browserbase Session Logic (Mocked for MVP, requires BROWSERBASE_API_KEY)
        # In production:
        # bb = Browserbase(api_key=os.environ["BROWSERBASE_API_KEY"])
        # session = bb.sessions.create()
        # debug_url = bb.sessions.debug(session.id).debugger_url
        
        mock_debug_url = "https://www.browserbase.com/live/demo-session-id"
        
        res_msg = (
            f"Manual Takeover Initiated!\n"
            f"Reason: {reason}\n"
            f"Action Required: Open the URL below to take manual control of the browser session.\n\n"
            f"Live View URL: {mock_debug_url}\n\n"
            f"Close the tab when finished to return control to the agent."
        )
        
        return [types.TextContent(type="text", text=res_msg)]

    async def _submit_pin(self, args: dict) -> List[types.TextContent]:
        from core.hitl_manager import HITLManager
        import os
        
        tx_id = args["transaction_id"]
        pin = args["pin"]
        
        # Verify PIN against environment rules
        expected_pin = os.environ.get("GATEWAY_PASSCODE", "123456")
        if str(pin).strip() != str(expected_pin).strip():
            return [types.TextContent(type="text", text="❌ Access Denied: Incorrect PIN.")]
            
        hitl = HITLManager()
        status = hitl.submit_signature_share(tx_id, "Alvins_Share")
        return [types.TextContent(type="text", text=f"✅ PIN Accepted! Transaction Status is now: {status}. Please re-run the original transfer tool to finalize execution.")]
