import { Key, Bot, Wallet, ArrowRight } from 'lucide-react';

export default function HowItWorks() {
  return (
    <section className="py-32 bg-brand-cream relative border-t border-brand-beige">
      <div className="max-w-6xl mx-auto px-8 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">How Aima UTG Works</h2>
          <p className="text-xl text-brand-muted max-w-2xl mx-auto font-medium">Three simple steps to give your AI agent access to global decentralized liquidity.</p>
        </div>

        <div className="space-y-24">
          {/* Step 1 */}
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 order-2 md:order-1">
              <div className="w-full aspect-video rounded-3xl bg-amber-50 border border-amber-200/50 flex flex-col items-center justify-center p-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <Key className="w-20 h-20 text-amber-500 mb-6 drop-shadow-md" />
                <div className="bg-white px-6 py-3 rounded-xl shadow-sm text-sm font-mono text-gray-600 border border-amber-100">
                  AIMA_API_KEY="sk_live_..."
                </div>
              </div>
            </div>
            <div className="flex-1 order-1 md:order-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 text-amber-600 font-black text-xl mb-6">1</div>
              <h3 className="text-3xl font-bold mb-4">Generate your Gateway Key</h3>
              <p className="text-brand-muted text-lg leading-relaxed">Sign up to the Aima platform and instantly generate your unique API credential. This key acts as the secure bridge between your AI framework and the blockchain.</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-gold/20 text-yellow-700 font-black text-xl mb-6">2</div>
              <h3 className="text-3xl font-bold mb-4">Connect the Agent</h3>
              <p className="text-brand-muted text-lg leading-relaxed">Pass the API key to your OpenClaw or LangChain agent. The agent instantly inherits the ability to propose EVM and SVM transactions programmatically.</p>
            </div>
            <div className="flex-1">
              <div className="w-full aspect-video rounded-3xl bg-brand-dark flex flex-col items-center justify-center p-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <Bot className="w-20 h-20 text-white mb-6" />
                <div className="bg-gray-800 px-6 py-3 rounded-xl text-sm font-mono text-green-400 border border-gray-700">
                  agent.execute(buy_token_intent)
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 order-2 md:order-1">
              <div className="w-full aspect-video rounded-3xl bg-brand-beige flex flex-col items-center justify-center p-8 shadow-2xl relative overflow-hidden group border border-white">
                <Wallet className="w-20 h-20 text-brand-dark mb-6" />
                <div className="flex items-center space-x-2 text-brand-dark font-bold text-lg bg-white/50 backdrop-blur-sm px-6 py-3 rounded-xl">
                  <span>Sign via MetaMask</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </div>
            <div className="flex-1 order-1 md:order-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white border border-gray-200 text-brand-dark font-black text-xl mb-6 shadow-sm">3</div>
              <h3 className="text-3xl font-bold mb-4">Biometric Approval</h3>
              <p className="text-brand-muted text-lg leading-relaxed">The agent cannot steal funds. Every transaction is physically halted by the Safety Sandwich until you biometrically approve it on your mobile device or browser wallet.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
