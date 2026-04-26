import { Key, Bot, Wallet, ArrowRight } from 'lucide-react';

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-20 text-center">
          <div className="eyebrow mb-6">Operational flow</div>
          <h2 className="text-4xl font-semibold text-white md:text-5xl">Secure automation in three controlled steps</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-defi-muted">
            The protocol keeps execution programmable while making approval boundaries and audit trails explicit.
          </p>
        </div>

        <div className="space-y-24">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 order-2 md:order-1">
              <div className="section-panel relative flex aspect-video w-full flex-col items-center justify-center overflow-hidden p-8">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(207,169,93,0.18),transparent_45%)]" />
                <Key className="mb-6 h-20 w-20 text-defi-goldBright" />
                <div className="rounded-xl border border-defi-border bg-black/25 px-6 py-3 text-sm font-mono text-gray-300">
                  AIMA_API_KEY="sk_live_..."
                </div>
              </div>
            </div>
            <div className="flex-1 order-1 md:order-2">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full border border-defi-gold/30 bg-defi-gold/10 text-xl font-black text-defi-goldBright">1</div>
              <h3 className="text-3xl font-semibold text-white">Generate your secure gateway key</h3>
              <p className="mt-4 text-lg leading-8 text-defi-muted">Initialize the protocol and issue a dedicated key that becomes the policy-controlled bridge between your agent runtime and execution rails.</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full border border-defi-emerald/30 bg-defi-emerald/10 text-xl font-black text-defi-emerald">2</div>
              <h3 className="text-3xl font-semibold text-white">Connect the agent runtime</h3>
              <p className="mt-4 text-lg leading-8 text-defi-muted">Pass the issued key into your OpenClaw, LangChain, or custom workflow. The agent can now propose transactions without holding custodial secrets.</p>
            </div>
            <div className="flex-1">
              <div className="section-panel relative flex aspect-video w-full flex-col items-center justify-center overflow-hidden p-8">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.15),transparent_45%)]" />
                <Bot className="mb-6 h-20 w-20 text-defi-emerald" />
                <div className="rounded-xl border border-defi-border bg-black/25 px-6 py-3 text-sm font-mono text-green-400">
                  agent.execute(buy_token_intent)
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 order-2 md:order-1">
              <div className="section-panel relative flex aspect-video w-full flex-col items-center justify-center overflow-hidden p-8">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.15),transparent_45%)]" />
                <Wallet className="mb-6 h-20 w-20 text-defi-amber" />
                <div className="flex items-center space-x-2 rounded-xl border border-defi-amber/30 bg-black/25 px-6 py-3 text-sm font-mono text-white">
                  <span>Sign intent via Wallet</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>
            <div className="flex-1 order-1 md:order-2">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full border border-defi-amber/30 bg-defi-amber/10 text-xl font-black text-defi-amber">3</div>
              <h3 className="text-3xl font-semibold text-white">Approve only when risk policy says so</h3>
              <p className="mt-4 text-lg leading-8 text-defi-muted">When a transaction crosses defined limits, Aima interrupts the flow and routes it into a controlled signing step instead of silently executing it.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
