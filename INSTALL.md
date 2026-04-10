# 📦 Universal Transaction Gateway (UTG) - Setup Guide

This guide is for **Alvins**, **Alicia**, and their agents (e.g. OpenClaw) to install and run the Gateway as a Service (GaaS).

## 🚀 One-Click Installation

1. **Clone & Setup**:
   ```bash
   python utg_setup.py
   ```
   This will install all dependencies, download the high-stealth Camoufox browser, and generate your gateway's cryptographic identity.

2. **Configure**:
   Open the `.env` file and add your keys:
   - `CAPSOLVER_API_KEY`: For bypassing CAPTCHAs.
   - `TENDERLY_API_KEY`: For the DeFi Sandbox simulation.
   - `GATEWAY_PASSCODE`: Your master signing secret (Default: 1234).

## 🔌 Connecting your Agent

### Claude Desktop (MCP)
Add this to your `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "universal-gateway": {
      "command": "utg-server",
      "env": {
        "PYTHONUTF8": "1"
      }
    }
  }
}
```

### OpenClaw / Custom Agents
Point your agent to the local UTG server via standard MCP stdio pipes.

## 🏦 Using the Gateway

1. **Start the Server**:
   ```bash
   utg-server
   ```
2. **Authorize as a Human**:
   When your agent initiates a high-stakes trade, you'll see a Transaction ID. Review it and sign off:
   ```bash
   utg-approver <TXN_ID> <YOUR_NAME> APPROVE
   ```

3. **View Statements**:
   Your "Bank Statement" PDF and Signed JSON are automatically generated in `artifacts/logs/`.

---
*Built for the Agent-to-Agent (A2A) Economy. Secure. Immutable. Legally Verifiable.*
