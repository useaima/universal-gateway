import { ArrowRight, Bot, Key, Wallet, CreditCard } from 'lucide-react';

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-20 text-center">
          <div className="light-eyebrow mb-6">Operational flow</div>
          <h2 className="text-4xl font-semibold text-slate-900 md:text-5xl">
            Base-native automation in four controlled stages
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
              <h3 className="mt-3 text-2xl font-semibold text-slate-900">Start from a wallet-led operator identity</h3>
            </div>
            <p className="text-base leading-8 text-slate-600">
              Inside the Base App, operators should stay in a wallet-native sign-in flow. Outside it, the same app can still fall back to Google or email without fragmenting the backend profile.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="light-card p-8">
              <Wallet className="mb-6 h-10 w-10 text-[#c18b27]" />
              <h3 className="text-xl font-semibold text-slate-900">Use Sign in with Base first</h3>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                The preferred path keeps the operator in the Base App, gets a wallet signature, and resumes the same Firestore and RTDB-backed account state.
              </p>
            </div>

            <div className="light-card p-8">
              <Bot className="mb-6 h-10 w-10 text-amber-600" />
              <h3 className="text-xl font-semibold text-slate-900">Bind policy, chains, and runtime</h3>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                Onboarding records the execution engine, daily safety limit, and the current chain model: Base and Ethereum executable, Bitcoin and Solana read-only.
              </p>
            </div>

            <div className="light-card p-8">
              <CreditCard className="mb-6 h-10 w-10 text-emerald-600" />
              <h3 className="text-xl font-semibold text-slate-900">Accept Base payments immediately</h3>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                Base Pay covers operator bootstrap and user-facing USDC payments, while x402 remains available for agent-to-agent paid requests.
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
