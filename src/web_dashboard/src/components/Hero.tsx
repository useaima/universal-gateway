import { Shield, ArrowRight } from 'lucide-react';

interface HeroProps {
  onOpenAuth: () => void;
}

export default function Hero({ onOpenAuth }: HeroProps) {
  return (
    <main className="flex-grow flex flex-col items-center justify-center text-center px-4 relative mt-20 mb-32">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-defi-accent/20 rounded-full blur-[120px] -z-10 animate-glow-pulse"></div>
      
      <div className="inline-flex items-center space-x-2 bg-defi-surface/80 px-4 py-2 rounded-full border border-defi-accent/30 mb-8 shadow-[0_0_10px_rgba(139,92,246,0.2)]">
        <Shield className="w-4 h-4 text-defi-accent" />
        <span className="text-xs font-mono font-semibold tracking-widest text-gray-300 uppercase">Decentralized Biometric Enclave</span>
      </div>
      
      <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter mb-6 leading-tight max-w-4xl text-white">
        Programmable <br/>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-defi-accent to-defi-emerald drop-shadow-sm">Liquidity Execution.</span>
      </h1>
      
      <p className="text-lg md:text-xl text-defi-muted max-w-2xl mb-12 font-medium leading-relaxed">
        The Aima Protocol allows autonomous AI agents to interact securely with the global decentralized economy. Non-custodial. Cryptographically verified.
      </p>

      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 z-10 mb-16">
        <button 
          onClick={onOpenAuth}
          className="bg-defi-accent text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-violet-500 transition-all shadow-[0_0_20px_rgba(139,92,246,0.4)] flex items-center justify-center space-x-2 group"
        >
          <span>Connect Vault</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
        <a href="/docs/index.html" className="bg-defi-surface text-gray-200 border border-defi-border px-8 py-4 rounded-xl font-mono text-sm hover:bg-defi-surfaceHover transition-all shadow-sm inline-flex items-center justify-center">
          Read Whitepaper
        </a>
      </div>

      <div className="w-full max-w-5xl mx-auto z-10 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-defi-dark via-transparent to-transparent z-10"></div>
        <img 
          src="/hero_illustration.png" 
          alt="Aima Protocol Decentralized Network" 
          className="w-full h-auto object-cover rounded-2xl border border-defi-border shadow-[0_0_50px_rgba(139,92,246,0.15)] animate-glow-pulse"
        />
      </div>
    </main>
  );
}
