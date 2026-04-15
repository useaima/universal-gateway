import asyncio
import sys
import os
import json

# Adjust path to find core modules
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "src", "gateway"))

from core.durable_executor import DurableExecutor, DurableWorkflowStep
from core.x402_handler import X402Handler, X402Error
from core.audit_logger import AuditLogger

async def showcase_flow():
    user_id = "Alvins-Meta-Demo"
    executor = DurableExecutor(user_id)
    logger = AuditLogger()
    
    print("\n" + "="*60)
    print("🚀 UTG GaaS: ACQUISITION-GRADE SHOWCASE (EVA STACK)")
    print("="*60 + "\n")

    # 1. SCENARIO: Agent hits an x402 Payment Wall
    print("[1/3] Case: Agent requests premium analysis (x402 Protocol)")
    try:
        # Simulate check for payment
        raise X402Handler.generate_payment_challenge(
            amount=5.0, 
            recipient="MetaAnalysisCorp", 
            reason="Llama-4 Inference Credits"
        )
    except X402Error as e:
        err_json = e.to_mcp_error()
        print(f"❌ HTTP 402 PAYMENT REQUIRED")
        print(f"   Amount: {err_json['headers']['X-402-Amount']} {err_json['headers']['X-402-Currency']}")
        print(f"   Target: {err_json['headers']['X-402-Recipient']}")

    # 2. RESOLUTION: Durable Workflow (M-Pesa -> Stablecoin Delivery)
    print("\n[2/3] Solving via Durable Execution (Saga Pattern)...")
    
    async def mpesa_debit():
        print("   ✅ [Step 1] M-Pesa Daraja 3.0 STK Push Sent.")
        await asyncio.sleep(1)
        print("   ✅ [Step 1] PIN Verified on phone.")
        return "MPESA_SUCCESS"

    async def swap_to_usdc():
        print("   ✅ [Step 2] Swapping KES to USDC on Base L2.")
        await asyncio.sleep(1)
        return "SWAP_SUCCESS"

    async def deliver_payload():
        print("   ✅ [Step 3] Delivering Payment Signature to x402 Recipient.")
        await asyncio.sleep(1)
        return "DELIVERY_SUCCESS"

    async def rollback_mpesa():
        print("   ⚠️ [Rollback] Refunding M-Pesa units to user account.")

    steps = [
        DurableWorkflowStep("MpesaDebit", mpesa_debit, rollback_mpesa),
        DurableWorkflowStep("UsdcSwap", swap_to_usdc),
        DurableWorkflowStep("X402Fulfillment", deliver_payload)
    ]

    result = await executor.run_workflow("Acquisition_Showcase_Alpha", steps)
    
    if result["status"] == "SUCCESS":
        print("\n🏆 WORKFLOW COMPLETE: Non-Custodial Settlement Finalized.")
    
    # 3. AUDIT: Generation of the Signed Statement
    print("\n[3/3] Generating Cryptographically Signed Statement for Vault...")
    pdf_path = logger.export_user_pdf(user_id)
    print(f"✅ Statement Exported: {pdf_path}")
    print("\n" + "="*60)
    print("UTG GaaS is ready for enterprise integration.")
    print("="*60 + "\n")

if __name__ == "__main__":
    asyncio.run(showcase_flow())
创新思维: UTG GaaS
