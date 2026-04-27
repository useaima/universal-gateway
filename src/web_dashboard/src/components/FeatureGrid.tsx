import { Bot, ShieldCheck, Zap } from 'lucide-react';

export default function FeatureGrid() {
  return (
    <section id="features" className="py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-16 text-center">
          <div className="light-eyebrow mb-6">Core capabilities</div>
          <h2 className="text-4xl font-semibold text-slate-900 md:text-5xl">
            A control plane built for real operator trust
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-500">
            The shape is simple on purpose: a stable MCP gateway, explicit support tiers, and a runtime that refuses to pretend missing providers are already wired.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="light-card p-8">
            <Zap className="mb-6 h-10 w-10 text-[#c18b27]" />
            <h3 className="text-xl font-semibold text-slate-900">Stable MCP execution</h3>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              Agents call the gateway instead of raw wallet APIs, and the stable path stays focused on Base and Ethereum transfers with retry-safe execution.
            </p>
          </div>
          <div className="light-card p-8">
            <ShieldCheck className="mb-6 h-10 w-10 text-amber-600" />
            <h3 className="text-xl font-semibold text-slate-900">Always-on HITL security</h3>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              Domain guardrails, deterministic idempotency, and approval interrupts work together so the operator stays in control of every risky transition.
            </p>
          </div>
          <div className="light-card p-8">
            <Bot className="mb-6 h-10 w-10 text-emerald-600" />
            <h3 className="text-xl font-semibold text-slate-900">Truthful maturity labels</h3>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              Stable, beta, and experimental capabilities are labeled clearly so operators know which flows are ready for real users and which still need provider wiring.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
