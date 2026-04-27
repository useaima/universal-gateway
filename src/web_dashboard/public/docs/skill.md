# Aima UTG Agent Skill Contract
# Version: 1.3.0
# Last Updated: 2026-04-27

## Introduction for Agents

You are an MCP-compatible agent client such as OpenClaw, Claude Desktop, or a custom operator runtime. You have been granted access to the **Universal Transaction Gateway (UTG)**, an open-source self-hosted gateway for agentic finance.

UTG is a mediated execution partner, not a secret store. You do not receive wallet custody. You ask the gateway to act, the gateway enforces policy and HITL, and then the operator decides whether settlement can continue.

> [!IMPORTANT]
> **Governance Rule 0:** Any value-moving action can halt for operator approval. Treat that halt as normal protocol behavior, not as a tool failure.

## Deployment Model

- Launch model: open-source, self-hosted first
- Primary integration path: MCP
- Stable execution rails: `base`, `ethereum`
- Observer/read-only rails: `bitcoin`, `solana`
- Operator channels: OpenClaw TUI, Claude Desktop, Telegram, Slack, or any custom chat surface layered on top of the gateway

## MCP Server Entry

```json
{
  "aima_utg": {
    "command": "python",
    "args": ["/absolute/path/to/universal-transaction-gateway/src/gateway/server.py"],
    "env": {
      "AIMA_API_KEY": "...",
      "BASE_RPC_URL": "...",
      "ETHEREUM_RPC_URL": "...",
      "TREASURY_ADDRESS": "0x..."
    }
  }
}
```

## Support Tiers

| Tier | Meaning |
| --- | --- |
| `stable` | Base/Ethereum transfers, HITL approval, dashboard telemetry, MCP integration |
| `beta` | Commerce search and browser-assisted checkout handover with configured providers |
| `experimental` | M-Pesa and fiat-adjacent payment rails |

## Protocol Rules

| Rule | Name | Agent requirement |
| --- | --- | --- |
| `01` | Safety Sandwich | Sensitive actions can halt before settlement. You must pause and wait for the operator approval path to complete. |
| `02` | Strict Idempotency | Retries are allowed, but preserve the same request context and idempotency key so the gateway can prevent duplicate settlement. |
| `03` | Non-custodial execution | Never assume direct wallet control. The gateway performs the mediated action when policy and HITL allow it. |
| `04` | Honest capability handling | If a tool returns `beta`, `experimental`, or `provider missing`, surface that clearly to the operator instead of inventing success. |

## Public Tools

### `request_eth_transfer_reliable`
- Tier: `stable`
- Purpose: request a Base or Ethereum transfer through the gateway
- Required fields: `to_address`, `amount_eth`, `user_id`
- Optional fields: `network` (`base` or `ethereum`)
- Expected behavior:
  1. initial call may halt and return a `transaction_id`
  2. ask the operator for their gateway approval code
  3. call `submit_signature_share`
  4. retry the original transfer request so the gateway can resume safely

### `submit_signature_share`
- Tier: `stable`
- Purpose: record the operator approval share for a halted transaction
- Required fields: `transaction_id`, `pin`
- Optional fields: `signer_name`
- Expected behavior: on success, retry the original transfer tool instead of inventing a new transaction

### `search_and_compare`
- Tier: `beta`
- Purpose: ask the gateway to use its configured commerce provider pattern
- Required fields: `item_name`, `max_price`
- Expected behavior:
  - if `COMMERCE_SEARCH_PROVIDER` is missing, the gateway should say so explicitly
  - if configured, present the resulting operator-safe summary back to the user

### `request_order`
- Tier: `beta`
- Purpose: prepare browser-assisted checkout or operator handover
- Required fields: `url`, `price_text`, `items`
- Expected behavior:
  - may require `BROWSER_HANDOVER_URL`
  - may require manual completion of CAPTCHA or 2FA
  - should never be described as a stable hands-free settlement path

### `request_human_handover`
- Tier: `beta`
- Purpose: pause automation and route the operator into the configured browser handover flow
- Required fields: `reason`

### `get_a2a_agent_card`
- Tier: `stable`
- Purpose: fetch the live discovery card for this gateway
- Usage: call this tool to verify the support matrix, public tools, networks, and governance rules exposed by the running gateway

## Integration Narratives

### OpenClaw TUI -> HITL -> Resume

1. call `request_eth_transfer_reliable`
2. receive a halted or pending response
3. ask the operator for the gateway approval code
4. call `submit_signature_share`
5. retry the original transfer request

### Custom agent -> x402 -> Retry

1. call a gateway-backed paid service
2. if the gateway returns an x402 challenge, surface the payment details to the operator
3. settle the payment proof
4. retry the original request with the same idempotency context

### Commerce -> Browser handover

1. call `search_and_compare`
2. if the gateway is not configured, surface the missing provider state honestly
3. if configured, call `request_order`
4. the operator completes the browser handover step

## Discovery and Verification

For richer documentation, browse:

- `https://utg.useaima.com/docs`
- `https://utg.useaima.com/docs/agent-integration`

For the machine-readable discovery surface, call:

- `get_a2a_agent_card`

---
Generated by Aima Engineering for MCP-first discovery.
