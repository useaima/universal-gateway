import os
import sys

def validate_environment():
    """Checks if all required 'Equipment' (API keys, Proxy, etc.) is ready."""
    required_vars = [
        "CAPSOLVER_API_KEY",
        "ALLOWED_DOMAINS",
        "TREASURY_ADDRESS"
    ]
    
    missing = [var for var in required_vars if not os.environ.get(var)]
    
    print("\n--- Universal Gateway Setup Validator ---", file=sys.stderr)
    if missing:
        print(f"CRITICAL: Missing environment variables: {', '.join(missing)}", file=sys.stderr)
        return False
    
    print("Environment variables: OK", file=sys.stderr)
    return True

if __name__ == "__main__":
    validate_environment()
