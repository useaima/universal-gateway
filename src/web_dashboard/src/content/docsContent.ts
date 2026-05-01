export type DocsVisual =
  | 'system-architecture'
  | 'transaction-lifecycle'
  | 'safety-sandwich'
  | 'hitl-approval'
  | 'telemetry-pipeline'
  | 'commerce-handover';

export const mermaidDefs: Record<DocsVisual, string> = {
  'system-architecture': `
flowchart TB
    subgraph Clients["Agent Clients"]
        OC["OpenClaw"]
        CD["Claude Desktop"]
        CA["Custom MCP Agent"]
        TG["Telegram / Slack"]
    end

    subgraph Gateway["UTG Gateway Server"]
        MCP["MCP JSON-RPC Layer"]
        REG["Tool & Skill Registry"]
        A2A["A2A Discovery Card"]

        subgraph PolicyLayer["Policy & Control"]
            SP["SafetyPolicy"]
            AD["AnomalyDetector ML"]
            RC["RuntimeContract"]
        end

        subgraph ApprovalLayer["Approval Layer"]
            HITL["HITLManager"]
            SIG["Signature Share DB"]
            PIN["Passcode Verification"]
        end

        subgraph ExecutionLayer["Execution Engine"]
            EW["ExecutionWrapper"]
            IDEM["IdempotencyManager"]
            SAND["SandboxEngine"]
        end
    end

    subgraph Settlement["Settlement Rails"]
        BASE["Base L2"]
        ETH["Ethereum L1"]
        X402["x402 Payment Challenge"]
    end

    subgraph Observability["Audit & Telemetry"]
        AUDIT["AuditLogger + Signed Vault"]
        SQLITE["SQLite Lifecycle Logs"]
        RTDB["Firebase RTDB Publisher"]
        DASH["Live Web Dashboard"]
    end

    Clients -->|"MCP stdio"| MCP
    MCP --> REG
    REG --> PolicyLayer
    PolicyLayer -->|"Risky"| ApprovalLayer
    PolicyLayer -->|"Safe"| ExecutionLayer
    ApprovalLayer -->|"Approved"| ExecutionLayer
    ExecutionLayer --> Settlement
    ExecutionLayer --> Observability
    SQLITE --> RTDB
    RTDB -->|"Live Sync"| DASH
  `,
  'transaction-lifecycle': `
flowchart TD
    START(["Agent calls tool"]) --> RECV["MCP Server receives request"]
    RECV --> ROUTE{"Tool Registry routes to skill"}

    ROUTE -->|"DeFi Skill"| DEFI["DeFiEthSkill"]
    ROUTE -->|"Commerce Skill"| COMM["CommerceSkill"]
    ROUTE -->|"Handover Skill"| HAND["HandoverSkill"]

    DEFI --> POLICY{"SafetyPolicy check"}
    POLICY -->|"Domain blocked"| REJECT_D["Return: Domain not allowed"]
    POLICY -->|"Over limit"| REJECT_L["Return: Safety Sandwich violation"]
    POLICY -->|"Passes"| HITL_CHECK["HITLManager.request_signature"]

    HITL_CHECK --> ANOMALY{"AnomalyDetector.evaluate"}
    ANOMALY -->|"Anomaly"| ESCALATE["Elevate: Add Security_Admin_Share"]
    ANOMALY -->|"Normal"| PENDING["Status: PENDING_SIGNATURES"]
    ESCALATE --> PENDING

    PENDING --> WAIT(["Agent asks operator for passcode"])
    WAIT --> SUBMIT["submit_signature_share"]
    SUBMIT --> CONSENSUS{"All shares collected?"}
    CONSENSUS -->|"No"| WAIT
    CONSENSUS -->|"Yes"| SIGNED["Status: FULLY_SIGNED"]

    SIGNED --> EXEC["ExecutionWrapper.execute_task"]
    EXEC --> CLOCK["Clock drift check"]
    CLOCK --> IDEM{"IdempotencyManager.check_key"}
    IDEM -->|"Already processed"| CACHED["Return cached result"]
    IDEM -->|"New"| LOCK["Lock idempotency key"]

    LOCK --> PREFLIGHT["Log: STATE_PREFLIGHT"]
    PREFLIGHT --> PRICE{"Price variance check"}
    PRICE -->|"Mismatch > 5%"| HALT["Status: HALTED"]
    PRICE -->|"OK"| EXECUTE["Log: STATE_EXECUTE"]

    EXECUTE --> WEB3["Web3 broadcast transaction"]
    WEB3 --> RECEIPT["Wait for block confirmations"]
    RECEIPT --> VERIFY["Log: STATE_VERIFY"]
    VERIFY --> FINALIZE["Finalize idempotency key"]
    FINALIZE --> AUDIT["AuditLogger.log_signed_entry"]
    AUDIT --> PUBLISH["Firebase RTDB sync_all"]
    PUBLISH --> CLEAN["SecurityCleaner.wipe + BrowserManager.clear"]
    CLEAN --> DONE(["Return: Settlement hash"])
  `,
  'safety-sandwich': `
flowchart TB
    INTENT(["Agent Intent Arrives"]) --> OUTER

    subgraph OUTER["Outer Boundary — Request Validation"]
        HTTPS{"HTTPS enforced?"}
        DOMAIN{"Domain in allowlist?"}
        RATE["Rate limiting"]
        HTTPS -->|"No"| BLOCK1["BLOCKED: Insecure protocol"]
        HTTPS -->|"Yes"| DOMAIN
        DOMAIN -->|"No"| BLOCK2["BLOCKED: Unauthorized domain"]
        DOMAIN -->|"Yes"| RATE
    end

    RATE --> MIDDLE

    subgraph MIDDLE["Middle Boundary — Human Oversight"]
        AMOUNT{"Amount > MAX_TRANSACTION_LIMIT?"}
        ANOMALY_M{"Isolation Forest anomaly?"}
        HITL_M["HITL approval required"]
        AMOUNT -->|"Over"| BLOCK3["BLOCKED: Safety Sandwich violation"]
        AMOUNT -->|"Under"| ANOMALY_M
        ANOMALY_M -->|"Anomaly"| ESCALATE_M["Escalate: require Security_Admin_Share"]
        ANOMALY_M -->|"Normal"| HITL_M
        ESCALATE_M --> HITL_M
    end

    HITL_M --> CORE

    subgraph CORE["Core Boundary — Execution Integrity"]
        IDEM_C{"Idempotency collision?"}
        TIMEOUT{"Timeout > 120s?"}
        PRICE_C{"Price drift > 5%?"}
        EXEC_C["Atomic execution with asyncio.wait_for"]
        IDEM_C -->|"Duplicate"| CACHED_C["Return cached result"]
        IDEM_C -->|"New"| TIMEOUT
        TIMEOUT -->|"Expired"| BLOCK4["FAILED: Timeout budget exceeded"]
        TIMEOUT -->|"OK"| PRICE_C
        PRICE_C -->|"Mismatch"| BLOCK5["HALTED: Price variance"]
        PRICE_C -->|"OK"| EXEC_C
    end

    EXEC_C --> VALUE(["Value Movement on EVM"])
  `,
  'hitl-approval': `
flowchart TD
    REQ(["Agent calls request_eth_transfer_reliable"]) --> HASH["Generate deterministic tx ID from network + address + amount"]
    HASH --> LOOKUP{"Transaction exists in pending_transactions?"}

    LOOKUP -->|"No — First call"| CREATE["INSERT new PENDING_SIGNATURES record"]
    CREATE --> ANOMALY_H{"AnomalyDetector.evaluate_transaction"}
    ANOMALY_H -->|"Normal"| SIG1["Required: Alvins_Share"]
    ANOMALY_H -->|"Anomaly detected"| SIG2["Required: Alvins_Share + Security_Admin_Share"]
    SIG1 --> HALTED
    SIG2 --> HALTED
    HALTED(["Return: TRANSACTION HALTED — ask operator for passcode"])

    LOOKUP -->|"Yes — Retry call"| STATUS{"Check current status"}
    STATUS -->|"PENDING_SIGNATURES"| STILL_PENDING["Return: Still awaiting approval shares"]
    STATUS -->|"REJECTED"| REJECTED["Return: User rejected transaction"]
    STATUS -->|"FULLY_SIGNED"| PROCEED

    HALTED -.->|"Operator provides PIN"| SUBMIT_H["Agent calls submit_signature_share"]
    STILL_PENDING -.->|"Operator provides PIN"| SUBMIT_H

    SUBMIT_H --> VERIFY_PIN{"PIN matches GATEWAY_PASSCODE?"}
    VERIFY_PIN -->|"No"| DENIED["Return: Access denied"]
    VERIFY_PIN -->|"Yes"| RECORD["Record signature_share in DB"]
    RECORD --> CHECK{"All required shares collected?"}
    CHECK -->|"No"| WAITING["Return: Awaiting remaining shares"]
    CHECK -->|"Yes"| UPDATE["Update status: FULLY_SIGNED"]
    UPDATE --> FIREBASE_H["Firebase RTDB sync_all"]

    FIREBASE_H -.->|"Agent retries original tool"| PROCEED
    PROCEED["ExecutionWrapper resumes with full approval"]
  `,
  'telemetry-pipeline': `
flowchart LR
    subgraph Sources["Data Sources"]
        TX_DB[("transactions.db")]
        AUDIT_DB[("audit_v2.db")]
        IDEM_DB[("idempotency.db")]
    end

    subgraph Publisher["FirebaseLivePublisher"]
        QUERY["Query pending_transactions"]
        QUERY2["Query signed_statements"]
        BUILD["_build_hitl_transaction"]
        MERGE["_merge_audit_transaction"]
        AGG["_build_aggregates"]
        STATUS_MAP["_status_ui normalization"]
        NETWORK_MAP["_infer_network detection"]
    end

    subgraph RTDB["Firebase Realtime Database"]
        SUMMARY["dashboard_live/summary"]
        THROUGHPUT["dashboard_live/throughput_30d"]
        TRANSACTIONS["dashboard_live/transactions"]
        PORTFOLIO["portfolio_live/summary"]
        GAS["gas_live/base + ethereum"]
    end

    subgraph Dashboard["Live Web Dashboard"]
        OVERVIEW["Overview Panel"]
        METRICS["30-Day Volume + Settled Count"]
        TABLE["Transaction Review Table"]
        TIMELINE["Per-Transaction Timeline"]
        AGENT_COUNT["Active Agent Counter"]
    end

    TX_DB --> QUERY
    AUDIT_DB --> QUERY2
    QUERY --> BUILD
    QUERY2 --> MERGE
    BUILD --> STATUS_MAP
    MERGE --> STATUS_MAP
    STATUS_MAP --> AGG
    NETWORK_MAP --> AGG

    AGG -->|"thirtyDayVolumeUsd"| SUMMARY
    AGG -->|"Daily buckets"| THROUGHPUT
    BUILD -->|"Per-tx state"| TRANSACTIONS

    SUMMARY -->|"Subscribe"| OVERVIEW
    SUMMARY -->|"Subscribe"| METRICS
    THROUGHPUT -->|"Subscribe"| METRICS
    TRANSACTIONS -->|"Subscribe"| TABLE
    TRANSACTIONS -->|"Subscribe"| TIMELINE
    SUMMARY -->|"activeAgents"| AGENT_COUNT
  `,
  'commerce-handover': `
flowchart TD
    SEARCH(["Agent calls search_and_compare"]) --> PROVIDER{"COMMERCE_SEARCH_PROVIDER set?"}
    PROVIDER -->|"Not set"| DISABLED["Return: Commerce is beta — provider not configured"]

    PROVIDER -->|"catalog"| CATALOG_CHECK{"COMMERCE_CATALOG_ENDPOINT set?"}
    CATALOG_CHECK -->|"No"| MISSING_EP["Return: Catalog endpoint missing"]
    CATALOG_CHECK -->|"Yes"| CATALOG["Forward to external catalog service"]
    CATALOG --> RESULTS["Return ranked results to operator"]

    PROVIDER -->|"browser"| BROWSER_SEARCH["Browser-assisted merchant review"]
    BROWSER_SEARCH --> DOMAIN_CHECK{"All URLs in ALLOWED_DOMAINS?"}
    DOMAIN_CHECK -->|"No"| BLOCKED_DOMAIN["BLOCKED: Domain not whitelisted"]
    DOMAIN_CHECK -->|"Yes"| RESULTS

    RESULTS -.->|"Operator selects item"| ORDER

    ORDER(["Agent calls request_order"]) --> CHECKOUT["CheckoutSkill.build_handover_summary"]
    CHECKOUT --> PRICE_CHECK{"SafetyPolicy.validate_price"}
    PRICE_CHECK -->|"Over limit"| BLOCKED_PRICE["BLOCKED: Safety Sandwich violation"]
    PRICE_CHECK -->|"OK"| HITL_ORDER["HITLManager creates PENDING record"]

    HITL_ORDER --> HANDOVER(["Agent calls request_human_handover"])
    HANDOVER --> URL_CHECK{"BROWSER_HANDOVER_URL set?"}
    URL_CHECK -->|"No"| NO_ADAPTER["Return: Handover adapter not configured"]
    URL_CHECK -->|"Yes"| GENERATE["Generate handover ticket + live view URL"]
    GENERATE --> OPERATOR_H(["Operator opens live browser session"])
    OPERATOR_H --> COMPLETE["Complete checkout manually"]
    COMPLETE --> AUDIT_H["AuditLogger records handover completion"]
  `
};

export interface DocsCallout {
  tone: 'note' | 'warning' | 'critical' | 'success';
  title: string;
  body: string;
}

export interface DocsCodeBlock {
  label: string;
  language: string;
  content: string;
}

export interface DocsSection {
  id: string;
  title: string;
  body: string[];
  bullets?: string[];
  callout?: DocsCallout;
  code?: DocsCodeBlock;
  visual?: DocsVisual;
}

export interface DocsPage {
  slug: string;
  label: string;
  group: 'Getting Started' | 'Protocol' | 'Operations' | 'Reference';
  eyebrow: string;
  title: string;
  summary: string;
  hero: string;
  sections: DocsSection[];
}

export const docsPages: DocsPage[] = [
  {
    slug: 'overview',
    label: 'Overview',
    group: 'Getting Started',
    eyebrow: 'UTG 2026.4',
    title: 'An open-source MCP gateway for agentic finance',
    summary:
      'UTG is a self-hosted control layer between agent intent and real-value execution, with HITL always enforced and Base/Ethereum as the first-class rails.',
    hero:
      'The gateway is designed for operators who want automation to stay useful without letting the model turn into a secret vault.',
    sections: [
      {
        id: 'what-utg-is',
        title: 'What UTG is',
        body: [
          'UTG exposes a gateway-as-a-service pattern, but it is delivered as open-source software first. Operators self-host it, connect their preferred agent client through MCP, and keep the control boundary in their own environment.',
          'The practical result is simple: your agent proposes actions, the gateway applies policy and approval rules, and only approved actions reach settlement.',
        ],
        bullets: [
          'OpenClaw, Claude Desktop, and custom MCP clients are the primary integration targets',
          'Telegram, Slack, and other chat surfaces are treated as operator channels layered on top of the gateway',
          'Base and Ethereum are executable rails; Bitcoin and Solana are observer/read-only rails for now',
        ],
        visual: 'system-architecture',
      },
      {
        id: 'public-contract',
        title: 'The public contract',
        body: [
          'Real users should not have to guess what is stable. The README, docs site, A2A card, and raw skill artifact all describe the same product contract.',
          'That contract is MCP-first integration, enforced HITL on value-moving actions, Base/Ethereum execution, and explicit maturity labels for everything else.',
        ],
        callout: {
          tone: 'note',
          title: 'The truthful release lens',
          body: 'The point of this release is not to make every idea sound production-ready. It is to make the stable path unmistakably clear.',
        },
      },
    ],
  },
  {
    slug: 'support-matrix',
    label: 'Support Matrix',
    group: 'Getting Started',
    eyebrow: 'Release Truth',
    title: 'What is stable, what is beta, and what is still experimental',
    summary:
      'Use the support matrix before integrating the gateway into a real operator workflow.',
    hero:
      'UTG separates stable execution surfaces from beta and experimental capabilities so operators can adopt it without guessing which parts are battle-ready.',
    sections: [
      {
        id: 'stable-surface',
        title: 'Stable surface',
        body: [
          'The stable surface is the part we expect real users to rely on today: Base and Ethereum transfers, HITL approval enforcement, MCP connectivity, idempotent retries, and dashboard telemetry.',
          'Stable execution now assumes real keys and real settlement rails. If a required execution key is missing, the gateway fails clearly instead of simulating a successful transfer.',
          'These flows are the ones that should drive your first production integration and your first support playbooks.',
        ],
        bullets: [
          'request_eth_transfer_reliable',
          'submit_signature_share',
          'get_a2a_agent_card',
          'live dashboard telemetry through Firebase RTDB',
          'no public swap execution tool is exposed in the current gateway runtime',
        ],
        callout: {
          tone: 'success',
          title: 'Stable means operator-safe',
          body: 'Stable does not mean no risk. It means the gateway has a truthful control boundary, documented prerequisites, and a runtime contract that matches the docs.',
        },
      },
      {
        id: 'beta-and-experimental',
        title: 'Beta and experimental surfaces',
        body: [
          'Commerce and browser handover remain beta because they depend on configured providers and operator infrastructure. UTG will not invent successful search results or fake live handover sessions when those providers are missing.',
          'M-Pesa remains experimental until provider credentials, callback signing, and webhook runbooks are production-grade.',
        ],
        bullets: [
          'beta: search_and_compare, request_order, request_human_handover',
          'experimental: mpesa_3_skill-backed flows and fiat-adjacent payment rails',
        ],
      },
    ],
  },
  {
    slug: 'deployment-guide',
    label: 'Deployment Guide',
    group: 'Getting Started',
    eyebrow: 'Production Readiness',
    title: 'Hardening your self-hosted gateway for production use',
    summary: 'Moving from local dev to a secure, persistent operator instance.',
    hero: 'Deploying UTG requires attention to secret management, persistence, and network boundaries.',
    sections: [
      {
        id: 'docker-deployment',
        title: 'Process and container options',
        body: [
          'The repo does not currently ship a canonical Docker Compose stack. The truthful production path today is a self-hosted Python process under a supervisor, or your own container image if you prefer to package it that way.',
          'If you need the local WebSocket relay for handover experiments, enable it explicitly with `UTG_ENABLE_RELAY_SERVER=true`. It is not part of the stable default path.',
        ],
        code: {
          label: 'Example process launch',
          language: 'bash',
          content:
            'export GATEWAY_PASSCODE=...\nexport SIWE_NONCE_SECRET=...\nexport UTG_STORAGE_DIR=/srv/utg/storage\nexport UTG_IDENTITY_KEY_PATH=/srv/utg/identity/gateway_ed25519.pem\nexport BASE_PRIVATE_KEY=0x...\nexport ETHEREUM_PRIVATE_KEY=0x...\npython src/gateway/server.py',
        }
      },
      {
        id: 'hardening',
        title: 'Hardening boundaries',
        body: [
          'Never expose the MCP stdio interface directly to the public internet. It is designed to be called by a local agent or proxied through a secure sidecar.',
          'Ensure `ALLOWED_DOMAINS` is restricted to only the merchants you trust for commerce automation. Keep runtime storage and gateway identity material outside the git checkout so operator secrets, logs, and exports cannot be committed accidentally.',
        ],
        bullets: [
          'Use a dedicated environment for the gateway',
          'Rotate GATEWAY_PASSCODE and SIWE_NONCE_SECRET periodically',
          'Keep UTG_STORAGE_DIR outside the repository',
          'Use UTG_IDENTITY_KEY_PATH or UTG_IDENTITY_PRIVATE_KEY_PEM for the gateway identity',
          'Enable Firebase RTDB rules to restrict dashboard access',
        ]
      }
    ]
  },
  {
    slug: 'self-hosting',
    label: 'Self-Hosting',
    group: 'Getting Started',
    eyebrow: 'Operator Setup',
    title: 'Install the gateway, wire the env, and validate the runtime',
    summary:
      'The self-hosted operator path is the canonical deployment story for UTG today.',
    hero:
      'Operators should be able to bootstrap the stable gateway locally, understand what is missing for beta features, and validate the environment before connecting an agent.',
    sections: [
      {
        id: 'minimum-env',
        title: 'Minimum environment for stable usage',
        body: [
          'The runtime validator checks the same support tiers the docs describe. For stable Base/Ethereum execution, you need a gateway passcode, treasury address, and RPC connectivity.',
          'Do not treat optional beta or experimental env vars as mandatory for a stable release. They only matter when you want those capabilities.',
        ],
        code: {
          label: 'Stable gateway env',
          language: 'bash',
          content:
            'GATEWAY_PASSCODE=...\nSIWE_NONCE_SECRET=...\nUTG_STORAGE_DIR=/srv/utg/storage\nUTG_IDENTITY_KEY_PATH=/srv/utg/identity/gateway_ed25519.pem\nBASE_PRIVATE_KEY=0x...\nETHEREUM_PRIVATE_KEY=0x...\nBASE_RPC_URL=https://mainnet.base.org\nETHEREUM_RPC_URL=https://mainnet.gateway.tenderly.co/public\nTREASURY_ADDRESS=0x...\nAIMA_API_KEY=...\nFIREBASE_DATABASE_URL=...\nFIREBASE_PROJECT_ID=...',
        },
      },
      {
        id: 'optional-feature-env',
        title: 'Optional env for beta and experimental surfaces',
        body: [
          'Commerce and browser handover should only be enabled when the operator has configured a real provider path. The gateway now fails fast when those provider env vars are absent.',
          'Experimental rails such as M-Pesa have their own provider envelope and should remain off until the callback and webhook story is fully provisioned.',
        ],
        bullets: [
          'COMMERCE_SEARCH_PROVIDER',
          'COMMERCE_CATALOG_ENDPOINT',
          'ALLOWED_DOMAINS',
          'BROWSER_HANDOVER_URL',
          'BROWSERBASE_API_KEY and BROWSERBASE_PROJECT_ID when you use Browserbase',
          'UTG_ENABLE_RELAY_SERVER, UTG_RELAY_HOST, and UTG_RELAY_PORT when you explicitly enable the local handover relay',
          'MPESA_API_SECRET, MPESA_SHORTCODE, MPESA_CALLBACK_URL',
        ],
        callout: {
          tone: 'warning',
          title: 'Self-hosted first means fail fast',
          body: 'The gateway should tell the operator exactly which provider env vars are missing instead of pretending the capability is available.',
        },
      },
    ],
  },
  {
    slug: 'architecture',
    label: 'Architecture',
    group: 'Protocol',
    eyebrow: 'Control Plane',
    title: 'How UTG sits between agent intent, policy, approval, and execution',
    summary:
      'The runtime is layered so no single automation step can silently bypass the operator.',
    hero:
      'Agent intent enters through MCP, the gateway evaluates policy and HITL, and only approved actions reach settlement rails or provider-backed side channels.',
    sections: [
      {
        id: 'service-boundaries',
        title: 'Service boundaries',
        body: [
          'The current runtime separates the MCP server, tool registry, approval path, execution wrapper, x402 challenge contract, and receipt publication.',
          'Those boundaries matter because they let the stable operator path stay simple while beta and experimental adapters remain honest about their prerequisites.',
        ],
        bullets: [
          'MCP server layer (packaged stdio entrypoint, with optional local relay only when explicitly enabled)',
          'Tool and skill registry with deterministic routing',
          'Approval and HITL service backed by SQLite signature-share records',
          'Execution and idempotency wrapper with cleanup guards',
          'x402 payment challenge contract for agentic auth',
          'Audit and RTDB publisher for live observability',
        ],
        visual: 'system-architecture',
      },
      {
        id: 'network-model',
        title: 'Normalized network model',
        body: [
          'The gateway now treats network naming consistently across docs and runtime: Base and Ethereum are executable, Bitcoin and Solana are observed.',
          'This keeps the public contract clear for both operators and agents, especially when one UI shows multiple chains but only some of them are truly writable.',
        ],
        bullets: ['execution: base, ethereum', 'observed: bitcoin, solana'],
      },
    ],
  },
  {
    slug: 'human-approval-flow',
    label: 'Human Approval Flow',
    group: 'Operations',
    eyebrow: 'HITL',
    title: 'How risky actions halt, wait, and resume',
    summary:
      'HITL is not a cosmetic modal. It is the core settlement boundary for the gateway.',
    hero:
      'A value-moving action should be able to stop cleanly, expose its reasoning, accept a valid operator approval share exactly once, and then resume without duplicate settlement.',
    sections: [
      {
        id: 'halt-and-resume',
        title: 'Halt and resume model',
        body: [
          'When a protected transfer is requested, the gateway creates or reuses a pending transaction record. The agent sees that as a pending or halted state, asks the operator for approval, and then calls submit_signature_share.',
          'Once the approval share is recorded, the agent retries the original transfer call. The gateway resumes the same path instead of creating a second settlement request.',
        ],
        visual: 'hitl-approval',
        code: {
          label: 'Representative MCP flow',
          language: 'text',
          content:
            'request_eth_transfer_reliable -> HALTED\nsubmit_signature_share -> FULLY_SIGNED\nrequest_eth_transfer_reliable -> SUCCESS',
        },
      },
      {
        id: 'approval-rules',
        title: 'Approval rules',
        body: [
          'Approval is always enforced for sensitive actions, and the passcode must be present in the environment. The runtime no longer falls back to a pretend default code in production-like paths.',
          'This keeps the operator story honest: if the gateway is not configured to accept approval shares, it tells you directly. The CLI approver and the MCP approval tool both fail closed when the passcode is missing or wrong.',
        ],
        visual: 'transaction-lifecycle',
        callout: {
          tone: 'critical',
          title: 'No hidden bypass',
          body: 'No plan step in this release weakens the HITL invariant. That is the line the product is built around.',
        },
      },
    ],
  },
  {
    slug: 'realtime-analytics',
    label: 'Realtime Analytics',
    group: 'Operations',
    eyebrow: 'Telemetry',
    title: 'How gateway lifecycle logs become a live operator dashboard',
    summary:
      'The web dashboard subscribes to the same normalized lifecycle data the gateway writes during real execution.',
    hero:
      'Telemetry should explain what the gateway actually did, not show a pretty shell disconnected from the protocol.',
    sections: [
      {
        id: 'publisher-structure',
        title: 'Publisher structure',
        body: [
          'Pending approvals originate in the HITL database and execution lifecycle events originate in the signed audit log. A Firebase Admin publisher normalizes those sources into summary, throughput, and transaction trees.',
          'The dashboard subscribes to those nodes directly so overview, portfolio context, and transaction review all reflect the same underlying lifecycle.',
        ],
        visual: 'telemetry-pipeline',
        bullets: [
          'dashboard_live/summary',
          'dashboard_live/throughput_30d',
          'dashboard_live/transactions/{transactionId}',
          'portfolio_live/summary',
          'portfolio_live/assets/{assetId}',
          'gas_live/{chain}',
        ],
      },
      {
        id: 'truthful-metrics',
        title: 'Truthful metrics',
        body: [
          'Stable metrics should only represent real lifecycle data. Unsupported balances or unpriced assets should remain visibly unpriced instead of falling back to fake fiat values.',
          'That same rule applies to operator copy. If a feature is still beta or experimental, the dashboard and docs should say so clearly.',
        ],
      },
    ],
  },
  {
    slug: 'anomaly-detection',
    label: 'Anomaly Detection',
    group: 'Protocol',
    eyebrow: 'ML Safety',
    title: 'Adaptive security via Isolation Forest anomaly detection',
    summary: 'How UTG dynamically escalates approval requirements for irregular transactions.',
    hero: 'Static limits are not enough. UTG uses an IsolationForest model to flag unusual transaction patterns before they hit the settlement rail.',
    sections: [
      {
        id: 'anomaly-model',
        title: 'Isolation Forest Model',
        body: [
          'The `AnomalyDetector` maintains a scikit-learn IsolationForest model trained on previous transaction amounts. It identifies "outliers" that deviate significantly from the operator’s normal behavior.',
        ],
        visual: 'safety-sandwich',
        bullets: [
          'Real-time scoring of transfer amounts when enough readable preflight history exists',
          'Automatic escalation to multi-share approval on detected outliers',
          'Unreadable history is skipped; if the model cannot form a baseline, the gateway falls back to baseline HITL rules'
        ]
      },
      {
        id: 'escalation-logic',
        title: 'Security Escalation',
        body: [
          'When an anomaly is detected, the `HITLManager` elevates the requirement from a single share to a multi-party consensus. This requires an additional `Security_Admin_Share` before the transaction is marked as `FULLY_SIGNED`.',
        ],
        visual: 'hitl-approval'
      }
    ]
  },
  {
    slug: 'audit-compliance',
    label: 'Audit & Compliance',
    group: 'Protocol',
    eyebrow: 'Audit Vault',
    title: 'Cryptographic audit logs and GDPR-compliant crypto-shredding',
    summary: 'Maintaining a tamper-proof chain of custody for all agentic actions.',
    hero: 'Every action is signed, logged, and encrypted. UTG ensures compliance without sacrificing performance or privacy.',
    sections: [
      {
        id: 'signed-vault',
        title: 'Signed Audit Vault',
        body: [
          'The `AuditLogger` creates signed statements for every lifecycle event. These are stored in an append-only SQLite database and can be exported as a verifiable audit trail.',
          'Sensitive payload fields are encrypted at rest, and consumers such as the anomaly detector and Firebase publisher use a shared decode path so they can read what they are allowed to read without duplicating decryption logic.',
        ],
        bullets: [
          'Deterministic event IDs',
          'Operator identity attribution',
          'Cryptographic proof of approval',
          'Shared decode path for encrypted audit payload consumers',
        ]
      },
      {
        id: 'crypto-shredding',
        title: 'GDPR & Crypto-Shredding',
        body: [
          'To support "Right to Erasure" (GDPR), UTG uses a per-user symmetric key for sensitive log entries. Deleting the user’s key effectively "shreds" the audit trail for that user while maintaining the integrity of the overall system logs.',
        ],
        callout: {
          tone: 'note',
          title: 'Privacy by Design',
          body: 'Data is encrypted at rest using uniquely generated keys that the operator controls.'
        }
      },
      {
        id: 'key-rotation',
        title: 'Key rotation and storage hygiene',
        body: [
          'Gateway identity keys and runtime databases should not live inside the repository. Production setups should set UTG_STORAGE_DIR to an external location and either UTG_IDENTITY_KEY_PATH or UTG_IDENTITY_PRIVATE_KEY_PEM for the signing identity.',
          'If a key or PAT is exposed, the right response is rotation plus history cleanup, not a quiet follow-up commit.',
        ],
      }
    ]
  },
  {
    slug: 'agent-integration',
    label: 'Agent Integration',
    group: 'Reference',
    eyebrow: 'MCP First',
    title: 'Connect OpenClaw, Claude, or a custom agent without giving away wallet custody',
    summary:
      'The primary product path is MCP integration, not a special chat UI or a hidden managed service.',
    hero:
      'Treat the gateway as a mediated settlement authority. The agent proposes, the gateway governs, and the operator remains in control.',
    sections: [
      {
        id: 'connection-model',
        title: 'Connection model',
        body: [
          'The simplest deployment model is a local or self-hosted MCP server connected over stdio. That works for OpenClaw, Claude Desktop, and most custom agent runtimes that can speak MCP.',
          'Telegram and similar surfaces are still useful, but they should be thought of as operator channels on top of the gateway rather than a different product contract.',
        ],
        code: {
          label: 'Example MCP server entry',
          language: 'json',
          content:
            '{\n  "mcpServers": {\n    "utg-gateway": {\n      "command": "python",\n      "args": ["/absolute/path/to/universal-transaction-gateway/src/gateway/server.py"],\n      "env": {\n        "AIMA_API_KEY": "...",\n        "BASE_RPC_URL": "...",\n        "ETHEREUM_RPC_URL": "...",\n        "TREASURY_ADDRESS": "0x..."\n      }\n    }\n  }\n}',
        },
      },
      {
        id: 'behavioral-contract',
        title: 'Behavioral contract',
        body: [
          'Agents must be built around halt-and-resume behavior. A pending approval is an expected state. A provider-missing response is an expected state. Both should be surfaced truthfully to the operator instead of retried blindly.',
          'The safest retry strategy is to preserve the same request shape and idempotency context whenever the gateway instructs you to retry.',
        ],
        bullets: [
          'Do not assume direct wallet control',
          'Do not treat HALTED or pending approval as a crash',
          'Do not fabricate success if a beta provider is missing',
          'Do retry the original transfer request after a successful approval share',
        ],
        callout: {
          tone: 'note',
          title: 'Raw agent artifact',
          body: 'Use /docs/skill.md when you need the compact agent-facing contract outside the visual docs shell.',
        },
      },
    ],
  },
  {
    slug: 'openclaw-integration',
    label: 'OpenClaw Integration',
    group: 'Reference',
    eyebrow: 'OpenClaw',
    title: 'A straightforward OpenClaw flow with HITL baked in',
    summary:
      'OpenClaw is a first-class target because it maps cleanly onto the gateway’s MCP-first contract.',
    hero:
      'The best OpenClaw setup is boring in a good way: connect the MCP server, call the stable tools, and let HITL do its job.',
    sections: [
      {
        id: 'openclaw-sequence',
        title: 'The sequence to implement',
        body: [
          'OpenClaw should call request_eth_transfer_reliable, inspect the gateway response, and pause cleanly if approval is required. Once the operator supplies the passcode, OpenClaw calls submit_signature_share and then retries the original transfer request.',
          'This pattern is intentionally simple because it is the safest way to make sure retries remain idempotent and approval never turns into a duplicate settlement.',
        ],
        visual: 'transaction-lifecycle',
      },
      {
        id: 'operator-channel',
        title: 'Operator channel guidance',
        body: [
          'Telegram or another chat interface can still be the operator-facing surface, but it should be treated as a way to collect approval input, not as a separate execution backend.',
          'That keeps the trust boundary in the gateway and lets the same OpenClaw integration work across CLI, TUI, and chat surfaces.',
        ],
      },
    ],
  },
  {
    slug: 'custom-mcp-integration',
    label: 'Custom MCP Agents',
    group: 'Reference',
    eyebrow: 'Custom Runtimes',
    title: 'Design custom agents around the gateway instead of around raw wallet calls',
    summary:
      'A custom agent should see UTG as the settlement layer and policy authority for any value-moving action.',
    hero:
      'If you are building your own agent stack, the safest move is to make UTG the tool you call for finance, not an afterthought bolted onto direct wallet access.',
    sections: [
      {
        id: 'minimal-contract',
        title: 'Minimal contract to implement',
        body: [
          'Custom agents need four behaviors: list tools, call stable tools, handle HITL pauses, and respect retry guidance. Everything else can evolve over time.',
          'A2A discovery is available through get_a2a_agent_card, but MCP remains the primary execution path in this release.',
        ],
        code: {
          label: 'Retry discipline',
          language: 'text',
          content:
            '1. Call a stable tool\n2. If status is HALTED or pending, ask the operator for approval\n3. Call submit_signature_share\n4. Retry the original tool call\n5. Reuse the same transaction context whenever possible',
        },
      },
      {
        id: 'versioning-and-compatibility',
        title: 'Versioning and compatibility',
        body: [
          'Tool names remain stable in v1. Internal refactors can change how the gateway is organized, but the public tool surface should not break existing OpenClaw or custom-agent configs without an explicit version change.',
          'That is why the current release refactors the registry and discovery card behind the scenes while keeping the tool names intact.',
        ],
      },
    ],
  },
  {
    slug: 'payments-x402',
    label: 'Base Payments & x402',
    group: 'Reference',
    eyebrow: 'Payments',
    title: 'Use Base for user-facing payments and x402 for paid service boundaries',
    summary:
      'UTG can sit in front of both user-facing Base payments and agent-to-agent paid service flows.',
    hero:
      'The important thing is not to confuse the payment rail with the control rail: UTG remains the enforcement boundary even when Base or x402 handles settlement.',
    sections: [
      {
        id: 'two-payment-patterns',
        title: 'Two payment patterns',
        body: [
          'Base user-facing payments and x402 paid API flows solve different problems. Base is the user settlement surface; x402 is the challenge-and-retry pattern for agent-to-agent access.',
          'The runtime now uses a single canonical x402 challenge contract so custom agents can parse payment-required states consistently.',
          'This payment surface is not the same thing as a swap surface. The current public gateway contract does not expose a real token swap tool, so the docs do not present swaps as a supported execution capability.',
        ],
        bullets: [
          'Base for user-facing USDC and onchain payment events',
          'x402 for payment-required service boundaries',
          'Treasury address stays in the gateway config rather than the model context',
        ],
      },
      {
        id: 'x402-contract',
        title: 'Canonical x402 contract',
        body: [
          'The x402 contract now returns a stable shape with status, headers, payment metadata, and resolve instructions. This gives agents a predictable way to surface the challenge to operators and retry after proof of payment.',
          'Documentation examples should show both directions: the agent paying for a service and UTG exposing a paid capability.',
        ],
        code: {
          label: 'Representative x402 payload',
          language: 'json',
          content:
            '{\n  "status": "payment_required",\n  "code": 402,\n  "payment": {\n    "rail": "x402",\n    "asset": "USDC",\n    "amount": 10,\n    "network": "base",\n    "recipient": "0x...",\n    "reason": "premium settlement route"\n  },\n  "resolve": {\n    "type": "present_payment_proof_and_retry"\n  }\n}',
        },
      },
    ],
  },
  {
    slug: 'commerce-handover',
    label: 'Commerce & Handover',
    group: 'Operations',
    eyebrow: 'Beta Surface',
    title: 'Commerce stays beta until providers and browser adapters are real',
    summary:
      'UTG no longer fabricates commerce results or fake live handover sessions when the operator has not configured the required runtime.',
    hero:
      'The honest version of beta commerce is useful: it tells you exactly what provider is needed and where the operator must step in.',
    sections: [
      {
        id: 'provider-gates',
        title: 'Provider gates',
        body: [
          'search_and_compare expects a configured commerce provider pattern such as an external catalog endpoint or a browser-assisted search process. If the provider is not configured, the tool returns a clear explanation instead of synthetic marketplace results.',
          'request_order then uses the checkout helper to decide whether browser handover can continue or whether the operator still needs to wire a handover adapter.',
        ],
        visual: 'commerce-handover',
        bullets: [
          'COMMERCE_SEARCH_PROVIDER',
          'COMMERCE_CATALOG_ENDPOINT for catalog mode',
          'ALLOWED_DOMAINS',
          'BROWSER_HANDOVER_URL',
        ],
        callout: {
          tone: 'warning',
          title: 'Beta should still be predictable',
          body: 'Beta does not mean vague. It means the gateway gives a truthful capability boundary and the operator understands the next configuration step.',
        },
      },
      {
        id: 'browser-handover',
        title: 'Browser handover',
        body: [
          'request_human_handover now expects a configured operator handover URL instead of returning a hardcoded demo page. That keeps the gateway from pretending a live operator session exists when it does not.',
          'If you want a Browserbase-backed flow, provide a real adapter URL and the relevant provider credentials in your deployment environment.',
        ],
      },
    ],
  },
  {
    slug: 'mpesa-experimental',
    label: 'M-Pesa Experimental',
    group: 'Reference',
    eyebrow: 'Experimental',
    title: 'Keep M-Pesa behind an explicit experimental label until the callback and webhook path is hardened',
    summary:
      'The gateway includes M-Pesa-oriented code paths, but they should not be presented as stable until the provider envelope is real.',
    hero:
      'The honest path here is restraint: wire the credentials, callback signing, and webhook routing first, then promote the surface when the operator runbook is ready.',
    sections: [
      {
        id: 'what-is-missing',
        title: 'What still separates it from a stable surface',
        body: [
          'A production-grade M-Pesa integration needs provider credentials, signed callback verification, webhook routing, failure handling, and operator troubleshooting guidance. The gateway now makes those requirements explicit instead of pretending the rail is always available.',
          'Until those pieces are provisioned, the runtime returns an unavailable state with the missing environment variables called out directly.',
        ],
        bullets: [
          'MPESA_API_SECRET',
          'MPESA_SHORTCODE',
          'MPESA_CALLBACK_URL',
          'provider callback signing and webhook runbook',
        ],
        callout: {
          tone: 'critical',
          title: 'Experimental means opt-in',
          body: 'Keep M-Pesa disabled in production unless your operators can answer the full callback and reconciliation story end to end.',
        },
      },
    ],
  },
  {
    slug: 'security-compliance',
    label: 'Security & Compliance',
    group: 'Protocol',
    eyebrow: 'Trust Boundaries',
    title: 'Why the gateway is strict about approvals, retries, and evidence',
    summary:
      'The main trust promise is not “the AI is smart enough.” It is “the system makes unsafe settlement paths harder.”',
    hero:
      'Security here means deterministic boundaries, durable evidence, and enough audit context that a real operator can explain what happened after the fact.',
    sections: [
      {
        id: 'idempotency',
        title: 'Idempotency and recovery',
        body: [
          'The execution wrapper and idempotency manager are what keep retries from turning into duplicate settlement. The same request can be resumed and audited without multiplying risk.',
          'This is why the docs keep pushing agents to retry the original tool call after approval rather than inventing a new request shape.',
        ],
        visual: 'transaction-lifecycle',
      },
      {
        id: 'threat-model',
        title: 'Threat model and trust boundaries',
        body: [
          'The primary threats in this release are approval bypass, secret exposure, replayed wallet-signing nonces, domain drift in browser-assisted flows, and runtime data being committed back into source control.',
          'The current hardening pass addresses those by requiring explicit secrets, one-time SIWE nonces, external runtime storage, and GitHub checks that catch drift between the public docs and the runtime contract.',
        ],
        visual: 'safety-sandwich',
      },
      {
        id: 'audit-posture',
        title: 'Audit posture',
        body: [
          'UTG preserves both onchain and offchain metadata so an operator can reconstruct the full story: request context, approval state, lifecycle events, contract data, and external references.',
          'That evidence matters for internal governance, incident response, and simply being able to trust what the agent did in your name.',
        ],
        bullets: [
          'approval trail',
          'signed lifecycle log',
          'transaction payload context',
          'onchain receipt references',
          'offchain operator notes and docs links',
        ],
      },
      {
        id: 'github-guardrails',
        title: 'GitHub guardrails',
        body: [
          'The repository now expects GitHub-native guardrails around the financial runtime: CodeQL, secret scanning, dependency audits, SBOM generation, and a contract assertion that checks README, docs, skill.md, and runtime against each other.',
          'That policy matters because a repo can be technically open source and still unsafe if the public contract drifts or a secret lands in git without anyone noticing.',
        ],
      },
    ],
  },
];

export const docsPageMap = Object.fromEntries(docsPages.map((page) => [page.slug, page])) as Record<string, DocsPage>;

export const docsGroups = Array.from(
  docsPages.reduce((map, page) => {
    const pages = map.get(page.group) || [];
    pages.push(page);
    map.set(page.group, pages);
    return map;
  }, new Map<DocsPage['group'], DocsPage[]>()),
).map(([group, pages]) => ({ group, pages }));

export const defaultDocsPage = docsPages[0];
