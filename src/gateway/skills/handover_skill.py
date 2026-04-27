import os
import sys
import uuid
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
                description="Generates a browser handover request for the operator when automation must pause.",
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
                        "pin": {"type": "string"},
                        "signer_name": {
                            "type": "string",
                            "description": "Optional operator identifier recorded against the approval share.",
                        },
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
        
        print(f"\n[!!!] 2FA/HANDOVER REQUIRED: {reason}", file=sys.stderr)
        print("[!!!] ALERT: Manual control session starting...", file=sys.stderr)

        handover_url = os.environ.get("BROWSER_HANDOVER_URL", "").strip()
        ticket_id = f"handover_{uuid.uuid4().hex[:10]}"

        if not handover_url:
            res_msg = (
                "Browser handover is a beta capability and is not active yet on this self-hosted gateway.\n"
                f"Reason: {reason}\n"
                "Missing environment variable: BROWSER_HANDOVER_URL\n"
                "Configure a browser handover adapter or Browserbase-backed operator URL, then retry the same request.\n"
                f"Generated handover ticket: {ticket_id}"
            )
            return [types.TextContent(type="text", text=res_msg)]

        connector = "&" if "?" in handover_url else "?"
        live_view_url = f"{handover_url}{connector}ticket={ticket_id}"
        res_msg = (
            "Manual takeover initiated.\n"
            f"Reason: {reason}\n"
            "Action required: open the operator handover URL below, complete the blocked step, then return control "
            "to the agent.\n\n"
            f"Live view URL: {live_view_url}\n"
            f"Handover ticket: {ticket_id}\n"
            "Support tier: beta"
        )
        
        return [types.TextContent(type="text", text=res_msg)]

    async def _submit_pin(self, args: dict) -> List[types.TextContent]:
        from core.hitl_manager import HITLManager
        
        tx_id = args["transaction_id"]
        pin = args["pin"]
        signer_name = args.get("signer_name") or os.environ.get("UTG_DEFAULT_SIGNER_NAME", "Alvins_Share")
        
        expected_pin = os.environ.get("GATEWAY_PASSCODE")
        if not expected_pin:
            return [
                types.TextContent(
                    type="text",
                    text="❌ Gateway passcode is not configured. Set GATEWAY_PASSCODE before accepting approval shares.",
                )
            ]

        if str(pin).strip() != str(expected_pin).strip():
            return [types.TextContent(type="text", text="❌ Access denied: incorrect gateway passcode.")]
            
        hitl = HITLManager()
        status = hitl.submit_signature_share(tx_id, signer_name)
        return [
            types.TextContent(
                type="text",
                text=(
                    f"✅ Approval share accepted. Transaction status is now: {status}. "
                    "Re-run the original transfer tool with the same request so the gateway can resume safely."
                ),
            )
        ]
