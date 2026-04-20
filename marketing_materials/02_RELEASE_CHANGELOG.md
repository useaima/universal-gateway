# Changelog: Universal Transaction Gateway (UTG) v1.0.0

## [1.0.0] - 2026-04-20
**The "Enterprise Protocol" Release**

Aima is proud to announce the monumental v1.0.0 release of the Universal Transaction Gateway. This release marks the transition of UTG from an experimental proxy into a fully verifiable, non-custodial, and legally compliant financial protocol designed for Agentic Commerce.

### 🚀 Major Features
- **The Eva Protocol Stack:** A complete overhaul of the core architecture to support high-stakes agentic transactions across Web2 (M-Pesa) and Web3 (Ethereum).
- **Strict HITL (Human-in-the-Loop):** Agents can no longer bypass wallet approvals. Transactions are physically halted and returned to the channel (e.g., Telegram), awaiting a 6-digit cryptographic PIN from the user.
- **Model Context Protocol (MCP) Natively integrated:** Out-of-the-box support for **OpenClaw** and **Claude Desktop**, allowing seamless stdio communication between the AI "Brain" and the UTG "Hands."
- **Interactive Onboarding Wizard:** Zero-JSON-editing UX. A beautiful CLI wizard that automatically provisions Ed25519 legal signatures, bridges WSL configurations, and connects OpenClaw in three clicks.

### 🛡️ Security & Reliability (The Safety Sandwich)
- **Global Idempotency Manager:** Ensures that network glitches, retries, or AI hallucinations can *never* result in a double-spend. 
- **Durable Sagas & Compensating Rollbacks:** Multi-step transactions (e.g. Swapping ETH -> Paying Vendor) are tracked holistically. If step 2 fails, step 1 is automatically reversed.
- **M-Pesa 3.0 Cryptographic Handshakes:** Fully supports Daraja 3.0 `X-Mpesa-Signature` HMAC-SHA256 verification, preventing malicious actors from spoofing payment webhooks.
- **x402 Integration:** Natively implements the HTTP `402 Payment Required` standard. The AI can now hit paywalled APIs, receive the 402 challenge, and resolve the payment dynamically via the gateway.

### ⚖️ Enterprise Governance
- **Zero-Knowledge / Non-Custodial Vaults:** Local SQLite architecture guarantees zero external data exfiltration, ensuring 100% EU GDPR Data Residency compliance.
- **US E-SIGN ACT Readiness:** Every transaction dynamically generates an immutable, signed PDF document for tax and legal non-repudiation.
- **Open Source Standards:** Integrated `SECURITY.md`, `CODE_OF_CONDUCT.md`, and enterprise grading issue templates ready for corporate procurement review (Targeted at Meta/Stripe acquisition standards).
