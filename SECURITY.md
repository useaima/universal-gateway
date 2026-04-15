# Security Policy

## Supported Versions

Currently, only the latest release of the Universal Transaction Gateway (`utg-gaas`) is actively supported for security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of the UTG GaaS incredibly seriously. Financial protocols and agent wallets must treat vulnerabilities with extreme caution.

If you discover a security vulnerability within UTG GaaS, **please do not disclose it publicly.** 

Instead, report it via email to **security@useaima.com**. You may also reach out directly to the maintainers via a private GitHub message if permitted by your settings.

### What to include in your report
- A detailed description of the vulnerability.
- Steps to reproduce the issue.
- Potential impact (e.g., unauthorized access, double-spending, X-Idempotency-Key bypass).
- Any suggested mitigations.

### Response Timeline
- **Acknowledgment**: Within 48 hours.
- **Triage**: Within 5 business days, we will classify the vulnerability and begin working on a fix.
- **Resolution**: High-severity issues impacting the `durable_executor` or `hitl_manager` will be patched rapidly.

### Bounties
Currently, we do not operate a formal bug bounty program, but we sincerely appreciate contributions that keep the open-source agentic commerce ecosystem safe. Significant disclosures may be recognized publicly (with your permission).
