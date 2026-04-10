import sys
import os

# Adjust path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from core.audit_logger import AuditLogger

def main():
    print("Generating official signed statement for user: Alvins...")
    logger = AuditLogger()
    
    # 1. Export JSON for Agent
    json_path = logger.export_agent_json("Alvins")
    print(f"Agent JSON exported to: {json_path}")
    
    # 2. Export PDF for User
    pdf_path = logger.export_user_pdf("Alvins")
    print(f"Professional PDF exported to: {pdf_path}")
    
    print("\nVerification Complete. Statement is ready.")

if __name__ == "__main__":
    main()
