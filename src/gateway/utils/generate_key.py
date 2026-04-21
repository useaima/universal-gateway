import argparse
from core.api_key_manager import ApiKeyManager

def main():
    parser = argparse.ArgumentParser(description="Aima UTG API Key Generator")
    parser.add_argument("--name", required=True, help="Descriptive name for this API key (e.g. 'OpenClaw-Main')")
    args = parser.parse_args()

    akm = ApiKeyManager()
    key = akm.generate_key(args.name)
    
    print("="*40)
    print("🚀 AIMA API KEY GENERATED")
    print("="*40)
    print(f"Name: {args.name}")
    print(f"Key:  {key}")
    print("="*40)
    print("⚠️ WARNING: This key is only shown ONCE. Save it immediately.")
    print("It has been hashed and stored in your local Vault.")

if __name__ == "__main__":
    main()
