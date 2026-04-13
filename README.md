# 🏦 UTG GaaS: Universal Transaction Gateway
**The M-Pesa for AI Agents & OpenClaw.**

UTG GaaS is a high-security, professional "Payments & Transaction Node" for AI agents. It allows agents like **Claude (OpenClaw)** to perform a secure checkout, DeFi trades, and signed business transactions with human-in-the-loop safety.

---

## 🚀 One-Click Onboarding
We’ve built UTG GaaS for everyone—no coding required.

1. **Install**:
   ```bash
   pip install .
   ```
2. **Setup**:
   ```bash
   utg-onboard
   ```
   *Follow the friendly wizard to set your passcode and generate your secure keys.*

---

## 🦀 OpenClaw Integration
UTG GaaS is optimized for **OpenClaw**. 

After running `utg-onboard`, copy the provided JSON snippet into your OpenClaw `mcpServers` configuration:

```json
"mcpServers": {
  "utg-gateway": {
    "command": "python",
    "args": ["/path/to/src/gateway/server.py"]
  }
}
```

---

## 🛡️ Reliability & Security
- **Defense-First Execution**: Atomic state machine prevents double-purchasing.
- **Legal Auditor**: Generates Ed25519-signed PDF statements for every transaction.
- **Stealth Layer**: Local Camoufox or Cloud Browserbase support.
- **Global Compliance**: Adheres to US E-SIGN and EU GDPR principles.

## 🏛️ License
This project is licensed under the **MIT License**.

## 🆘 Support
Find a bug? Open an issue on our [GitHub Issues](https://github.com/Alvins-mukabane/universal-gateway/issues) page.
