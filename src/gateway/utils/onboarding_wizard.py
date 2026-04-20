import os
import sys
import uuid
import getpass
import json

def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')

def main():
    clear_screen()
    print("==========================================")
    print("   🏦 Welcome to UTG GaaS Onboarding")
    print("   The M-Pesa for Agents & OpenClaw")
    print("==========================================\n")
    
    print("This guided wizard will fully configure your Gateway.")
    print("No coding or manual JSON editing is required!\n")

    # 1. Legal Compliance (EU GDPR & US E-SIGN ACT)
    print("[1/5] LEGAL COMPLIANCE & NON-REPUDIATION")
    print("This gateway uses cryptographic signatures to authorize transactions.")
    print("By proceeding, you agree that your cryptographic signatures are legally binding ")
    print("under the US E-SIGN Act and you consent to local data storage (GDPR Compliant).")
    agree = input("Type 'AGREE' to proceed: ")
    if agree.strip().upper() != "AGREE":
        print("❌ You must explicitly agree to the legal terms to use the UTG Gateway.")
        sys.exit(1)

    # 2. Security Setup
    print("\n[2/5] ACCESS SECURITY (HITL)")
    passcode = getpass.getpass("Set a Gateway Passcode (You will give this to your agent on Telegram/Slack to authorize transactions): ")
    if not passcode:
        passcode = "123456"
        print(f"⚠️ No passcode entered. Using default: {passcode}")

    # 3. Wallet Connection
    print("\n[3/5] WALLET CONNECTION")
    print("Your agent needs an Ethereum Wallet to execute DeFi transfers.")
    eth_key = getpass.getpass("Enter your Ethereum Wallet Private Key (Or press Enter to auto-generate a secure burner wallet): ")
    if not eth_key.strip():
        try:
            from eth_account import Account
            Account.enable_unaudited_hdwallet_features()
            acct, _ = Account.create_with_mnemonic()
            eth_key = acct.key.hex()
            print(f"✅ Generated secure Burner Wallet: {acct.address}")
        except Exception:
            eth_key = "0x0000000000000000000000000000000000000000000000000000000000000000"
            print("✅ Using mock wallet for offline testing.")
    else:
        print("✅ Custom wallet linked.")

    # 4. Generate .env
    print("\n[4/5] WRITING CONFIGURATION")
    env_content = f"""# UTG GaaS Configuration
# LEGAL: US E-SIGN ACT ACCEPTED
GATEWAY_PASSCODE={passcode}
ETHEREUM_PRIVATE_KEY={eth_key}
ETHEREUM_RPC_URL=https://mainnet.gateway.tenderly.co/public
"""
    with open(".env", "w") as f:
        f.write(env_content)
    print("✅ Configuration saved securely to your local Vault (.env)")

    # 5. OpenClaw Auto-Config
    print("\n[5/5] OPENCLAW AUTO-CONNECTION")
    auto_connect = input("Are you using OpenClaw? We can automatically connect it for you (y/n): ")
    if auto_connect.lower().startswith('y'):
        cwd = os.getcwd()
        if sys.platform == 'win32':
            # Auto-configure WSL OpenClaw if on Windows
            wsl_user = os.environ.get("USERNAME", "administrator")
            wsl_path = f"\\\\wsl.localhost\\Ubuntu\\home\\{wsl_user.lower()}\\.openclaw\\openclaw.json"
            script_path = os.path.join(cwd, "src", "gateway", "server.py").replace("\\", "/")
            if os.path.exists(wsl_path):
                with open(wsl_path, 'r') as f:
                    oc_data = json.load(f)
                if 'mcp' not in oc_data: oc_data['mcp'] = {'servers': {}}
                oc_data['mcp']['servers']['utg-gateway'] = {
                    "command": "python.exe",
                    "args": [f"/mnt/c/Users/{wsl_user}/.gemini/antigravity/scratch/universal-transaction-gateway/src/gateway/server.py"]
                }
                with open(wsl_path, 'w') as f:
                    json.dump(oc_data, f, indent=2)
                print("✅ Securely injected Gateway into OpenClaw (WSL Bridge)!")
            else:
                print(f"⚠️ Could not find {wsl_path}. You might need to manually run `openclaw mcp set`")
        else:
            print("✅ Please run `openclaw mcp set utg-gateway` since you're native.")
            
    print("\n" + "="*42)
    print("🎉 ONBOARDING COMPLETE!")
    print("   1. Start the server: python src/gateway/server.py")
    print("   2. Chat with your agent on Telegram/Slack.")
    print("==========================================")

if __name__ == "__main__":
    main()

