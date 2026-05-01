# Universal Transaction Gateway (UTG) Flowcharts

These diagrams are sanitized repo-local copies of the operator flowcharts used in the docs experience. They avoid local `file:///...` references and point only to checked-in Mermaid or repo-hosted assets.

## 1. High-Level System Architecture

```mermaid
flowchart LR
    subgraph Agents["Agent Clients"]
        direction TB
        A1["OpenClaw"]
        A2["Claude"]
        A3["Custom MCP"]
    end
    subgraph UTG["UTG Gateway Server"]
        direction TB
        B1["Tool & Skill Registry"]
        B2["Policy & HITL Service"]
        B3["Execution Wrapper"]
        B4["Base/Ethereum Execution"]
        B5["Audit Logger"]
        B6["Firebase Live Dashboard"]
        B7["x402 Payment Handler"]
        B8["Commerce Search (beta)"]
        B9["Browser Handover (beta)"]
        B10["M-Pesa Experimental"]
    end
    Agents -->|"calls tools"| UTG
    B1 --> B2
    B2 --> B3
    B3 --> B4
    B3 --> B5
    B3 --> B6
    B3 --> B7
    B3 --> B8
    B3 --> B9
    B3 --> B10
```

![Architecture Overview](/assets/images/multi_chain_routing.png)

## 2. Fortified Execution Lifecycle

```mermaid
graph TD
    A["Start Execution"] --> B["Clock Drift Check"]
    B --> C["Idempotency Check"]
    C --> D["Preflight Validation"]
    D --> E["Final-Look Validation"]
    E --> F["Atomic Execute"]
    F --> G["Verification"]
    G --> H["Cleanup"]
    H --> I["Finish"]
```

## 3. Human-In-The-Loop (HITL) Multi-Share Approval

```mermaid
graph LR
    TX["Transaction Requested"] -->|"Anomaly?"| AN["Anomaly Detector"]
    AN -->|"No"| EXEC["Execute Directly"]
    AN -->|"Yes"| HITL["Create Pending Record"]
    HITL --> SIG["Request Signature Share"]
    SIG -->|"All Shares Collected"| EXEC
    SIG -->|"Timeout"| FAIL["Reject Transaction"]
```

## 4. AI-Driven Anomaly Detection & Escalation

```mermaid
graph LR
    INPUT["Incoming Transaction"] --> DET["AnomalyDetector.evaluate"]
    DET -->|"Low Risk"| NORMAL["Proceed"]
    DET -->|"High Risk"| ESC["Escalate Signature Requirements"]
    ESC --> ADD["Add Security_Admin_Share"]
    ADD --> HITL["HITL Approval Flow"]
```

## 5. x402 Payment-Required Handshake

```mermaid
graph TD
    REQ["Agent Calls Skill"] --> CHALLENGE["x402 Payment Challenge"]
    CHALLENGE -->|"User Pays"| SETTLE["Settlement Recorded"]
    SETTLE --> RETRY["Retry Original Call"]
    RETRY --> SUCCESS["Success"]
```

## 6. Browser Handover & 2FA Takeover

```mermaid
graph LR
    AUTO["Automated Skill"] -->|"CAPTCHA/2FA"| HANDOVER["request_human_handover"]
    HANDOVER --> HUMAN["Human Completes Challenge"]
    HUMAN --> CONT["Continue Automation"]
    CONT --> RESULT["Result Returned"]
```

## 7. Cryptographic Audit Vault Flow

```mermaid
graph TD
    TX["Transaction Completed"] --> LOG["AuditLogger.store"]
    LOG --> ENC["Encrypt PII with Fernet"]
    ENC --> SIG["Create Signed Statement"]
    SIG --> CHAIN["Chain with Previous Hash"]
    CHAIN --> DB["Persist to DB"]
```

## 8. Beta Commerce Search & Checkout Path

```mermaid
graph LR
    USER["User Initiates Search"] --> SEARCH["commerce_skill.search_and_compare"]
    SEARCH --> RESULTS["Catalog Results"]
    RESULTS --> ORDER["request_order"]
    ORDER --> PAYMENT["checkout helper + handover"]
    PAYMENT --> CONFIRM["Order Confirmation"]
```

## 9. Experimental M-Pesa STK Push Flow

```mermaid
graph TD
    REQ["Initiate M-Pesa STK Push"] --> SEND["send_stk_push"]
    SEND --> CALLBACK["Webhook Callback"]
    CALLBACK --> VERIFY["verify_callback_signature"]
    VERIFY -->|"Valid"| SUCCESS["Transaction Success"]
    VERIFY -->|"Invalid"| FAIL["Reject Transaction"]
```

## 10. Deployment Onboarding & Support Tier Validation

```mermaid
graph LR
    ONB["utg-onboard Wizard"] --> VALID["setup_validator.check_tiers"]
    VALID -->|"All Stable"| DEPLOY["Deploy Stable Stack"]
    VALID -->|"Beta Features Enabled"| DEPLOY_BETA["Deploy Beta Stack"]
    VALID -->|"Experimental Enabled"| DEPLOY_EXP["Deploy Experimental Stack"]
```
