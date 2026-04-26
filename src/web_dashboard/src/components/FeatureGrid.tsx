import { Bot, ShieldCheck, Zap } from 'lucide-react';

export default function FeatureGrid() {
  return (
    <section id="features" className="py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-16 text-center">
          <div className="eyebrow mb-6">Core capabilities</div>
          <h2 className="text-4xl font-semibold text-white md:text-5xl">A control plane built for agentic transactions</h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-defi-muted">
            We keep the experience readable and premium, but the underlying story stays rigorous: policy, transparency, and secure automation.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="section-panel group p-8 transition duration-200 hover:-translate-y-0.5">
            <Zap className="mb-6 h-10 w-10 text-defi-goldBright" />
            <h3 className="text-xl font-semibold text-white">Proxy-less automation</h3>
            <p className="mt-3 text-sm leading-7 text-defi-muted">Agents propose actions directly through the gateway without handing over full wallet control or rewriting their execution logic.</p>
          </div>
          <div className="section-panel group p-8 transition duration-200 hover:-translate-y-0.5">
            <ShieldCheck className="mb-6 h-10 w-10 text-defi-amber" />
            <h3 className="text-xl font-semibold text-white">Safety Sandwich security</h3>
            <p className="mt-3 text-sm leading-7 text-defi-muted">Domain guardrails, deterministic idempotency, and approval interrupts work together to block unsafe execution paths before settlement.</p>
          </div>
          <div id="developers" className="section-panel group p-8 transition duration-200 hover:-translate-y-0.5">
            <Bot className="mb-6 h-10 w-10 text-defi-emerald" />
            <h3 className="text-xl font-semibold text-white">Human-in-the-loop approvals</h3>
            <p className="mt-3 text-sm leading-7 text-defi-muted">High-risk actions pause into a reviewed signature step with agent reasoning, policy context, and a clean audit trail.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
