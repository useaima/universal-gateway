export type DocsVisual =
  | 'architecture'
  | 'auth-flow'
  | 'request-flow'
  | 'safety-sandwich'
  | 'analytics-pipeline'
  | 'rollback-flow'
  | 'trust-map';

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
        visual: 'trust-map',
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
            'GATEWAY_PASSCODE=...\nBASE_PRIVATE_KEY=0x...\nETHEREUM_PRIVATE_KEY=0x...\nBASE_RPC_URL=https://mainnet.base.org\nETHEREUM_RPC_URL=https://mainnet.gateway.tenderly.co/public\nTREASURY_ADDRESS=0x...\nAIMA_API_KEY=...\nFIREBASE_DATABASE_URL=...\nFIREBASE_PROJECT_ID=...',
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
          'MCP server layer',
          'Tool and skill registry',
          'Approval and HITL service',
          'Execution and idempotency wrapper',
          'x402 payment challenge contract',
          'Audit and RTDB publisher',
        ],
        visual: 'architecture',
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
        visual: 'request-flow',
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
          'This keeps the operator story honest: if the gateway is not configured to accept approval shares, it tells you directly.',
        ],
        visual: 'safety-sandwich',
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
        visual: 'analytics-pipeline',
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
        visual: 'request-flow',
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
        visual: 'rollback-flow',
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
