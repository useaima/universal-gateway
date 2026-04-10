import sys
import os
import getpass

# Adjust path to find core modules
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from core.hitl_manager import HITLManager

def main():
    print("--- UNIVERSAL GATEWAY: SECURE APPROVER ---")
    
    # 1. ACCESS SECURITY (Passcode Protection)
    # In a real GaaS, this would be a more robust Auth check
    passcode = getpass.getpass("Enter Gateway Passcode to sign: ")
    if passcode != os.environ.get("GATEWAY_PASSCODE", "1234"): # Default for MVP
        print("ACCESS DENIED: Invalid Passcode.")
        return

    if len(sys.argv) < 3:
        print("Usage: python cli_approver.py <TXN_ID> <NAME> <APPROVE/REJECT>")
        return

    txn_id = sys.argv[1]
    name = sys.argv[2]
    action = sys.argv[3].upper()

    hitl = HITLManager(db_path="../../artifacts/logs/transactions.db")
    
    if action == "APPROVE":
        status = hitl.approve(txn_id, name)
        print(f"\n[SIGNATURE SUCCESS] Signed by {name}.")
        print(f"Transaction {txn_id} logic: {status}")
    elif action == "REJECT":
        hitl.reject(txn_id)
        print(f"Transaction {txn_id} REJECTED by {name}.")
    else:
        print("Invalid action. Use APPROVE or REJECT.")

if __name__ == "__main__":
    main()
