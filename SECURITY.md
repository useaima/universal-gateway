# Security Policy

UTG handles financial intent, approval state, wallet-linked identity, and operator-sensitive runtime data. The project therefore treats security work as release-blocking, not as optional cleanup.

## Supported Versions

Only the latest `main` release is actively supported for security fixes.

| Version | Supported |
| --- | --- |
| latest `main` | yes |
| older snapshots | no |

## Report a Vulnerability

Please do **not** disclose financial or approval-bypass vulnerabilities publicly.

Report them to:

- `security@useaima.com`

Include:

- a description of the issue
- reproduction steps
- impact on approvals, settlement, replay protection, identity, or operator data
- any mitigation ideas if you have them

## Security Expectations

### Secrets and identity

- Do not commit API keys, PATs, Firebase Admin credentials, private keys, or runtime databases.
- `SIWE_NONCE_SECRET` is required for wallet-sign-in nonce issuance and verification.
- Configure either `UTG_IDENTITY_KEY_PATH` or `UTG_IDENTITY_PRIVATE_KEY_PEM` for the gateway identity.
- Keep `UTG_STORAGE_DIR` outside the repository so SQLite logs, exports, and PDFs remain untracked.

### Approvals and HITL

- `GATEWAY_PASSCODE` must be explicitly configured.
- Approval flows must fail closed when the passcode is missing or incorrect.
- Value-moving actions should halt cleanly and resume only after a valid approval share is recorded.

### Auth and wallet verification

- SIWE nonce issuance and verification are server-side only.
- Nonces expire quickly and are consumed once to reject replay.
- Domain and chain checks must match the configured runtime policy.
- Never derive auth secrets from public `VITE_*` config values.

### Data handling

- Firebase Admin credentials remain server-side only.
- Dashboard and telemetry surfaces should expose only operator-necessary metadata.
- Audit payloads may be encrypted at rest; consumers must use the shared decode path and degrade safely if data is unreadable.

## Repository Guardrails

The repository uses GitHub-native checks to catch risky changes before they land on `main`:

- CodeQL
- secret scanning
- dependency audits
- SBOM generation
- contract assertions across README, docs, `skill.md`, and runtime

`main` should be protected so merges require passing checks and up-to-date branches.

## Incident Response

If a secret is pasted into chat, committed to git, or pushed to a remote:

1. revoke or rotate it immediately
2. remove it from HEAD
3. rewrite git history if it was committed
4. force-push the cleaned history
5. verify secret scanning passes on the cleaned state

For a finance-facing gateway, assume exposed secrets are compromised even if they were only visible briefly.
