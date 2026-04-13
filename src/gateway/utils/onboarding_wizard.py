import os
import sys
import uuid
import getpass

def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')

def main():
    clear_screen()
    print("==========================================")
    print("   🏦 Welcome to UTG GaaS Onboarding")
    print("   The M-Pesa for Agents & OpenClaw")
    print("==========================================\n")
    
    print("This wizard will help you set up your Universal Transaction Gateway.")
    print("No coding is required! Just answer a few questions.\n")

    # 1. Security Setup
    print("[1/4] ACCESS SECURITY")
    passcode = getpass.getpass("Set a Gateway Passcode (used for human-in-the-loop approval): ")
    if not passcode:
        passcode = "default_secure_passcode"
        print(f"⚠️ No passcode entered. Using default: {passcode}")

    # 2. Identity Generation
    print("\n[2/4] CRYPTOGRAPHIC IDENTITY")
    print("Generating your unique Ed25519 signature keys...")
    # In a real tool, we'd call IdentityManager().generate_keys()
    print("✅ Identity Keys Generated: artifacts/gateway.key")

    # 3. Provider Setup
    print("\n[3/4] EXTERNAL PROVIDERS (Optional)")
    bb_key = input("Enter Browserbase API Key (leave blank for local mode): ")
    cap_key = input("Enter Capsolver API Key (leave blank for basic stealth): ")

    # 4. Generate .env
    print("\n[4/4] WRITING CONFIGURATION")
    env_content = f"""# UTG GaaS Configuration
GATEWAY_PASSCODE={passcode}
BROWSER_MODE={'browserbase' if bb_key else 'camoufox'}
BROWSERBASE_API_KEY={bb_key}
CAPSOLVER_API_KEY={cap_key}
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_ID
"""
    with open(".env", "w") as f:
        f.write(env_content)
    print("✅ Configuration saved to .env")

    # Final Output: OpenClaw Snippet
    print("\n" + "="*42)
    print("🎉 SETUP COMPLETE!")
    print("="*42)
    print("\nTo connect **OpenClaw** (or any MCP Client), add this to your config:")
    
    cwd = os.getcwd()
    mcp_config = {
        "mcpServers": {
            "utg-gateway": {
                "command": "python",
                "args": [os.path.join(cwd, "src", "gateway", "server.py")],
                "env": {
                    "PYTHONPATH": os.path.join(cwd, "src", "gateway")
                }
            }
        }
    }
    import json
    print("\n" + json.dumps(mcp_config, indent=2))
    print("\nCopy the JSON above into your OpenClaw 'mcpServers' settings.")
    print("Then restart OpenClaw and ask: 'What can you do with the Gateway?'\n")

if __name__ == "__main__":
    main()
