import sqlite3
import sys

def main():
    if len(sys.argv) < 3:
        print("Usage: python cli_approver.py <transaction_id> <APPROVE|REJECT>")
        sys.exit(1)
        
    transaction_id = sys.argv[1]
    status = sys.argv[2].upper()
    
    # We should reuse hitl_manager here
    from hitl_manager import HITLManager
    manager = HITLManager()
    
    if status == "APPROVE":
        manager.approve(transaction_id)
        print(f"Transaction {transaction_id} approved.")
    elif status == "REJECT":
        manager.reject(transaction_id)
        print(f"Transaction {transaction_id} rejected.")
    else:
        print("Invalid status. Use APPROVE or REJECT.")

if __name__ == "__main__":
    main()
