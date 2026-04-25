import { Key, Bot, Wallet, ArrowRight } from 'lucide-react';

export default function HowItWorks() {
  return (
    <section className="py-32 bg-defi-dark relative border-t border-defi-border">
      <div className="max-w-6xl mx-auto px-8 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight text-white">How Aima Protocol Works</h2>
          <p className="text-xl text-defi-muted max-w-2xl mx-auto font-mono">Three simple steps to give your AI agent access to global decentralized liquidity.</p>
        </div>

        <div className="space-y-24">
          {/* Step 1 */}
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 order-2 md:order-1">
              <div className="w-full aspect-video rounded-3xl bg-defi-surface border border-defi-border flex flex-col items-center justify-center p-8 shadow-[0_0_30px_rgba(139,92,246,0.1)] relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-defi-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <Key className="w-20 h-20 text-defi-accent mb-6 drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
                <div className="bg-defi-dark px-6 py-3 rounded-xl shadow-sm text-sm font-mono text-gray-300 border border-defi-border">
                  AIMA_API_KEY="sk_live_..."
                </div>
              </div>
            </div>
            <div className="flex-1 order-1 md:order-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-defi-accent/20 text-defi-accent font-black text-xl mb-6 shadow-[0_0_10px_rgba(139,92,246,0.3)]">1</div>
              <h3 className="text-3xl font-bold mb-4 text-white">Generate your Secure Key</h3>
              <p className="text-defi-muted text-lg leading-relaxed">Initialize your secure enclave to generate a unique cryptographic credential. This key acts as the secure bridge between your AI framework and the blockchain.</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-defi-emerald/20 text-defi-emerald font-black text-xl mb-6 shadow-[0_0_10px_rgba(16,185,129,0.3)]">2</div>
              <h3 className="text-3xl font-bold mb-4 text-white">Connect the Agent</h3>
              <p className="text-defi-muted text-lg leading-relaxed">Pass the API key to your OpenClaw or ElizaOS agent. The agent instantly inherits the ability to propose EVM and SVM transactions programmatically.</p>
            </div>
            <div className="flex-1">
              <div className="w-full aspect-video rounded-3xl bg-defi-surface border border-defi-border flex flex-col items-center justify-center p-8 shadow-[0_0_30px_rgba(16,185,129,0.1)] relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-defi-emerald/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <Bot className="w-20 h-20 text-defi-emerald mb-6 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                <div className="bg-defi-dark px-6 py-3 rounded-xl text-sm font-mono text-green-400 border border-defi-border">
                  agent.execute(buy_token_intent)
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 order-2 md:order-1">
              <div className="w-full aspect-video rounded-3xl bg-defi-surface border border-defi-border flex flex-col items-center justify-center p-8 shadow-[0_0_30px_rgba(59,130,246,0.1)] relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <Wallet className="w-20 h-20 text-blue-500 mb-6 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                <div className="flex items-center space-x-2 text-white font-mono text-sm bg-defi-dark px-6 py-3 rounded-xl border border-blue-500/30">
                  <span>Sign intent via Wallet</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
            <div className="flex-1 order-1 md:order-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 font-black text-xl mb-6 shadow-[0_0_10px_rgba(59,130,246,0.3)]">3</div>
              <h3 className="text-3xl font-bold mb-4 text-white">Biometric Approval</h3>
              <p className="text-defi-muted text-lg leading-relaxed">The agent cannot drain liquidity. Every transaction intent is halted by the Smart Contract Guardrails until you biometrically sign it via your Web3 wallet.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
