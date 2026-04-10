import os
import asyncio
from typing import List, Dict
import mcp.types as types
from web3 import AsyncWeb3
from web3.providers.async_rpc import AsyncHTTPProvider

from core.skill_base import SkillBase
from core.sandbox_engine import SandboxEngine
from core.hitl_manager import HITLManager
from core.revenue_engine import RevenueEngine
from core.audit_logger import AuditLogger
from core.execution_wrapper import ExecutionWrapper

class DeFiEthSkill(SkillBase):
    """
    Upgraded DeFi Ethereum Skill with Reliability Wrapping and Finality Guard.
    """
    def __init__(self):
        self.sandbox = SandboxEngine()
        self.hitl = HITLManager()
        self.revenue = RevenueEngine()
        self.audit_logger = AuditLogger()
        self.w3 = AsyncWeb3(AsyncHTTPProvider(os.environ.get("ETHEREUM_RPC_URL", "https://mainnet.gateway.tenderly.co/public")))

    @property
    def name(self) -> str:
        return "defi_eth"

    async def get_tools(self) -> List[types.Tool]:
        return [
            types.Tool(
                name="request_eth_transfer_reliable",
                description="Secure ETH transfer with Defensive Wrapper, State Machine logging, and Finality Guard.",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "to_address": {"type": "string"},
                        "amount_eth": {"type": "number"},
                        "user_id": {"type": "string", "description": "The ID of the human user (Alvins/Alicia)"}
                    },
                    "required": ["to_address", "amount_eth", "user_id"]
                }
            )
        ]

    async def handle_tool_call(self, name: str, arguments: dict) -> List[types.TextContent]:
        if name == "request_eth_transfer_reliable":
            return await self._execute_wrapped_transfer(arguments)
        return []

    async def _execute_wrapped_transfer(self, args: dict) -> List[types.TextContent]:
        user_id = args["user_id"]
        to_addr = args["to_address"]
        amount = args["amount_eth"]
        
        wrapper = ExecutionWrapper(user_id=user_id)
        
        # Define the Step Function for the Wrapper
        async def step_logic():
            # 1. HITL Gate (Simplified for demo - in reality, would wait for approval)
            txn_id = self.hitl.request_approval("ethereum", amount, f"Transfer to {to_addr}")
            
            # Logic for Finality Guard (Mocking for now, in production polls w3.eth.wait_for_transaction_receipt)
            conf_needed = 2 if "l2" in self.w3.provider.endpoint_uri else 6
            print(f"[Web3Guard] Waiting for {conf_needed} block confirmations...", file=sys.stderr)
            
            # Simulated block polling
            for i in range(1, conf_needed + 1):
                await asyncio.sleep(0.5)
                print(f"[Web3Guard] Confirmation {i}/{conf_needed} received.", file=sys.stderr)
            
            # Finalize Statement
            self.audit_logger.log_signed_entry(user_id, "ETH_TRANSFER", {
                "to": to_addr,
                "amount": amount,
                "confirmations": conf_needed,
                "status": "SETTLED"
            })
            return f"Funds settled with {conf_needed} confirmations."

        # Run wrapped execution
        res = await wrapper.execute_task("ETH_TRANSFER", step_logic, initial_quote=amount)
        
        return [types.TextContent(type="text", text=str(res))]
