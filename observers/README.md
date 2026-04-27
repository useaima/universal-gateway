# UTG Chain Observers

This workspace holds the read-only chain observers for networks that UTG does not execute on directly in the first Base-native release.

Current focus:
- Bitcoin balance visibility
- Solana balance visibility
- normalized publishing into Firebase Realtime Database under `portfolio_live/*`

## Why a separate workspace?

UTG executes Base and Ethereum flows through the Python gateway today. Bitcoin and Solana are intentionally observer-backed in this phase, so we keep the indexing code isolated and lightweight.

## Current crate

- `crates/chain-observer`

## Environment

- `FIREBASE_DATABASE_URL`
- `FIREBASE_DATABASE_AUTH_TOKEN` (optional; required when RTDB rules do not allow public writes)
- `BITCOIN_API_BASE` (defaults to mempool.space)
- `BITCOIN_ADDRESSES` (comma-separated)
- `SOLANA_RPC_URL` (defaults to `https://api.mainnet-beta.solana.com`)
- `SOLANA_ADDRESSES` (comma-separated)

## Behavior

The observer fetches BTC and SOL balances, normalizes them into `portfolio_live/assets/{assetId}`, and updates `portfolio_live/summary`. If RTDB credentials are absent, it prints the normalized payload to stdout so you can validate the observer without writing data.
