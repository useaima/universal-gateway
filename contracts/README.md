# UTG Base Contracts

This workspace contains the first Base-oriented UTG contract surface.

Scope for this release:
- `TreasuryReceiver`: anchors Base payment receipts and optional native/token sweeps
- `PolicyRegistry`: stores operator policy hashes and allowed network flags
- `ExecutionReceiptRegistry`: stores execution receipt digests without introducing custody

These contracts are intentionally minimal. They complement the Python gateway and Firebase data plane instead of replacing them.

## Layout

- `src/TreasuryReceiver.sol`
- `src/PolicyRegistry.sol`
- `src/ExecutionReceiptRegistry.sol`
- `script/DeployUTGSuite.s.sol`

## Suggested workflow

1. Install Foundry.
2. If you want to run the deploy script, install `forge-std`:
   - `forge install foundry-rs/forge-std`
3. Export the environment variables used by the script:
   - `PRIVATE_KEY`
   - `SETTLEMENT_TOKEN`
   - `TREASURY_OPERATOR`
   - `POLICY_ADMIN`
4. Build:
   - `forge build`
5. Deploy to Base Sepolia or Base Mainnet:
   - `forge script script/DeployUTGSuite.s.sol:DeployUTGSuite --rpc-url $BASE_RPC_URL --broadcast`

## Design notes

- The suite is non-custodial by default. Base Pay can still settle directly to an operator treasury wallet.
- `TreasuryReceiver.recordBasePayPayment(...)` is useful when you want to anchor an offchain Base Pay reconciliation record onchain.
- `ExecutionReceiptRegistry` stores digests and references, not full payloads, so sensitive operational detail can remain offchain while still being provable.
