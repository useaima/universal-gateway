# Terms of Service: UTG GaaS (Universal Transaction Gateway)

## 1. The Electronic Agent Relationship
By using this software, you acknowledge that any AI agent (the "Electronic Agent") you authorize to interact with this Gateway acts as your tool and legal representative. Under the **U.S. Electronic Signatures in Global and National Commerce Act (E-SIGN)** and the **Uniform Electronic Transactions Act (UETA)**, contracts formed by an electronic agent are legally binding on the person who authorized the agent.

## 2. User Responsibility & Proxy Automation Indemnification
- **Authorization**: You are responsible for all transactions initiated by your agent through this Gateway.
- **Automation & CFAA Waiver**: The UTG uses proxy-less automation (e.g., Playwright) to execute transactions. You explicitly acknowledge that using automated scripts on third-party platforms (like Amazon, eBay, etc.) may violate their Terms of Service. **You agree to completely indemnify and hold harmless the developers of UTG** from any civil litigation, account bans, IP bans, or claims of unauthorized access (including under the Computer Fraud and Abuse Act or similar EU Directives) resulting from your agent's actions.
- **Guardrails**: You must ensure that your agent's "Safety Sandwich" policies and "Intent Mandates" are correctly configured for your risk tolerance.
- **Key Management**: You are responsible for the security of your private Ed25519 "Gateway Identity" keys and your `GATEWAY_PASSCODE`.

## 3. Data Privacy & GDPR Consent
- **Consent to Processing**: By utilizing UTG, you consent to the processing of necessary session data, cookies, and transaction payloads to facilitate checkout automation.
- **Crypto-Shredding (Right to Erasure)**: UTG employs an immutable cryptographic ledger for security auditing. In compliance with GDPR Article 17, your Personally Identifiable Information (PII) is symmetrically encrypted before being hashed. You retain the right to request "crypto-shredding," wherein your unique decryption key is permanently destroyed, rendering your PII irrecoverable while maintaining the ledger's hash integrity.
- **Automated Decision Making**: UTG incorporates a Human-In-The-Loop (HITL) authorization system to prevent high-risk transactions from occurring solely via automated processing, in compliance with GDPR Article 22.

## 4. Financial Regulations & PSD2
- **3D-Secure Responsibilities**: For fiat transactions in the EU subject to PSD2 Strong Customer Authentication (SCA), you are responsible for monitoring the UTG WebSocket relay to provide SMS/OTP verification when prompted by your financial institution.

## 5. Limitation of Liability
The UTG GaaS developer (Alvins Mukabane) is not liable for:
- Autonomous financial errors made by the AI agent.
- Market volatility or transaction failures on third-party platforms.
- Malicious exploits resulting from insecure local key storage.

## 6. Refundability
Transactions conducted on-chain (Web3) or through automated e-commerce checkouts are subject to the terms of the merchant or the smart contract. The Gateway provides an "Audit Vault" to assist with disputes, but does not guarantee refundability for autonomous actions.

---
*Last Updated: April 2026*
