# Engineering the Non-Custodial "Safety Sandwich" for Agentic Commerce
**Published By**: Engineering at Aima  
**Intended For**: Hacker News / Technical Stakeholders  

At Aima, we’ve spent months researching the "Agentic Liability" problem. When an AI agent merely reads a file or searches the web, autonomous execution is low-risk. However, as commerce shifts to machine-to-machine transactions, the risk profile changes fundamentally. 

The industry is currently divided between custodial SaaS solutions (where you give your keys to a third party) and "yolo" autonomy (where the agent has raw access to your wallet). Neither is acceptable for institutional or privacy-conscious users.

Today, we are open-sourcing Aima’s **Universal Transaction Gateway (UTG)**, a Python-based protocol that introduces the "Safety Sandwich." Here is the technical breakdown of how we engineered a solution that halts autonomous agents without breaking their reasoning loops.

## The Architecture of a Physical Handoff
In standard MCP (Model Context Protocol) implementations, a tool call is atomic: the LLM sends a request, the tool executes, and returns a result. 

Aima engineers redesigned this flow to be asynchronous and state-driven. Instead of executing financial code immediately, the UTG intercepts the payload and writes it to a local SQLite database under a `PENDING_SIGNATURES` lock.

```python
# The Gateway intercepts the tool call...
sig_hash = hashlib.md5(f"{to_addr}_{amount}".encode()).hexdigest()[:8]

# Physically halts the execution and throws it back to the agent:
return [types.TextContent(
    type="text", 
    text=f"⚠️ TRANSACTION HALTED. This transaction requires manual authorization. Please ask the User on your chat channel to provide their 6-digit Gateway Passcode. Once they reply, call the 'submit_signature_share' tool."
)]
```

### The Out-of-Band Handover
Because the agent expects to complete its task, receiving this error text forces it to adapt. If you are using OpenClaw or an agent connected to Discord/Telegram, the AI will instantly pivot and text you on your phone:

*"Hey, I tried to invest $50, but the Gateway stopped me. It needs your 6-digit PIN to proceed."*

### Multi-Party Computation (MPC) Validation
When you reply with `"123456"`, the AI processes your text and makes a second tool call: `submit_signature_share(pin)`.

The Gateway wakes up, validates the PIN against your heavily encrypted `.env` vault, and applies the "Signature Share" to the SQLite Row.

Once "Consensus" is reached, the Gateway (not the AI) reaches into your private keys and signs the raw Ethereum transaction:

```python
```python
if status == "FULLY_SIGNED":
    # The agent is never granted visibility into the signing kernel.
    # Only the UTG process on localhost touches the decrypted private key.
    w3.eth.send_raw_transaction(signed_txn.rawTransaction)
```

## Solving for Financial Chaos: Edge Cases & Resilience
Building a finance gateway for an unpredictable AI brain introduced several high-stakes engineering challenges that the Aima team had to solve:

### 1. The Idempotency Collision
In a distributed environment, an agent might experience a timeout before the Gateway returns a success code. If the agent retries the call, a naive protocol might charge the user twice.  
**The Aima Solution:** We implemented a `Deterministic Idempotency Key` based on the hash of the transaction intent. If the Gateway sees the same hash twice, it returns the cached receipt rather than re-executing.

### 2. Durable Sagas & Partial Failures
What happens if an agent successfully swaps ETH for USDC but the final vendor payment fails?  
**The Aima Solution:** We utilize the Saga Pattern. Each transaction is wrapped in a `DurableExecutor` that tracks the lifecycle. If a terminal failure is detected in a multi-step workflow, the system triggers "Compensating Transactions" to attempt a safe rollback of the initial swap.

### 3. The "Hallucination Flood"
An AI model could potentially enter an infinite loop, attempting to authorize thousands of micro-transactions.  
**The Aima Solution:** The UTG enforces a strict "Safety Sandwich" gate at the local kernel level. Even if the AI sends 1,000 requests, they are queued and require a single unified signature or a rate-limited window of human approval.

By open-sourcing this architecture, Aima is setting the first standard for secure, non-custodial agentic commerce. 

View the full source and join the protocol at `utg.useaima.com`.
