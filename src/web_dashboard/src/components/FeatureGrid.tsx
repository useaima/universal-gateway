import { Zap, ShieldCheck, Code } from 'lucide-react';

export default function FeatureGrid() {
  return (
    <section id="features" className="py-24 bg-defi-dark border-t border-defi-border">
      <div className="max-w-6xl mx-auto px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-white">Engineering over Finance</h2>
          <p className="text-defi-muted max-w-xl mx-auto font-mono text-sm">Built purely on decentralized primitives to ensure borderless, ungovernable agent execution.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="glass-panel p-8 hover:-translate-y-1 transition-transform bg-defi-surface/60 hover:bg-defi-surface border-defi-border hover:border-defi-accent/50 group">
            <Zap className="w-10 h-10 text-defi-accent mb-6 group-hover:drop-shadow-[0_0_10px_rgba(139,92,246,0.8)] transition-all" />
            <h3 className="text-xl font-bold mb-3 text-gray-100">Dynamic Agent Billing</h3>
            <p className="text-defi-muted text-sm leading-relaxed">Agents run on a Pay-As-You-Go spread algorithm. The Protocol intercepts transactions and routes pool fees automatically via EVM smart execution.</p>
          </div>
          <div className="glass-panel p-8 hover:-translate-y-1 transition-transform bg-defi-surface/60 hover:bg-defi-surface border-defi-border hover:border-defi-accent/50 group">
            <ShieldCheck className="w-10 h-10 text-defi-accent mb-6 group-hover:drop-shadow-[0_0_10px_rgba(139,92,246,0.8)] transition-all" />
            <h3 className="text-xl font-bold mb-3 text-gray-100">Cryptographic Firewall</h3>
            <p className="text-defi-muted text-sm leading-relaxed">Agents propose intent. The Smart Contract halts execution until the human vault owner provides biometric or MPC consensus.</p>
          </div>
          <div className="glass-panel p-8 hover:-translate-y-1 transition-transform bg-defi-surface/60 hover:bg-defi-surface border-defi-border hover:border-defi-accent/50 group">
            <Code className="w-10 h-10 text-defi-accent mb-6 group-hover:drop-shadow-[0_0_10px_rgba(139,92,246,0.8)] transition-all" />
            <h3 className="text-xl font-bold mb-3 text-gray-100">Multi-Chain Agnostic</h3>
            <p className="text-defi-muted text-sm leading-relaxed">Native RPC routing for Ethereum, Arbitrum, and Base. Write one agent intent, settle liquidity on any EVM chain.</p>
          </div>
        </div>

      </div>
    </section>
  );
}
