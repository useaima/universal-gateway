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
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-9 text-[#2b2b2b]">
            The protocol stays programmable while wallet identity, payment rails, approval boundaries, and audit evidence remain explicit.
          </p>
        </div>

        <div className="space-y-10">
          <div className="light-panel grid gap-6 p-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center group hover:shadow-[0_40px_100px_rgba(94,62,12,0.12)] transition-shadow">
            <div className="rounded-[26px] border border-[#eadfcf] bg-[#fff8ea] p-6 overflow-hidden relative">
              <div className="absolute inset-0 opacity-20 mix-blend-overlay">
                <img src="/assets/videos/mcp_connection.webp" alt="MCP Connection Animation" className="w-full h-full object-cover scale-150 group-hover:scale-100 transition-transform duration-1000" />
              </div>
              <div className="relative z-10">
                <Key className="mb-5 h-12 w-12 text-[#b78730]" />
                <p className="reading-label">Step 01</p>
                <h3 className="mt-3 text-2xl font-semibold text-slate-900">Connect an MCP client to the gateway first</h3>
              </div>
            </div>
            <p className="text-lg leading-9 text-[#242424]">
              The release path is intentionally simple: run the gateway, connect OpenClaw or another MCP client, and let the gateway own the settlement boundary instead of wiring the model directly to a wallet.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="light-card p-8 relative overflow-hidden group">
              <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-[radial-gradient(circle,rgba(193,139,39,0.1)_0%,transparent_70%)] group-hover:scale-150 transition-transform duration-700"></div>
              <Wallet className="mb-6 h-10 w-10 text-[#c18b27] relative z-10" />
              <h3 className="text-xl font-semibold text-slate-900 relative z-10">Keep execution on the stable rails</h3>
              <p className="mt-3 text-base leading-8 text-[#333333] relative z-10">
                Base and Ethereum are the first-class execution rails. Bitcoin and Solana remain visible in the operator surface without being presented as writable settlement paths.
              </p>
            </div>

            <div className="light-card p-8 relative overflow-hidden group">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
                <img src="/assets/videos/x402_challenge.webp" alt="x402 protocol background" className="w-full h-full object-cover" />
              </div>
              <Bot className="mb-6 h-10 w-10 text-amber-600 relative z-10" />
              <h3 className="text-xl font-semibold text-slate-900 relative z-10">Let HITL own every risky transition</h3>
              <p className="mt-3 text-base leading-8 text-[#333333] relative z-10">
                The agent can ask for actions, but the gateway decides when the operator must intervene. That is true whether the operator is approving from a TUI, Telegram, or another chat surface.
              </p>
            </div>

            <div className="light-card p-8 relative overflow-hidden group">
              <div className="absolute -left-10 -top-10 w-48 h-48 rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.1)_0%,transparent_70%)] group-hover:scale-150 transition-transform duration-700"></div>
              <ShieldCheck className="mb-6 h-10 w-10 text-emerald-600 relative z-10" />
              <h3 className="text-xl font-semibold text-slate-900 relative z-10">Tell the truth about maturity</h3>
              <p className="mt-3 text-base leading-8 text-[#333333] relative z-10">
                Commerce stays beta until a provider is configured. M-Pesa stays experimental until callback signing and webhooks are real. The gateway now says that plainly.
              </p>
            </div>
          </div>

          <div className="light-panel grid gap-8 p-8 lg:grid-cols-[1.12fr_0.88fr] lg:items-center hover:shadow-[0_40px_100px_rgba(94,62,12,0.12)] transition-shadow">
            <div>
              <p className="reading-label">Realtime operations</p>
              <h3 className="mt-3 text-3xl font-semibold text-slate-900">
                Dashboard metrics stream from the gateway&apos;s transaction lifecycle.
              </h3>
              <p className="mt-4 text-lg leading-9 text-[#242424]">
                Pending approvals originate from the HITL transaction log, while settled execution states, gas snapshots, and observer-backed balance records are republished into Firebase for the live dashboard.
              </p>
            </div>
            <div className="rounded-[26px] border border-[#eadfcf] bg-white/92 p-6 overflow-hidden relative group">
              <div className="absolute inset-0 opacity-10 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-25 pointer-events-none">
                <img src="/assets/videos/secure_telemetry.webp" alt="Secure Telemetry Animation" className="w-full h-full object-cover" />
              </div>
              <div className="rounded-2xl border border-[#eadfcf] bg-[#fff8ea]/90 backdrop-blur-sm p-4 relative z-10">
                <p className="reading-label">Lifecycle sync</p>
                <div className="mt-4 grid gap-3 text-[15px] text-[#2f2f2f]">
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
