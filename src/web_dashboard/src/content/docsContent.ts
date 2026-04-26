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
    title: 'A non-custodial control layer for agentic finance',
    summary:
      'UTG lets AI systems propose financial actions without ever receiving raw wallet custody, then routes approvals, policy checks, and audit evidence through a single operational surface.',
    hero:
      'Aima Universal Transaction Gateway is the settlement control plane between autonomous software and real-value execution.',
    sections: [
      {
        id: 'what-utg-solves',
        title: 'What UTG solves',
        body: [
          'AI agents are increasingly capable of taking action, but direct access to wallets, payment APIs, and internal finance systems creates unacceptable custody risk.',
          'UTG inserts a programmable enforcement layer between agent reasoning and settlement so automation stays useful while human trust boundaries stay intact.',
        ],
        bullets: [
          'Non-custodial execution posture',
          'Human-in-the-loop interrupts for high-risk actions',
          'Consistent logging, replay protection, and policy visibility',
        ],
        visual: 'trust-map',
      },
      {
        id: 'protocol-pillars',
        title: 'Protocol pillars',
        body: [
          'The public experience is designed around three promises: absolute safety, durable execution, and institutional observability.',
          'Those promises map directly to strict HITL approval, idempotent lifecycle handling, and auditable transaction records republished into the live dashboard.',
        ],
        bullets: [
          'Safety Sandwich for approval enforcement and domain controls',
          'Execution wrapper and idempotency manager for reliable replay handling',
          'Realtime operations surface backed by Firebase Realtime Database',
        ],
        callout: {
          tone: 'note',
          title: 'Where to start',
          body: 'If you are evaluating the product for the first time, read Architecture next, then Auth and Onboarding, then Human Approval Flow.',
        },
      },
    ],
  },
  {
    slug: 'architecture',
    label: 'Architecture',
    group: 'Protocol',
    eyebrow: 'Protocol Topology',
    title: 'How the gateway sits between agents, policy, and execution',
    summary:
      'UTG acts as an execution control membrane: inbound intent comes from an agent, policy and approval checks run locally, then only approved actions reach settlement rails.',
    hero:
      'The system is intentionally layered so that no single automation step can bypass approval, policy, or post-fact audit evidence.',
    sections: [
      {
        id: 'layered-control-plane',
        title: 'Layered control plane',
        body: [
          'The core architecture separates agent intent, policy evaluation, approval requirements, and actual execution so the platform can halt risky actions before any value moves.',
          'This layering is what allows UTG to remain non-custodial while still supporting agent-initiated workflows.',
        ],
        bullets: [
          'Agent request intake',
          'Policy and allowlist evaluation',
          'Approval and signature handling',
          'Execution wrapper and durable lifecycle logging',
        ],
        visual: 'architecture',
      },
      {
        id: 'safety-sandwich',
        title: 'Safety Sandwich',
        body: [
          'The Safety Sandwich is the protocol rule that forces sensitive actions through explicit human review instead of silent autonomous settlement.',
          'The gateway can halt, request out-of-band confirmation, and only then resume execution with signed evidence in the audit trail.',
        ],
        bullets: [
          'Interrupt before settlement',
          'Expose agent reasoning for review',
          'Require positive approval for continuation',
        ],
        visual: 'safety-sandwich',
      },
    ],
  },
  {
    slug: 'auth-onboarding',
    label: 'Auth & Onboarding',
    group: 'Getting Started',
    eyebrow: 'Identity Flow',
    title: 'Email verification, phone verification, and guided setup',
    summary:
      'The frontend now resumes users based on Firebase Auth state plus Firestore progress flags so returning operators continue exactly where they stopped.',
    hero:
      'Identity is progressive: email proves account ownership, phone proves operator presence, and onboarding captures operational context for the gateway.',
    sections: [
      {
        id: 'welcome-entry',
        title: 'Welcome entry',
        body: [
          'Users start from a split welcome surface with Google or email/password sign-in. Existing users resume their flow. New users create an account in the same screen.',
          'The landing page remains public, while the welcome route handles credential entry and verification guidance in the same browser window.',
        ],
        visual: 'auth-flow',
      },
      {
        id: 'verification-layers',
        title: 'Verification layers',
        body: [
          'Email verification uses Firebase action links that route back into the app. Phone verification runs after email verification and uses enterprise reCAPTCHA plus Firebase SMS verification.',
          'Progress is recorded in Firestore so users do not repeat completed steps.',
        ],
        bullets: [
          'Email verified before protected app access',
          'Phone verified before onboarding completion',
          'Onboarding completed before dashboard entry',
        ],
        code: {
          label: 'Client environment',
          language: 'bash',
          content: `VITE_FIREBASE_API_KEY=...\nVITE_FIREBASE_AUTH_DOMAIN=...\nVITE_FIREBASE_PROJECT_ID=...\nVITE_FIREBASE_DATABASE_URL=...\nVITE_RECAPTCHA_SITE_KEY=...`,
        },
        callout: {
          tone: 'warning',
          title: 'Return path',
          body: 'Email verification links should return to the same deployment origin so users resume the flow without losing state.',
        },
      },
    ],
  },
  {
    slug: 'human-approval-flow',
    label: 'Human Approval Flow',
    group: 'Operations',
    eyebrow: 'Approval Operations',
    title: 'How high-risk actions pause, explain themselves, and resume',
    summary:
      'Approval is not a generic modal. UTG carries the agent request, the policy reason, and the final disposition through a single transaction record.',
    hero:
      'The approval system is built so an operator can understand why the agent asked, what policy boundary triggered the halt, and what happened next.',
    sections: [
      {
        id: 'request-to-review',
        title: 'Request to review path',
        body: [
          'When a transaction crosses a safety threshold, the gateway records the intent, marks it pending, and exposes the request in the live dashboard.',
          'Operators can inspect the reasoning, review the amount and target, and approve or halt the flow with a durable audit record.',
        ],
        visual: 'request-flow',
      },
      {
        id: 'status-model',
        title: 'Status model',
        body: [
          'UI statuses are simplified for operators: Pending Review, Completed, and Blocked. Underneath, the system preserves the raw execution state for deeper audits.',
          'This lets the public dashboard remain readable without throwing away low-level protocol detail.',
        ],
        bullets: [
          'Pending Review for signature or intermediate approval states',
          'Completed for verified or settled execution states',
          'Blocked for rejected, failed, or halted states',
        ],
        code: {
          label: 'Representative transaction shape',
          language: 'json',
          content: `{\n  "id": "txn_9ab31c2f",\n  "statusUi": "Pending Review",\n  "reasoning": "Detected a requested transfer above the operator threshold.",\n  "gas": "0.0031 ETH",\n  "timeline": ["REQUESTED", "PENDING_SIGNATURES"]\n}`,
        },
      },
    ],
  },
  {
    slug: 'realtime-analytics',
    label: 'Realtime Analytics',
    group: 'Operations',
    eyebrow: 'Live Data',
    title: 'From SQLite lifecycle logs to live dashboard metrics',
    summary:
      'The gateway republishes approval and execution lifecycle data into Firebase Realtime Database so the operations dashboard updates without reloads.',
    hero:
      'The public-facing dashboard is no longer mock-only. It is fed from the same lifecycle artifacts the protocol already writes during execution.',
    sections: [
      {
        id: 'publisher-path',
        title: 'Publisher path',
        body: [
          'Pending approvals originate in the HITL transaction log, while execution lifecycle state comes from the audit log. A Firebase Admin publisher reads those sources and writes a normalized live tree.',
          'The frontend subscribes to summary, throughput, and transaction nodes directly from Realtime Database.',
        ],
        visual: 'analytics-pipeline',
        bullets: [
          'dashboard_live/summary',
          'dashboard_live/throughput_30d',
          'dashboard_live/transactions/{transactionId}',
        ],
      },
      {
        id: 'operator-surface',
        title: 'Operator surface',
        body: [
          'Overview shows protocol volume, active agents, pending approvals, and throughput. Transactions shows live rows with status badges, reasoning previews, and expandable payload details.',
          'Portfolio remains display-only in this phase because the repo does not currently expose a holdings ledger or balance indexer.',
        ],
        callout: {
          tone: 'success',
          title: 'What changed',
          body: 'The dashboard now behaves like an operations surface instead of a static mockup, while still preserving the existing backend logic and transaction flow.',
        },
      },
    ],
  },
  {
    slug: 'agent-integration',
    label: 'Agent Integration',
    group: 'Reference',
    eyebrow: 'MCP + Skill',
    title: 'Connect agents without surrendering control',
    summary:
      'UTG exposes a clear integration story for agent systems: connect to the gateway, obey the approval contract, and treat the protocol as the settlement authority.',
    hero:
      'Agents should see the gateway as a mediated execution partner, not a raw secret store.',
    sections: [
      {
        id: 'connection-model',
        title: 'Connection model',
        body: [
          'The gateway is designed to appear as a server in an MCP-style agent configuration. The agent asks for actions, receives halts or approvals, and retries through a consistent interface.',
          'The `skill.md` reference remains available as a raw artifact for agent-side discovery and instruction loading.',
        ],
        code: {
          label: 'Example MCP server entry',
          language: 'json',
          content: `{\n  "aima_utg": {\n    "command": "python",\n    "args": ["/absolute/path/to/universal-transaction-gateway/src/gateway/server.py"],\n    "env": {\n      "AIMA_API_KEY": "...",\n      "ETHEREUM_RPC_URL": "..."\n    }\n  }\n}`,
        },
        callout: {
          tone: 'note',
          title: 'Agent reference',
          body: 'Link directly to /docs/skill.md from integration tooling when you need the raw skill contract outside the visual docs experience.',
        },
      },
      {
        id: 'behavioral-contract',
        title: 'Behavioral contract',
        body: [
          'Agents must be prepared for a halt-and-resume model. Approval-required actions are expected to stop, wait for user confirmation, and continue only after the gateway records the signature share.',
          'Retries are safe when they preserve the idempotency key and respect the gateway response state.',
        ],
        bullets: [
          'Do not assume direct wallet control',
          'Treat HALTED or pending approval as an expected state',
          'Reuse transaction identifiers safely across retries',
        ],
      },
    ],
  },
  {
    slug: 'security-compliance',
    label: 'Security & Compliance',
    group: 'Protocol',
    eyebrow: 'Controls',
    title: 'Durable safeguards, auditability, and operational trust',
    summary:
      'UTG prioritizes controls that reduce real execution risk: idempotency, rollback visibility, policy enforcement, and cryptographically meaningful audit records.',
    hero:
      'Institutional trust comes from being able to explain what happened, why it happened, and what prevented the unsafe path.',
    sections: [
      {
        id: 'idempotency-and-recovery',
        title: 'Idempotency and recovery',
        body: [
          'When a client retries a request, the gateway uses deterministic execution controls to prevent duplicate settlement. The same transaction path can be inspected, resumed, or finalized without multiplying risk.',
          'Rollback and cleanup logic keep temporary approval artifacts from lingering after completion.',
        ],
        visual: 'rollback-flow',
      },
      {
        id: 'compliance-posture',
        title: 'Compliance posture',
        body: [
          'The protocol aims for strong local auditability and non-repudiation rather than central custody. This supports internal governance, incident review, and regulated operating expectations.',
          'Logs, signatures, and transaction metadata remain part of an explainable trail rather than vanishing into application black boxes.',
        ],
        bullets: [
          'Human-verifiable approval trail',
          'Local audit storage as system record',
          'Clear boundaries between agent request and value movement',
        ],
        callout: {
          tone: 'critical',
          title: 'Control boundary',
          body: 'The gateway does not eliminate operator responsibility. It provides enforced pauses, clearer evidence, and safer defaults so operators can make informed decisions.',
        },
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
