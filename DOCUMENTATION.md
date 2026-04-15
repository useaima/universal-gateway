UTG GaaS is a professional, high-security transaction node designed to bridge AI agents (like **Claude** and **OpenClaw**) to the real world. Powered by the **Eva Protocol Stack (v2.0)**, it implements the leading standards for agentic finance: **x402 (HTTP 402)**, **Durable Sagas (Durable Execution)**, and **Daraja 3.0 (M-Pesa)**.

---

## 🏛️ The Eva Protocol Stack (v2.0)

### 1. The Idempotent Execution Engine
We prioritize **Consistency (CP)** over Availability. Using industrial-grade `X-Idempotency-Keys`, the gateway ensures that even if an agent retries a transaction 100 times, the funds are only moved once. This prevents the "Double-Spend" catastrophe common in early agentic systems.

### 2. x402: Payment-Required Handshake
Aligned with the **Coinbase/Nevermined 2026 x402 Standard**, UTG GaaS handles "Paid API" walls automatically.
- **Handshake**: Returns a 402 status when a resource requires payment.
- **Resolution**: Allows the agent to solve the challenge by presenting a signed M-Pesa mandate.

### 3. Durable Sagas (Temporal-Style Execution)
Financial workflows are multi-step (e.g., M-Pesa Debit -> Swap -> Wallet Credit). UTG GaaS uses a **Durable Executor** to track every state change. If step 3 fails, the system automatically triggers **Compensating Actions** (Rollbacks) to ensure user funds are always reconciled.

### 4. M-Pesa 3.0 Compliance
Using the latest **Daraja 3.0 signatures**, we cryptographically verify every payment callback from Safaricom to prevent spoofing and unauthorized manual balance updates.

---

## ☁️ 100% Free Hosting (The Cloudflare Strategy)

Because this gateway requires a heavy Python environment with browser automation engines (Playwright), it cannot be hosted on serverless platforms like Cloudflare Workers or Vercel. 

However, since your domain (`useaima.com`) is on Cloudflare, you can host the entire system **for free** using this architecture:

### 1. The Documentation Site (Cloudflare Pages)
Host the HTML/CSS documentation portal on the edge for free.
- Go to Cloudflare Dashboard -> **Pages** -> Connect your GitHub repo.
- Point it to the `docs_site` folder.
- Assign the custom domain: `utg.useaima.com`.

### 2. The Gateway Server (Localhost + Cloudflare Tunnels)
Run the heavy Python server directly on your laptop (Free) and expose it securely to the world (so Safaricom M-Pesa webhooks and other agents can reach it).
- **Start the Gateway locally:** `utg-server`
- **Install Cloudflared:** Download the Cloudflare Tunnel daemon.
- **Expose it:**
  ```bash
  cloudflared tunnel --url http://localhost:8080
  ```
- This gives you a secure `https://xxx.trycloudflare.com` link (or you can map it to `api.utg.useaima.com` in your dashboard). You never have to pay for a DigitalOcean server.

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
