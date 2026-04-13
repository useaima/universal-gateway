# Privacy Policy: UTG GaaS

## 1. Compliance (GDPR & CCPA)
UTG GaaS is designed with "Privacy by Design" principles. We adhere to the **General Data Protection Regulation (GDPR)** regarding the handling of autonomous transaction logs.

## 2. Data Sovereignty
- **Local Storage**: All "Signed Statements" and "Audit Vault" logs are stored locally on your machine or private DigitalOcean Droplet. This data is never sent to a central server.
- **Agent Memory**: Signed JSON receipts are accessible only by the authorized agent and the human owner.

## 3. Data Retention & Right to be Forgotten
- **The Vault**: Audit logs remain in the SQLite Vault until deleted by the user. 
- **Purge Tool**: Users can delete their data partition at any time, which permanently wipes the cryptographic history for that `user_id`.

## 4. Third-Party Disclosures
The Gateway interacts with:
- **Browserbase**: If using Cloud Browsers, session recordings are stored in your Browserbase dashboard.
- **Capsolver**: Metadata (not personal data) is sent to resolve CAPTCHAs.
- **Blockchain Nodes**: Transaction hashes are public on the blockchain.

---
*Last Updated: April 2026*
