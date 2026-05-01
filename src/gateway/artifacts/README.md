Runtime state must not be committed here.

UTG stores operator-sensitive files outside the repository in production:

- `UTG_STORAGE_DIR` for SQLite lifecycle data and generated exports
- `UTG_IDENTITY_KEY_PATH` or `UTG_IDENTITY_PRIVATE_KEY_PEM` for the gateway identity

This folder exists only as a compatibility placeholder for older local checkouts. Do not place live keys,
runtime databases, PDFs, or export artifacts under `src/gateway/artifacts/`.
