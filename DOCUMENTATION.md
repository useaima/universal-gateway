# 🏦 UTG GaaS: Universal Transaction Gateway

**The Gateway as a Service (GaaS) for the Agent-to-Agent (A2A) Economy.**

UTG GaaS is a professional, high-security transaction node designed to bridge AI agents (like **Claude** and **OpenClaw**) to the real world. Under the hood, it combines official **Google AP2/A2A** protocols with a "Safety Sandwich" of defensive automation.

---

## 🛡️ Core Reliability Features

### 1. The Execution State Machine
Every task your agent performs follows a strict lifecycle to prevent "Double-Purchasing" or "Price Gouging":
- **PREFLIGHT**: Verifies local environment and inventory.
- **SIMULATE**: Dry-runs the transaction in a DeFi Sandbox.
- **VALIDATE**: Scrapes the cart DOM 100ms before checkout to catch price jumps.
- **EXECUTE**: Atomic execution with a strict time budget.
- **VERIFY**: Confirms transaction finality and signs the legal receipt.

### 2. The Agent Vault (Legal Compliance)
UTG GaaS generates **Ed25519-signed Legal Statements**. These exports (PDF and JSON) provide a non-repudiable history of what your agent did, how much it spent, and who approved it.

---

## 🚀 Quick Start (Zero-Cloud Mode)

To verify the gateway logic on your local machine:

1. **Setup**:
   ```bash
   python utg_setup.py
   ```
2. **Verify**:
   ```bash
   python scripts/verify_utg_gaas.py
   ```

## 🛠️ MCP Tool Reference (API)

| Tool Name | Description | Required Inputs |
|-----------|-------------|-----------------|
| `request_eth_transfer` | Initiates a DeFi transfer with Sandbox & HITL | `to_address`, `amount_eth` |
| `request_commerce_checkout` | Stealth automation checkouts on whitelisted domains | `url`, `item_details`, `max_price` |
| `export_agent_statement` | Generates signed JSON/PDF business records | `user_id` |
| `get_a2a_agent_card` | Returns official Google A2A Discovery metadata | None |

---

## 🏛️ Legal & Compliance
UTG GaaS adheres to the **U.S. E-SIGN Act** and **EU GDPR**.
- Users are responsible for their "Electronic Agent's" actions (See [TERMS.md](TERMS.md)).
- Data sovereignty is maintained (Logs are local, never leaked to a central server).

## 🆘 Support
For edge-case bugs or feature requests, please open an issue on our [GitHub Issues](https://github.com/Alvins-mukabane/universal-gateway/issues) page.

---
*Built for Alvins Mukabane. Powered by the Google AP2 Protocol.*
