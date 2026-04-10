import asyncio
import sys
import os

# Adjust path to find core modules
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "src", "gateway"))
from core.hitl_manager import HITLManager
from skills.defi_eth_skill import DeFiEthSkill

async def main():
    print("--- Alvins & Alicia A2A Transaction Test ---")
    skill = DeFiEthSkill()
    
    # 1. Initiate Transfer with Dual-Approval Required
    print("\n1. Alvins Agent requesting 0.1 ETH transfer to Alicia's address...")
    resp = await skill.handle_tool_call("request_eth_transfer", {
        "to_address": "0xAliciaWalletAddress",
        "amount_eth": 0.1,
        "required_approvers": ["Alvins", "Alicia"]
    })
    
    msg = resp[0].text
    print(msg)
    
    # Extract Txn ID
    txn_id = msg.split("Transaction ID:")[1].split("\n")[0].strip()
    
    # 2. Check Status (Should be PENDING for Alvins and Alicia)
    print(f"\n2. Checking status of {txn_id}...")
    status_resp = await skill.handle_tool_call("check_eth_status", {"transaction_id": txn_id})
    print(status_resp[0].text)
    
    # 3. Alvins Approves
    print(f"\n3. Alvins providing their signature...")
    skill.hitl.approve(txn_id, "Alvins")
    
    # 4. Check Status (Should be PENDING for Alicia)
    print(f"\n4. Checking status after Alvins approved...")
    status_resp = await skill.handle_tool_call("check_eth_status", {"transaction_id": txn_id})
    print(status_resp[0].text)
    
    # 5. Alicia Approves
    print(f"\n5. Alicia providing her signature...")
    skill.hitl.approve(txn_id, "Alicia")
    
    # 6. Final Status (Should be BROADCAST)
    print(f"\n6. Checking final status after both approved...")
    status_resp = await skill.handle_tool_call("check_eth_status", {"transaction_id": txn_id})
    print(status_resp[0].text)

if __name__ == "__main__":
    asyncio.run(main())
