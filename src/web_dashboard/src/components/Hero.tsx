import { ArrowRight, Shield, Sparkles } from 'lucide-react';

interface HeroProps {
  onOpenAuth: () => void;
}

export default function Hero({ onOpenAuth }: HeroProps) {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-grow flex-col items-center px-4 pb-24 pt-16 text-center md:px-8 md:pt-24">
      <div className="absolute inset-x-0 top-28 h-80 bg-[radial-gradient(circle,rgba(207,169,93,0.16),transparent_62%)] blur-3xl" />

      <div className="eyebrow mb-8">
        <Shield className="h-4 w-4 text-defi-goldBright" />
        Autonomous Finance with Human-Controlled Settlement
      </div>

      <h1 className="max-w-5xl text-5xl font-semibold leading-[0.95] text-white md:text-7xl xl:text-[5.5rem]">
        The Autonomous
        <br />
        <span className="bg-[linear-gradient(135deg,#f7edd8_10%,#f1cc7a_45%,#cfa95d_90%)] bg-clip-text text-transparent">
          Transaction Gateway
        </span>
      </h1>

      <p className="mt-8 max-w-3xl text-base leading-8 text-defi-muted md:text-xl">
        Aima Protocol bridges Web2 AI agents and Web3 execution rails with strict domain controls,
        human-in-the-loop approvals, and a security posture designed for institutional trust.
      </p>

      <div className="z-10 mb-16 mt-10 flex flex-col gap-4 sm:flex-row">
        <button
          onClick={onOpenAuth}
          className="button-primary px-8 py-4 text-base"
        >
          <span>Launch App</span>
          <ArrowRight className="h-5 w-5" />
        </button>
        <a href="/docs/index.html" className="button-secondary px-8 py-4 text-sm font-mono">
          Read Docs
        </a>
      </div>

      <div className="section-panel relative z-10 w-full overflow-hidden p-6 md:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="text-left">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="metric-card">
                <p className="text-xs font-mono uppercase tracking-[0.22em] text-defi-muted">Approvals</p>
                <p className="mt-4 text-3xl font-semibold text-white">HITL</p>
                <p className="mt-2 text-sm text-defi-muted">Threshold-based signature enforcement</p>
              </div>
              <div className="metric-card">
                <p className="text-xs font-mono uppercase tracking-[0.22em] text-defi-muted">Security</p>
                <p className="mt-4 text-3xl font-semibold text-white">CP-first</p>
                <p className="mt-2 text-sm text-defi-muted">Deterministic replay protection and guardrails</p>
              </div>
              <div className="metric-card">
                <p className="text-xs font-mono uppercase tracking-[0.22em] text-defi-muted">Execution</p>
                <p className="mt-4 text-3xl font-semibold text-white">Multi-rail</p>
                <p className="mt-2 text-sm text-defi-muted">EVM, settlement policy, and agent auditability</p>
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-defi-border bg-black/20 p-5">
              <div className="mb-3 flex items-center gap-2 text-defi-goldBright">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-mono uppercase tracking-[0.22em]">Safety Sandwich</span>
              </div>
              <p className="max-w-2xl text-sm leading-7 text-defi-cream">
                AI agents propose. Aima validates. Policy interrupts high-risk actions. The human signs only when the protocol decides manual confirmation is warranted.
              </p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-defi-border bg-[radial-gradient(circle_at_top,rgba(207,169,93,0.14),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] p-5">
            <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.08),transparent)] opacity-70" />
            <img
              src="/hero_illustration.png"
              alt="Aima Protocol Decentralized Network"
              className="relative w-full rounded-[1.5rem] border border-defi-border object-cover shadow-[0_26px_60px_rgba(0,0,0,0.4)] animate-float-soft"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
