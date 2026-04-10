import os
import sys
import subprocess
from pathlib import Path

# Adjust path to find core modules for identity gen
sys.path.append(os.path.join(os.path.dirname(__file__), "src"))
try:
    from gateway.core.identity_manager import IdentityManager
except ImportError:
    # If not yet installed, we will handle this after pip install
    IdentityManager = None

def main():
    print("--- UNIVERSAL TRANSACTION GATEWAY (UTG) SETUP ---")
    print("Goal: Preparing your GaaS for Alvins and Alicia...")

    # 1. Pip Install (Local Mode)
    print("\n[1/4] Installing dependencies...")
    subprocess.run([sys.executable, "-m", "pip", "install", "-e", "."], check=True)

    # 2. Browser Binaries
    print("\n[2/4] Fetching high-stealth browser binaries (Camoufox)...")
    subprocess.run([sys.executable, "-m", "camoufox", "fetch"], check=True)
    subprocess.run([sys.executable, "-m", "playwright", "install", "chromium"], check=True)

    # 3. Identity Generation
    print("\n[3/4] Generating Gateway Cryptographic Identity...")
    if IdentityManager:
        id_manager = IdentityManager()
        print(f"Identity Generated: {id_manager.get_public_key_hex()[:20]}...")
    else:
        print("Identity manager not found. Please run 'utg-setup' again after environment refresh.")

    # 4. Environment Scaffolding
    print("\n[4/4] Scaffolding environment...")
    env_path = Path(".env")
    if not env_path.exists():
        env_content = (
            "CAPSOLVER_API_KEY=your_key_here\n"
            "TENDERLY_API_KEY=your_key_here\n"
            "ETHEREUM_RPC_URL=https://mainnet.gateway.tenderly.co/public\n"
            "TREASURY_ADDRESS=0xYourTreasuryAddress\n"
            "SERVICE_FEE_PERCENT=0.01\n"
            "GATEWAY_PASSCODE=1234\n"
            "ALLOWED_DOMAINS=amazon.com,ebay.com,wikipedia.org\n"
        )
        with open(env_path, "w") as f:
            f.write(env_content)
        print("Created .env template. Please add your API keys!")
    else:
        print(".env already exists. Skipping.")

    print("\n--- SETUP COMPLETE ---")
    print("Commands available now:")
    print("  utg-server   : Starts the Gateway Service")
    print("  utg-approver : Opens the Secure Signing CLI")
    print("\nReady for Alvins and Alicia's agents to connect!")

if __name__ == "__main__":
    main()
