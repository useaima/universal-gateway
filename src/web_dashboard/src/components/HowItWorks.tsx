import { ArrowRight, Bot, Key, ShieldCheck, Wallet } from 'lucide-react';

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-20 text-center">
          <div className="light-eyebrow mb-6">Operational flow</div>
          <h2 className="text-4xl font-semibold text-slate-900 md:text-5xl">
            MCP-first automation in four controlled stages
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-500">
            The protocol stays programmable while wallet identity, payment rails, approval boundaries, and audit evidence remain explicit.
          </p>
        </div>

        <div className="space-y-10">
          <div className="light-panel grid gap-6 p-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div className="rounded-[26px] border border-[#eadfcf] bg-[#fff8ea] p-6">
              <Key className="mb-5 h-12 w-12 text-[#b78730]" />
              <p className="text-xs font-mono uppercase tracking-[0.22em] text-[#9a8357]">Step 01</p>
              <h3 className="mt-3 text-2xl font-semibold text-slate-900">Connect an MCP client to the gateway first</h3>
            </div>
            <p className="text-base leading-8 text-slate-600">
              The release path is intentionally simple: run the gateway, connect OpenClaw or another MCP client, and let the gateway own the settlement boundary instead of wiring the model directly to a wallet.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="light-card p-8">
              <Wallet className="mb-6 h-10 w-10 text-[#c18b27]" />
              <h3 className="text-xl font-semibold text-slate-900">Keep execution on the stable rails</h3>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                Base and Ethereum are the first-class execution rails. Bitcoin and Solana remain visible in the operator surface without being presented as writable settlement paths.
              </p>
            </div>

            <div className="light-card p-8">
              <Bot className="mb-6 h-10 w-10 text-amber-600" />
              <h3 className="text-xl font-semibold text-slate-900">Let HITL own every risky transition</h3>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                The agent can ask for actions, but the gateway decides when the operator must intervene. That is true whether the operator is approving from a TUI, Telegram, or another chat surface.
              </p>
            </div>

            <div className="light-card p-8">
              <ShieldCheck className="mb-6 h-10 w-10 text-emerald-600" />
              <h3 className="text-xl font-semibold text-slate-900">Tell the truth about maturity</h3>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                Commerce stays beta until a provider is configured. M-Pesa stays experimental until callback signing and webhooks are real. The gateway now says that plainly.
              </p>
            </div>
          </div>

          <div className="light-panel grid gap-8 p-8 lg:grid-cols-[1.12fr_0.88fr] lg:items-center">
            <div>
              <p className="text-xs font-mono uppercase tracking-[0.22em] text-[#9a8357]">Realtime operations</p>
              <h3 className="mt-3 text-3xl font-semibold text-slate-900">
                Dashboard metrics stream from the gateway&apos;s transaction lifecycle.
              </h3>
              <p className="mt-4 text-base leading-8 text-slate-600">
                Pending approvals originate from the HITL transaction log, while settled execution states, gas snapshots, and observer-backed balance records are republished into Firebase for the live dashboard.
              </p>
            </div>
            <div className="rounded-[26px] border border-[#eadfcf] bg-white/92 p-6">
              <div className="rounded-2xl border border-[#eadfcf] bg-[#fff8ea] p-4">
                <p className="text-xs font-mono uppercase tracking-[0.22em] text-[#9a8357]">Lifecycle sync</p>
                <div className="mt-4 grid gap-3 text-sm text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>SQLite gateway records</span>
                    <ArrowRight className="h-4 w-4 text-[#b78730]" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>RTDB live trees</span>
                    <ArrowRight className="h-4 w-4 text-[#b78730]" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Overview + Portfolio + Transactions</span>
                    <ArrowRight className="h-4 w-4 text-[#b78730]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
