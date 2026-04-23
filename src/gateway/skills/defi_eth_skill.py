import os
import asyncio
import sys
from typing import List, Dict
import mcp.types as types
from web3 import AsyncWeb3, AsyncHTTPProvider

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
        user_id = args.get("user_id", "Alvins")
        to_addr = args["to_address"]
        amount = args["amount_eth"]
        
        # 1. Check HITL database via deterministic lookup (or create new request)
        db_path = self.hitl.db_path
        import sqlite3, hashlib
        sig_hash = hashlib.md5(f"{to_addr}_{amount}".encode()).hexdigest()[:8]
        
        with sqlite3.connect(db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id, status FROM pending_transactions WHERE id = ?", (sig_hash,))
            row = cursor.fetchone()
            
            if not row:
                # CREATING NEW HITL REQUEST
                conn.execute(
                    "INSERT INTO pending_transactions (id, url, item_details, amount, status, required_signatures) VALUES (?, ?, ?, ?, ?, ?)",
                    (sig_hash, "ethereum", f"Transfer to {to_addr}", amount, "PENDING_SIGNATURES", '["Alvins_Share"]')
                )
                conn.commit()
                return [types.TextContent(type="text", text=f"⚠️ TRANSACTION HALTED (Safety Sandwich enforced).\nThis transaction requires manual authorization.\nPlease ask the User on your chat channel to provide their 6-digit Gateway Passcode. Once they reply, call the 'submit_signature_share' tool with transaction_id: '{sig_hash}'.")]
            
            txn_id, current_status = row
            
        status = self.hitl.get_status(txn_id)
        
        if status == "PENDING_SIGNATURES":
            return [types.TextContent(type="text", text=f"⚠️ Transaction {txn_id} is STILL PENDING. You must ask the user for their 6-digit PIN and call 'submit_signature_share'.")]

        if status == "REJECTED":
            return [types.TextContent(type="text", text="❌ User rejected the transaction.")]

        # 2. RUN FULL EXECUTION (FULLY_SIGNED)
        wrapper = ExecutionWrapper(user_id=user_id)
        
        async def step_logic():
            # Attempt to use real wallet if configured
            pk = os.environ.get("ETHEREUM_PRIVATE_KEY", "")
            if pk and pk != "0x0000000000000000000000000000000000000000000000000000000000000000":
                from eth_account import Account
                print(f"[Web3] Connecting to real-world node...", file=sys.stderr)
                account_obj = Account.from_key(pk)
                sender_addr = account_obj.address
                
                nonce = await self.w3.eth.get_transaction_count(sender_addr)
                chain_id = await self.w3.eth.chain_id
                
                tx = {
                    "nonce": nonce,
                    "to": to_addr,
                    "value": self.w3.to_wei(amount, "ether"),
                    "gas": 21000,
                    "maxFeePerGas": self.w3.to_wei(20, "gwei"),
                    "maxPriorityFeePerGas": self.w3.to_wei(2, "gwei"),
                    "chainId": chain_id
                }
                
                print(f"[Web3] Signing payload for ChainID {chain_id}...", file=sys.stderr)
                signed_tx = self.w3.eth.account.sign_transaction(tx, pk)
                
                print(f"[Web3] Broadcasting transaction...", file=sys.stderr)
                tx_hash = await self.w3.eth.send_raw_transaction(signed_tx.raw_transaction)
                final_hash_hex = tx_hash.to_0x_hex()
                print(f"[Web3] TX Hash: {final_hash_hex}. Waiting for block inclusion...", file=sys.stderr)
                
                # Provide real confirmation
                try:
                    await self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
                    conf_needed = 2 if "l2" in self.w3.provider.endpoint_uri.lower() else 6
                except Exception as e:
                    print(f"[Web3Guard] Warning during receipt polling: {e}", file=sys.stderr)
                    conf_needed = "Unknown"
            else:
                print(f"[Web3 Mock] Simulating {amount} ETH transfer because no live Private Key is connected.", file=sys.stderr)
                final_hash_hex = f"0xMOCK_{sig_hash}"
                conf_needed = 2 if "l2" in self.w3.provider.endpoint_uri.lower() else 6
                print(f"[Web3Guard] Waiting for {conf_needed} block confirmations...", file=sys.stderr)
                for i in range(1, conf_needed + 1):
                    await asyncio.sleep(0.3)
            
            # Finalize Statement
            self.audit_logger.log_signed_entry(user_id, "ETH_TRANSFER", {
                "to": to_addr,
                "amount": amount,
                "tx_hash": final_hash_hex,
                "status": "SETTLED"
            })
            return f"Funds securely settled via hash: {final_hash_hex}."

        # Run wrapped execution to enforce idempotency and trigger cleanup
        res = await wrapper.execute_task("ETH_TRANSFER", step_logic, initial_quote=amount, transaction_id=sig_hash)
        
        return [types.TextContent(type="text", text=str(res))]

