import type { ReactNode } from 'react';
import {
  ArrowRight,
  BarChart3,
  Bot,
  Network,
  Repeat2,
  ShieldCheck,
  Wallet,
} from 'lucide-react';

function ShowcaseShell({
  index,
  eyebrow,
  title,
  description,
  children,
}: {
  index: string;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <article className="light-panel grid gap-8 p-6 md:p-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
      <div>
        <p className="reading-label">{index}</p>
        <div className="light-eyebrow mt-4">{eyebrow}</div>
        <h3 className="mt-5 text-3xl font-semibold text-slate-900 md:text-4xl">{title}</h3>
        <p className="mt-5 max-w-xl text-lg leading-9 text-[#242424]">{description}</p>
      </div>
      <div>{children}</div>
    </article>
  );
}

function SafetyLayersVisual() {
  return (
    <div className="space-y-4 rounded-[30px] border border-[#e6d8c2] bg-[linear-gradient(180deg,#fffef8,#fbf3e4)] p-6 shadow-[0_28px_72px_rgba(111,86,44,0.08)]">
      {[
        ['Domain controls', 'Prevent off-policy destinations before the workflow even warms up.'],
        ['Approval thresholds', 'Escalate only the actions that deserve a human signature.'],
        ['Execution guarantees', 'Run idempotent settlement with logs, cleanup, and lifecycle evidence.'],
      ].map(([title, detail], index) => (
        <div key={title} className="rounded-3xl border border-[#eadfcf] bg-white/90 p-5">
          <div className="flex items-center justify-between">
            <p className="reading-label">Layer {index + 1}</p>
            <ShieldCheck className="h-4 w-4 text-[#b3842f]" />
          </div>
          <h4 className="mt-3 text-xl font-semibold text-slate-900">{title}</h4>
          <p className="mt-2 text-base leading-8 text-[#333333]">{detail}</p>
        </div>
      ))}
    </div>
  );
}

function ApprovalVisual() {
  return (
    <div className="rounded-[30px] border border-[#e6d8c2] bg-[#fffef9] p-5 shadow-[0_28px_72px_rgba(111,86,44,0.08)]">
      <div className="rounded-[26px] border border-[#e7d7be] bg-[linear-gradient(180deg,#fffdf6,#fff5df)] p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-amber-700">Signature required</p>
            <h4 className="mt-2 text-2xl font-semibold text-slate-900">$12,500 ETH transfer</h4>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-mono uppercase tracking-[0.18em] text-amber-800">
            Pending review
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-[#eadfcf] bg-white/90 p-4">
            <p className="reading-label">Agent reasoning</p>
            <p className="mt-3 text-base leading-8 text-[#333333]">
              Identified spread across two liquidity venues and proposed a transfer above the operator threshold.
            </p>
          </div>
          <div className="rounded-2xl border border-[#eadfcf] bg-white/90 p-4">
            <p className="reading-label">Policy trigger</p>
            <p className="mt-3 text-base leading-8 text-[#333333]">
              Transaction exceeds daily autonomous limit and requires positive operator signature before settlement.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
            Approve & Sign
          </div>
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-900">
            Reject & Halt
          </div>
        </div>
      </div>
    </div>
  );
}

function IdempotencyVisual() {
  return (
    <div className="rounded-[30px] border border-[#e6d8c2] bg-[#fffef8] p-6 shadow-[0_28px_72px_rgba(111,86,44,0.08)]">
      <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-center">
        <div className="rounded-2xl border border-[#eadfcf] bg-white p-4">
          <p className="reading-label">Request flood</p>
          <p className="mt-3 text-base leading-8 text-[#333333]">Retry x100 from the same agent task.</p>
        </div>
        <Repeat2 className="mx-auto h-5 w-5 text-[#b3842f]" />
        <div className="rounded-2xl border border-[#eadfcf] bg-[#fff7e7] p-4">
          <p className="reading-label">Idempotency lock</p>
          <p className="mt-3 text-base leading-8 text-[#333333]">The key is held once, and duplicate intent becomes memoized state.</p>
        </div>
        <ArrowRight className="mx-auto h-5 w-5 text-[#b3842f]" />
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-xs font-mono uppercase tracking-[0.18em] text-emerald-700">Single settlement</p>
          <p className="mt-3 text-base leading-8 text-emerald-950">One final result, no duplicate spend, clean replay semantics.</p>
        </div>
      </div>
    </div>
  );
}

function RealtimeVisual() {
  return (
    <div className="rounded-[30px] border border-[#e6d8c2] bg-[#fffef8] p-5 shadow-[0_28px_72px_rgba(111,86,44,0.08)]">
      <div className="grid gap-4 lg:grid-cols-[0.78fr_1.22fr]">
        <div className="space-y-4">
          {[
            ['Source 01', 'dashboard_live/summary'],
            ['Source 02', 'dashboard_live/transactions'],
            ['Source 03', 'gas_live/base'],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-[#eadfcf] bg-white p-4">
              <p className="reading-label">{label}</p>
              <p className="mt-3 text-lg font-semibold text-slate-900">{value}</p>
              <p className="mt-2 text-base leading-7 text-[#333333]">Realtime node consumed by the operator dashboard.</p>
            </div>
          ))}
        </div>
        <div className="rounded-[28px] border border-[#eadfcf] bg-[linear-gradient(180deg,#fff9ee,#fff)] p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="reading-label">Protocol throughput</p>
            <BarChart3 className="h-4 w-4 text-[#b3842f]" />
          </div>
          <svg viewBox="0 0 320 180" className="h-52 w-full">
            <defs>
              <linearGradient id="gold-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#e0b458" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#fff7e6" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M18 136 C58 126, 76 114, 108 100 S160 72, 188 82 S234 42, 302 28" fill="none" stroke="#c38b2c" strokeWidth="4" />
            <path d="M18 136 C58 126, 76 114, 108 100 S160 72, 188 82 S234 42, 302 28 L302 160 L18 160 Z" fill="url(#gold-fill)" />
            {[18, 90, 162, 234, 306].map((x) => (
              <line key={x} x1={x} x2={x} y1={20} y2={160} stroke="#efe3cc" strokeDasharray="4 6" />
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}

function TrustMapVisual() {
  return (
    <div className="rounded-[30px] border border-[#e6d8c2] bg-[linear-gradient(180deg,#fffef8,#faf2e4)] p-6 shadow-[0_28px_72px_rgba(111,86,44,0.08)]">
      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-[#eadfcf] bg-white/92 p-5">
          <Bot className="h-9 w-9 text-[#b3842f]" />
          <h4 className="mt-4 text-xl font-semibold text-slate-900">Agent systems</h4>
          <p className="mt-2 text-base leading-8 text-[#333333]">
            Propose actions, reason about opportunities, and wait for clear gateway responses.
          </p>
        </div>
        <div className="rounded-2xl border border-[#e5c980] bg-[#fff7e5] p-5">
          <Network className="h-9 w-9 text-[#b3842f]" />
          <h4 className="mt-4 text-xl font-semibold text-slate-900">UTG policy nexus</h4>
          <p className="mt-2 text-base leading-8 text-[#333333]">
            Identity, approvals, telemetry, and execution guarantees converge in the control layer.
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <Wallet className="h-9 w-9 text-emerald-700" />
          <h4 className="mt-4 text-xl font-semibold text-slate-900">Settlement rails</h4>
          <p className="mt-2 text-base leading-8 text-emerald-950">
            Funds move only after policy and approval boundaries are satisfied.
          </p>
        </div>
      </div>
      <div className="mt-5 flex items-center justify-center gap-3 text-xs font-mono uppercase tracking-[0.18em] text-[#6f4e17]">
        <span>Intent</span>
        <ArrowRight className="h-4 w-4" />
        <span>Review</span>
        <ArrowRight className="h-4 w-4" />
        <span>Execution</span>
      </div>
    </div>
  );
}

export default function ProtocolShowcase() {
  return (
    <section id="protocol-media" className="py-24">
      <div className="mx-auto max-w-7xl space-y-8 px-4 md:px-8">
        <div className="mb-10 text-center">
          <div className="light-eyebrow mb-6">Embedded product visuals</div>
          <h2 className="text-4xl font-semibold text-slate-900 md:text-5xl">
            Five more production scenes behind the hero slideshow
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-9 text-[#2b2b2b]">
            The landing page now carries the protocol story through concrete visual artifacts: layered safety, review flow, replay protection, live analytics, and settlement topology.
          </p>
        </div>

        <ShowcaseShell
          index="02"
          eyebrow="Safety Sandwich"
          title="A layered control model that blocks unsafe execution paths"
          description="Instead of trusting one giant switch, UTG spreads enforcement across request shaping, approval rules, and execution guarantees so a single failure cannot silently push money through."
        >
          <SafetyLayersVisual />
        </ShowcaseShell>

        <ShowcaseShell
          index="03"
          eyebrow="Human approval"
          title="Approval moments are treated as product-grade operating surfaces"
          description="When the gateway interrupts a request, the operator sees reasoning, policy context, and the final decision path in one composed review experience."
        >
          <ApprovalVisual />
        </ShowcaseShell>

        <ShowcaseShell
          index="04"
          eyebrow="Idempotency"
          title="Retries converge into one auditable settlement outcome"
          description="The gateway embraces real-world network flakiness without allowing repeated requests to become repeated charges."
        >
          <IdempotencyVisual />
        </ShowcaseShell>

        <ShowcaseShell
          index="05"
          eyebrow="Realtime operations"
          title="Lifecycle logs become live metrics, not stale dashboards"
          description="Operators can watch approvals, throughput, and transaction surfaces update from the same underlying protocol activity."
        >
          <RealtimeVisual />
        </ShowcaseShell>

        <ShowcaseShell
          index="06"
          eyebrow="Trust topology"
          title="Agents, controls, and settlement rails stay visibly separated"
          description="That separation is the product: automation stays fast, humans stay accountable, and wallets stay out of blind agent custody."
        >
          <TrustMapVisual />
        </ShowcaseShell>
      </div>
    </section>
  );
}
