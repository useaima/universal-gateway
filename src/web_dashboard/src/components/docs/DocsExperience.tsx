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

function VisualFrame({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[26px] border border-[#e6d8c2] bg-[linear-gradient(180deg,#fffef8,#f9f2e6)] p-5 shadow-[0_24px_60px_rgba(111,86,44,0.08)]">
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
      <p className="text-xs font-mono uppercase tracking-[0.2em] opacity-70">{title}</p>
      <p className="mt-3 text-sm leading-6">{detail}</p>
    </div>
  );
}

function DiagramRail({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-2 px-2 py-1 text-[11px] font-mono uppercase tracking-[0.18em] text-[#a27e38]">
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
            <StepCard title="Phone" detail="reCAPTCHA + SMS verification" tone="amber" />
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
              <p className="text-xs font-mono uppercase tracking-[0.18em] text-[#9a8357]">Summary</p>
              <p className="mt-3 text-2xl font-semibold text-slate-900">$8.4M</p>
              <p className="mt-1 text-sm text-slate-500">30-day notional volume</p>
            </div>
            <div className="rounded-2xl border border-[#eadfcf] bg-white p-4">
              <p className="text-xs font-mono uppercase tracking-[0.18em] text-[#9a8357]">Pending</p>
              <p className="mt-3 text-2xl font-semibold text-slate-900">14</p>
              <p className="mt-1 text-sm text-slate-500">signature reviews in queue</p>
            </div>
            <div className="rounded-2xl border border-[#eadfcf] bg-white p-4">
              <p className="text-xs font-mono uppercase tracking-[0.18em] text-[#9a8357]">Latency</p>
              <p className="mt-3 text-2xl font-semibold text-slate-900">Live</p>
              <p className="mt-1 text-sm text-slate-500">subscribed without page reload</p>
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
              <p className="mt-4 text-sm font-mono uppercase tracking-[0.22em] text-[#9a8357]">UTG</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">Policy, approval, audit, and execution controls converge here.</p>
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
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-[#9a8357]">{label}</p>
          <p className="mt-1 text-xs text-slate-400">{language}</p>
        </div>
        <button type="button" onClick={handleCopy} className="light-button-secondary px-3 py-2 text-xs font-mono">
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-4 text-sm leading-7 text-slate-700">
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
          <p className="text-xs font-mono uppercase tracking-[0.18em] text-[#9a8357]">Previous</p>
          <p className="mt-3 text-lg font-semibold text-slate-900">{previous.label}</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">{previous.summary}</p>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link to={`/docs/${next.slug}`} className="light-card p-5 text-left md:text-right">
          <p className="text-xs font-mono uppercase tracking-[0.18em] text-[#9a8357]">Next</p>
          <p className="mt-3 text-lg font-semibold text-slate-900">{next.label}</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">{next.summary}</p>
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
              <p className="text-[11px] font-mono uppercase tracking-[0.24em] text-[#9a8357]">
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
                className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400"
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
                      <p className="mt-1 text-xs font-mono uppercase tracking-[0.18em] text-[#9a8357]">
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

        <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_240px]">
          <aside className="light-panel h-fit p-5">
            <div className="mb-5 flex items-center gap-2 text-[#a27e38]">
              <BookOpen className="h-4 w-4" />
              <p className="text-xs font-mono uppercase tracking-[0.22em]">Documentation</p>
            </div>

            <div className="space-y-6">
              {docsGroups.map((group) => (
                <div key={group.group}>
                  <p className="mb-3 text-[11px] font-mono uppercase tracking-[0.22em] text-slate-400">{group.group}</p>
                  <div className="space-y-1.5">
                    {group.pages.map((groupPage) => (
                      <NavLink
                        key={groupPage.slug}
                        to={groupPage.slug === defaultDocsPage.slug ? '/docs' : `/docs/${groupPage.slug}`}
                        end={groupPage.slug === defaultDocsPage.slug}
                        className={({ isActive }) =>
                          `block rounded-2xl px-4 py-3 text-sm transition ${
                            isActive
                              ? 'border border-[#e1c27b] bg-[#fff4da] font-semibold text-slate-900 shadow-[0_16px_40px_rgba(111,86,44,0.08)]'
                              : 'border border-transparent text-slate-500 hover:border-[#eadfcf] hover:bg-white/70 hover:text-slate-800'
                          }`
                        }
                      >
                        <span className="block">{groupPage.label}</span>
                        <span className="mt-1 block text-xs text-slate-400">{groupPage.title}</span>
                      </NavLink>
                    ))}
                  </div>
                </div>
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
                  <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">{page.summary}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
                  <div className="rounded-2xl border border-[#eadfcf] bg-white/80 p-4">
                    <div className="flex items-center gap-2 text-[#a27e38]">
                      <ShieldCheck className="h-4 w-4" />
                      <span className="text-xs font-mono uppercase tracking-[0.18em]">Protocol note</span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{page.hero}</p>
                  </div>
                  <div className="rounded-2xl border border-[#eadfcf] bg-[#fff8e9] p-4">
                    <div className="grid gap-3 text-sm text-slate-700">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2"><Bot className="h-4 w-4 text-[#b78b32]" /> Agents</span>
                        <span className="font-mono text-xs text-[#9a8357]">Intent</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2"><Fingerprint className="h-4 w-4 text-[#b78b32]" /> Identity</span>
                        <span className="font-mono text-xs text-[#9a8357]">Verified</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2"><Database className="h-4 w-4 text-[#b78b32]" /> Audit</span>
                        <span className="font-mono text-xs text-[#9a8357]">Traceable</span>
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
                        <p key={paragraph} className="max-w-4xl text-base leading-8 text-slate-600">
                          {paragraph}
                        </p>
                      ))}
                    </div>

                    {section.bullets && (
                      <div className="mt-6 grid gap-3 md:grid-cols-2">
                        {section.bullets.map((bullet) => (
                          <div key={bullet} className="rounded-2xl border border-[#eadfcf] bg-white/80 px-4 py-3 text-sm text-slate-600">
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
                        <p className="mt-3 text-sm leading-7">{section.callout.body}</p>
                      </div>
                    )}

                    {section.visual && <div className="mt-6"><DocsVisualBlock visual={section.visual} /></div>}
                    {section.code && <div className="mt-6"><DocsCodeBlock {...section.code} /></div>}
                  </section>
                ))}
              </div>

              <Pager currentPage={page} />
            </div>
          </main>

          <aside className="light-panel hidden h-fit p-5 xl:block">
            <p className="mb-4 text-xs font-mono uppercase tracking-[0.22em] text-[#9a8357]">On this page</p>
            <div className="space-y-2">
              {page.sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="block rounded-2xl px-3 py-2 text-sm text-slate-500 transition hover:bg-white/75 hover:text-slate-900"
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
