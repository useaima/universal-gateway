import asyncio
import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), "..", "src", "gateway"))

from core.hitl_manager import HITLManager
from skills.defi_eth_skill import DeFiEthSkill


async def main():
    print("--- UTG Manual HITL Flow Demo ---")
    skill = DeFiEthSkill()
    args = {
        "to_address": "0xAliciaWalletAddress000000000000000000000000",
        "amount_eth": 0.1,
        "user_id": "Alvins",
        "network": "base",
    }

    print("\n1. Agent requests a transfer...")
    first = await skill.handle_tool_call("request_eth_transfer_reliable", args)
    print(first[0].text)

    txn_id = first[0].text.split("transaction_id: '")[1].split("'")[0]

    print(f"\n2. Operator submits the approval share for {txn_id}...")
    hitl = HITLManager()
    print(hitl.submit_signature_share(txn_id, "Alvins_Share"))

    print("\n3. Agent retries the original request...")
    second = await skill.handle_tool_call("request_eth_transfer_reliable", args)
    print(second[0].text)


if __name__ == "__main__":
    asyncio.run(main())
