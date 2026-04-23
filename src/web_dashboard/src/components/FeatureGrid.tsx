import { Zap, ShieldCheck, Code } from 'lucide-react';

export default function FeatureGrid() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Engineering over Finance</h2>
          <p className="text-brand-muted max-w-xl mx-auto">Built purely on decentralized primitives to ensure borderless, ungovernable agent execution.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="glass-panel p-8 bg-brand-cream/30 border-brand-beige border hover:-translate-y-1 transition-transform">
            <Zap className="w-10 h-10 text-brand-gold mb-6" />
            <h3 className="text-xl font-bold mb-3">Dynamic Agent Billing</h3>
            <p className="text-brand-muted text-sm leading-relaxed">Agents run on a Pay-As-You-Go spread algorithm. The UTG intercepts transactions and routes platform fees automatically via EVM smart execution.</p>
          </div>
          <div className="glass-panel p-8 bg-brand-cream/30 border-brand-beige border hover:-translate-y-1 transition-transform">
            <ShieldCheck className="w-10 h-10 text-brand-gold mb-6" />
            <h3 className="text-xl font-bold mb-3">Human-In-The-Loop</h3>
            <p className="text-brand-muted text-sm leading-relaxed">Agents propose transactions. The Gateway physically halts execution until the human provides biometric or MPC consensus.</p>
          </div>
          <div className="glass-panel p-8 bg-brand-cream/30 border-brand-beige border hover:-translate-y-1 transition-transform">
            <Code className="w-10 h-10 text-brand-gold mb-6" />
            <h3 className="text-xl font-bold mb-3">Multi-Chain Agnostic</h3>
            <p className="text-brand-muted text-sm leading-relaxed">Native RPC routing for Ethereum, Solana, and Bitcoin architectures. Write one OpenClaw agent, execute on any chain.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
