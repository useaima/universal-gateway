import { Bot, ShieldCheck, Zap } from 'lucide-react';

export default function FeatureGrid() {
  return (
    <section id="features" className="py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-16 text-center">
          <div className="light-eyebrow mb-6">Core capabilities</div>
          <h2 className="text-4xl font-semibold text-slate-900 md:text-5xl">
            A control plane built for agentic transactions
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-500">
            The public story is light and legible, but the underlying posture stays rigorous: policy, transparency, and secure automation.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="light-card p-8">
            <Zap className="mb-6 h-10 w-10 text-[#c18b27]" />
            <h3 className="text-xl font-semibold text-slate-900">Proxy-less automation</h3>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              Agents propose actions directly through the gateway without handing over full wallet control or rewriting their execution logic.
            </p>
          </div>
          <div className="light-card p-8">
            <ShieldCheck className="mb-6 h-10 w-10 text-amber-600" />
            <h3 className="text-xl font-semibold text-slate-900">Safety Sandwich security</h3>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              Domain guardrails, deterministic idempotency, and approval interrupts work together to block unsafe execution paths before settlement.
            </p>
          </div>
          <div className="light-card p-8">
            <Bot className="mb-6 h-10 w-10 text-emerald-600" />
            <h3 className="text-xl font-semibold text-slate-900">Human-in-the-loop approvals</h3>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              High-risk actions pause into a reviewed signature step with agent reasoning, policy context, and a clean audit trail.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
