import { type ReactNode, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowRight,
  BookOpen,
  Bot,
  ChevronRight,
  Database,
  ExternalLink,
  Fingerprint,
  Network,
  Search,
  ShieldCheck,
  Sparkles,
  Workflow,
} from 'lucide-react';
import { Link, NavLink, useLocation, useParams } from 'react-router-dom';
import {
  defaultDocsPage,
  docsGroups,
  docsPageMap,
  docsPages,
  type DocsCallout,
  type DocsPage,
  type DocsVisual,
} from '../../content/docsContent';

interface DocsExperienceProps {
  onStart: () => void;
}

const calloutStyles: Record<DocsCallout['tone'], string> = {
  note: 'border-sky-200 bg-sky-50/90 text-sky-900',
  warning: 'border-amber-200 bg-amber-50/90 text-amber-950',
  critical: 'border-rose-200 bg-rose-50/90 text-rose-950',
  success: 'border-emerald-200 bg-emerald-50/90 text-emerald-950',
};

const visualNotes: Partial<Record<DocsVisual, string>> = {
  architecture:
    'Operationally, this means the agent never talks directly to settlement. Every value-moving request passes through policy, approval, and audit boundaries first.',
  'request-flow':
    'Operationally, a halted request is a normal state. Agents should ask for approval, submit the signature share, and then retry the original request instead of fabricating a new one.',
  'safety-sandwich':
    'Operationally, the control model is layered on purpose so a single bug or missed provider check does not silently turn into value movement.',
  'analytics-pipeline':
    'Operationally, the dashboard is reading normalized lifecycle data, not a disconnected marketing shell. The same trees back review, metrics, and transaction inspection.',
  'rollback-flow':
    'Operationally, retries are expected. The idempotency layer and execution wrapper are what keep a flaky network from becoming a duplicate settlement event.',
  'trust-map':
    'Operationally, humans remain the final authority. The gateway is the control layer between agent reasoning and any rail that can actually move funds.',
};

function VisualFrame({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[26px] border border-[#e0cfb0] bg-[linear-gradient(180deg,#fffef9,#f8f0e2)] p-5 shadow-[0_24px_60px_rgba(111,86,44,0.08)]">
      {children}
    </div>
  );
}

function StepCard({
  title,
  detail,
  tone = 'gold',
}: {
  title: string;
  detail: string;
  tone?: 'gold' | 'emerald' | 'amber' | 'rose' | 'slate';
}) {
  const toneStyles = {
    gold: 'border-[#e5c980] bg-[#fff6de] text-[#6c4c12]',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    amber: 'border-amber-200 bg-amber-50 text-amber-900',
    rose: 'border-rose-200 bg-rose-50 text-rose-900',
    slate: 'border-slate-200 bg-white text-slate-800',
  } as const;

  return (
    <div className={`rounded-2xl border p-4 ${toneStyles[tone]}`}>
      <p className="text-[12px] font-mono uppercase tracking-[0.18em] opacity-80">{title}</p>
      <p className="mt-3 text-[15px] leading-7 text-current">{detail}</p>
    </div>
  );
}

function DiagramRail({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-2 px-2 py-1 text-[12px] font-mono uppercase tracking-[0.18em] text-[#7c5a1b]">
      <div className="h-px flex-1 bg-[#e4cc98]" />
      <span>{label}</span>
      <div className="h-px flex-1 bg-[#e4cc98]" />
    </div>
  );
}

function DocsVisualBlock({ visual }: { visual: DocsVisual }) {
  switch (visual) {
    case 'architecture':
      return (
        <VisualFrame>
          <div className="grid gap-4 lg:grid-cols-4">
            <StepCard title="Agents" detail="Claude, OpenClaw, and custom operators submit intent into the gateway instead of raw wallet calls." tone="slate" />
            <StepCard title="Policy" detail="Domain controls, threshold rules, and request shaping validate the intent envelope." tone="gold" />
            <StepCard title="Approval" detail="Sensitive actions pause into reviewed signature steps with explicit operator action." tone="amber" />
            <StepCard title="Settlement" detail="Only approved actions reach execution rails, audit logging, and final reconciliation." tone="emerald" />
          </div>
          <DiagramRail label="Intent enters left, value moves only after the center gates clear" />
          <div className="grid gap-4 lg:grid-cols-2">
            <StepCard title="Durable lifecycle" detail="Execution state is logged step by step so retries and audits share the same narrative." tone="slate" />
            <StepCard title="Live observability" detail="SQLite lifecycle artifacts are republished into RTDB for operational dashboards and review workflows." tone="slate" />
          </div>
        </VisualFrame>
      );
    case 'auth-flow':
      return (
        <VisualFrame>
          <div className="grid gap-4 lg:grid-cols-5">
            <StepCard title="Welcome" detail="Email/password or Google entry" tone="slate" />
            <StepCard title="Email" detail="Verification link returns in-app" tone="gold" />
            <StepCard title="Resume" detail="Account state sync decides the next screen" tone="amber" />
            <StepCard title="Onboarding" detail="Wallet, network, and policy setup" tone="emerald" />
            <StepCard title="Dashboard" detail="Live command center access" tone="slate" />
          </div>
          <DiagramRail label="Users resume from the first incomplete step" />
        </VisualFrame>
      );
    case 'request-flow':
      return (
        <VisualFrame>
          <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-stretch">
            <StepCard title="Agent request" detail="Intent arrives with target, value, and reasoning." tone="slate" />
            <div className="hidden items-center justify-center lg:flex">
              <ArrowRight className="h-5 w-5 text-[#b78932]" />
            </div>
            <StepCard title="Gateway halt" detail="Policy threshold triggers pending review instead of settlement." tone="amber" />
            <div className="hidden items-center justify-center lg:flex">
              <ArrowRight className="h-5 w-5 text-[#b78932]" />
            </div>
            <StepCard title="Operator action" detail="Approve or reject with reasoning and audit visibility." tone="emerald" />
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <StepCard title="Completed" detail="Approved execution publishes final state and throughput metrics." tone="emerald" />
            <StepCard title="Blocked" detail="Rejected or failed flows remain inspectable for governance review." tone="rose" />
          </div>
        </VisualFrame>
      );
    case 'safety-sandwich':
      return (
        <VisualFrame>
          <div className="space-y-3">
            <StepCard title="Outer boundary" detail="Allowlists, request normalization, and rate shaping reduce malformed or unsafe intent." tone="slate" />
            <StepCard title="Middle boundary" detail="Approval thresholds and HITL rules decide when a request must stop for human review." tone="amber" />
            <StepCard title="Core boundary" detail="Execution wrapper, idempotency, and signed audit entries guard the final move of value." tone="gold" />
          </div>
          <DiagramRail label="Three independent layers block a single-point bypass" />
        </VisualFrame>
      );
    case 'analytics-pipeline':
      return (
        <VisualFrame>
          <div className="grid gap-4 lg:grid-cols-4">
            <StepCard title="transactions.db" detail="Pending approvals and signature state" tone="slate" />
            <StepCard title="audit_v2.db" detail="Execution lifecycle and signed entries" tone="gold" />
            <StepCard title="RTDB publisher" detail="Normalizes summary, throughput, and transactions" tone="amber" />
            <StepCard title="Web dashboard" detail="Overview and transactions subscribe live" tone="emerald" />
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-[#eadfcf] bg-white p-4">
              <p className="reading-label">Input tree</p>
              <p className="mt-3 text-lg font-semibold text-slate-900">dashboard_live/summary</p>
              <p className="mt-2 text-base leading-7 text-[#333333]">Aggregated live metrics published from real gateway state.</p>
            </div>
            <div className="rounded-2xl border border-[#eadfcf] bg-white p-4">
              <p className="reading-label">Input tree</p>
              <p className="mt-3 text-lg font-semibold text-slate-900">dashboard_live/transactions</p>
              <p className="mt-2 text-base leading-7 text-[#333333]">Approval and execution records consumed by review surfaces.</p>
            </div>
            <div className="rounded-2xl border border-[#eadfcf] bg-white p-4">
              <p className="reading-label">Input tree</p>
              <p className="mt-3 text-lg font-semibold text-slate-900">gas_live/base</p>
              <p className="mt-2 text-base leading-7 text-[#333333]">Chain-specific gas data rendered without page reload.</p>
            </div>
          </div>
        </VisualFrame>
      );
    case 'rollback-flow':
      return (
        <VisualFrame>
          <div className="grid gap-4 lg:grid-cols-5">
            <StepCard title="Request" detail="Intent receives an idempotency lock" tone="slate" />
            <StepCard title="Execute" detail="Task runs inside a bounded execution wrapper" tone="gold" />
            <StepCard title="Verify" detail="State is validated before final status is published" tone="emerald" />
            <StepCard title="Recover" detail="Failures remain inspectable without duplicate settlement" tone="amber" />
            <StepCard title="Clean" detail="Ephemeral signature material is wiped after completion" tone="rose" />
          </div>
          <DiagramRail label="Retry-safe execution without double-spend drift" />
        </VisualFrame>
      );
    case 'trust-map':
      return (
        <VisualFrame>
          <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr_1fr] lg:items-center">
            <StepCard title="Operators" detail="Humans retain final authority for risky value movement." tone="slate" />
            <div className="rounded-[28px] border border-[#e5d3b3] bg-[radial-gradient(circle_at_center,rgba(227,193,124,0.34),rgba(255,255,255,0.9))] p-6 text-center shadow-inner">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-[#dcb768] bg-[#fff8e5] text-[#a1711f] shadow-[0_0_0_10px_rgba(255,240,209,0.9)]">
                <ShieldCheck className="h-10 w-10" />
              </div>
              <p className="mt-4 text-sm font-mono uppercase tracking-[0.22em] text-[#7c5a1b]">UTG</p>
              <p className="mt-2 text-base leading-7 text-[#333333]">Policy, approval, audit, and execution controls converge here.</p>
            </div>
            <StepCard title="Settlement rails" detail="EVM and external transaction paths only activate after the gateway says yes." tone="emerald" />
          </div>
        </VisualFrame>
      );
    default:
      return null;
  }
}

function DocsCodeBlock({
  label,
  language,
  content,
}: {
  label: string;
  language: string;
  content: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="light-code overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#eadfcf] px-4 py-3">
        <div>
          <p className="reading-label">{label}</p>
          <p className="mt-1 text-xs text-[#555555]">{language}</p>
        </div>
        <button type="button" onClick={handleCopy} className="light-button-secondary px-3 py-2 text-xs font-mono">
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-4 text-[15px] leading-8 text-[#252525]">
        <code>{content}</code>
      </pre>
    </div>
  );
}

function Pager({ currentPage }: { currentPage: DocsPage }) {
  const currentIndex = docsPages.findIndex((page) => page.slug === currentPage.slug);
  const previous = currentIndex > 0 ? docsPages[currentIndex - 1] : null;
  const next = currentIndex < docsPages.length - 1 ? docsPages[currentIndex + 1] : null;

  return (
    <div className="mt-10 grid gap-4 md:grid-cols-2">
      {previous ? (
        <Link to={`/docs/${previous.slug}`} className="light-card p-5">
          <p className="reading-label">Previous</p>
          <p className="mt-3 text-lg font-semibold text-slate-900">{previous.label}</p>
          <p className="mt-2 text-base leading-7 text-[#333333]">{previous.summary}</p>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link to={`/docs/${next.slug}`} className="light-card p-5 text-left md:text-right">
          <p className="reading-label">Next</p>
          <p className="mt-3 text-lg font-semibold text-slate-900">{next.label}</p>
          <p className="mt-2 text-base leading-7 text-[#333333]">{next.summary}</p>
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}

export default function DocsExperience({ onStart }: DocsExperienceProps) {
  const { pageSlug } = useParams();
  const location = useLocation();
  const page = docsPageMap[pageSlug || defaultDocsPage.slug] || defaultDocsPage;
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const activeGroup = page.group;
  const activeGroupEntry = docsGroups.find((group) => group.group === activeGroup) || docsGroups[0];
  const activeGroupPages = activeGroupEntry.pages;

  useEffect(() => {
    if (!location.hash) {
      return;
    }

    const targetId = location.hash.replace('#', '');
    window.requestAnimationFrame(() => {
      const element = document.getElementById(targetId);
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [location.hash, page.slug]);

  const searchResults = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return [];
    }

    return docsPages
      .flatMap((docPage) =>
        docPage.sections.map((section) => ({
          page: docPage,
          sectionId: section.id,
          title: section.title,
          body: section.body.join(' '),
        })),
      )
      .filter(
        (result) =>
          result.page.title.toLowerCase().includes(normalized) ||
          result.page.label.toLowerCase().includes(normalized) ||
          result.title.toLowerCase().includes(normalized) ||
          result.body.toLowerCase().includes(normalized),
      )
      .slice(0, 8);
  }, [query]);

  return (
    <div className="landing-shell min-h-screen font-sans">
      <div className="mx-auto max-w-[1660px] px-4 py-4 md:px-6 md:py-5">
        <header className="light-nav sticky top-4 z-40 mb-6 flex flex-col gap-4 px-5 py-4 md:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Aima Logo" className="h-10 w-10 rounded-full border border-[#eadfcf] bg-white/80 p-1.5 object-contain" />
              <div>
                <Link to="/" className="block text-lg font-semibold text-slate-900">
                  Aima Protocol Docs
                </Link>
                <p className="text-[12px] font-mono uppercase tracking-[0.22em] text-[#6f4e17]">
                  Universal Transaction Gateway
                </p>
              </div>
            </div>

          <div className="relative w-full max-w-2xl">
            <div className="flex items-center gap-3 rounded-2xl border border-[#eadfcf] bg-white/85 px-4 py-3 shadow-[0_18px_46px_rgba(111,86,44,0.06)]">
              <Search className="h-4 w-4 text-[#a8843b]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onFocus={() => setShowResults(true)}
                onBlur={() => window.setTimeout(() => setShowResults(false), 120)}
                placeholder="Search architecture, approvals, realtime analytics"
                className="w-full bg-transparent text-[15px] text-[#202020] placeholder:text-[#666666]"
              />
            </div>

            {showResults && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-[calc(100%+0.65rem)] rounded-3xl border border-[#eadfcf] bg-white/96 p-3 shadow-[0_28px_70px_rgba(111,86,44,0.12)]">
                {searchResults.map((result) => (
                  <Link
                    key={`${result.page.slug}-${result.sectionId}`}
                    to={`/docs/${result.page.slug}#${result.sectionId}`}
                    className="flex items-start justify-between rounded-2xl px-3 py-3 transition hover:bg-[#f8f3e8]"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{result.title}</p>
                      <p className="mt-1 text-[12px] font-mono uppercase tracking-[0.18em] text-[#6f4e17]">
                        {result.page.label}
                      </p>
                    </div>
                    <ChevronRight className="mt-1 h-4 w-4 text-slate-400" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/" className="light-button-secondary px-4 py-2 text-sm font-mono">
              Back to site
            </Link>
            <button type="button" onClick={onStart} className="light-button-primary px-4 py-2 text-sm">
              Get Started
            </button>
          </div>
        </header>

        <div className="mb-5 flex flex-wrap gap-3">
          {docsGroups.map((group) => {
            const groupHref = group.pages[0]?.slug === defaultDocsPage.slug ? '/docs' : `/docs/${group.pages[0]?.slug}`;
            const isActive = group.group === activeGroup;

            return (
              <NavLink
                key={group.group}
                to={groupHref}
                className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? 'border-[#d4b06d] bg-[#fff1cf] text-[#161616] shadow-[0_14px_30px_rgba(111,86,44,0.08)]'
                    : 'border-[#e2d2b8] bg-white/72 text-[#333333] hover:border-[#d4b06d] hover:bg-white'
                }`}
              >
                <span className="block">{group.group}</span>
              </NavLink>
            );
          })}
        </div>

        <div className="grid gap-6 xl:grid-cols-[290px_minmax(0,1fr)_240px]">
          <aside className="light-panel h-fit p-5">
            <div className="mb-5 flex items-center gap-2 text-[#a27e38]">
              <BookOpen className="h-4 w-4" />
              <p className="text-xs font-mono uppercase tracking-[0.22em]">Documentation</p>
            </div>

            <div className="space-y-3">
              <div>
                <p className="mb-3 text-[12px] font-mono uppercase tracking-[0.22em] text-[#6f4e17]">{activeGroup}</p>
                <p className="mb-4 text-sm leading-7 text-[#444444]">
                  Browse this section with the left menu, or search across every docs page from the bar above.
                </p>
              </div>
              {activeGroupPages.map((groupPage) => (
                <NavLink
                  key={groupPage.slug}
                  to={groupPage.slug === defaultDocsPage.slug ? '/docs' : `/docs/${groupPage.slug}`}
                  end={groupPage.slug === defaultDocsPage.slug}
                  className={({ isActive }) =>
                    `block rounded-2xl px-4 py-3 transition ${
                      isActive
                        ? 'border border-[#e1c27b] bg-[#fff4da] shadow-[0_16px_40px_rgba(111,86,44,0.08)]'
                        : 'border border-transparent bg-transparent hover:border-[#eadfcf] hover:bg-white/70'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className={`block text-[15px] font-semibold ${isActive ? 'text-[#171717]' : 'text-[#2b2b2b]'}`}>{groupPage.label}</span>
                      <span className={`mt-1 block text-sm leading-6 ${isActive ? 'text-[#444444]' : 'text-[#555555]'}`}>{groupPage.title}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            <div className="light-divider mt-6 pt-6">
              <a
                href="/docs/skill.md"
                target="_blank"
                rel="noopener noreferrer"
                className="light-button-secondary w-full justify-between px-4 py-3 text-sm font-mono"
              >
                Agent skill reference
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </aside>

          <main className="min-w-0">
            <div className="light-panel p-6 md:p-8">
              <div className="grid gap-6 border-b border-[#eadfcf] pb-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
                <div>
                  <div className="light-eyebrow mb-5">
                    <Sparkles className="h-4 w-4 text-[#b68b38]" />
                    {page.eyebrow}
                  </div>
                  <h1 className="max-w-4xl text-4xl font-semibold leading-tight text-slate-900 md:text-5xl">
                    {page.title}
                  </h1>
                  <p className="mt-5 max-w-3xl text-xl leading-9 text-[#242424]">{page.summary}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
                  <div className="rounded-2xl border border-[#eadfcf] bg-white/80 p-4">
                    <div className="flex items-center gap-2 text-[#a27e38]">
                      <ShieldCheck className="h-4 w-4" />
                      <span className="text-[12px] font-mono uppercase tracking-[0.18em]">Protocol note</span>
                    </div>
                    <p className="mt-3 text-base leading-8 text-[#333333]">{page.hero}</p>
                  </div>
                  <div className="rounded-2xl border border-[#eadfcf] bg-[#fff8e9] p-4">
                    <div className="grid gap-3 text-[15px] text-[#242424]">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2"><Bot className="h-4 w-4 text-[#b78b32]" /> Agents</span>
                        <span className="font-mono text-xs text-[#7c5a1b]">Intent</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2"><Fingerprint className="h-4 w-4 text-[#b78b32]" /> Identity</span>
                        <span className="font-mono text-xs text-[#7c5a1b]">Verified</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2"><Database className="h-4 w-4 text-[#b78b32]" /> Audit</span>
                        <span className="font-mono text-xs text-[#7c5a1b]">Traceable</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-10">
                {page.sections.map((section) => (
                  <section key={section.id} id={section.id} className="scroll-mt-28 border-b border-[#f0e4d1] pb-10 last:border-b-0 last:pb-0">
                    <div className="flex items-center gap-3 text-[#a27e38]">
                      {section.visual === 'analytics-pipeline' ? (
                        <Database className="h-4 w-4" />
                      ) : section.visual === 'request-flow' ? (
                        <Workflow className="h-4 w-4" />
                      ) : section.visual === 'trust-map' ? (
                        <Network className="h-4 w-4" />
                      ) : (
                        <Activity className="h-4 w-4" />
                      )}
                      <p className="text-xs font-mono uppercase tracking-[0.22em]">{section.title}</p>
                    </div>
                    <h2 className="mt-4 text-3xl font-semibold text-slate-900">{section.title}</h2>
                    <div className="mt-5 space-y-4">
                      {section.body.map((paragraph) => (
                        <p key={paragraph} className="max-w-4xl text-[17px] leading-8 text-[#242424] md:text-[18px]">
                          {paragraph}
                        </p>
                      ))}
                    </div>

                    {section.bullets && (
                      <div className="mt-6 grid gap-3 md:grid-cols-2">
                        {section.bullets.map((bullet) => (
                          <div key={bullet} className="rounded-2xl border border-[#eadfcf] bg-white/80 px-4 py-3 text-[15px] text-[#303030]">
                            <div className="flex items-start gap-3">
                              <span className="mt-1 h-2 w-2 rounded-full bg-[#cfa95d]" />
                              <span>{bullet}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {section.callout && (
                      <div className={`mt-6 rounded-3xl border px-5 py-5 ${calloutStyles[section.callout.tone]}`}>
                        <p className="text-xs font-mono uppercase tracking-[0.2em]">{section.callout.title}</p>
                        <p className="mt-3 text-base leading-8">{section.callout.body}</p>
                      </div>
                    )}

                    {section.visual && (
                      <div className="mt-6">
                        <DocsVisualBlock visual={section.visual} />
                        {visualNotes[section.visual] && (
                          <p className="mt-4 max-w-4xl text-base leading-8 text-[#3a3a3a]">
                            {visualNotes[section.visual]}
                          </p>
                        )}
                      </div>
                    )}
                    {section.code && <div className="mt-6"><DocsCodeBlock {...section.code} /></div>}
                  </section>
                ))}
              </div>

              <Pager currentPage={page} />
            </div>
          </main>

          <aside className="light-panel hidden h-fit p-5 xl:block">
            <p className="mb-4 text-[12px] font-mono uppercase tracking-[0.22em] text-[#6f4e17]">On this page</p>
            <div className="space-y-2">
              {page.sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="block rounded-2xl px-3 py-2 text-sm text-[#444444] transition hover:bg-white/75 hover:text-black"
                >
                  {section.title}
                </a>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
