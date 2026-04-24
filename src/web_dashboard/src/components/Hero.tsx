import { Shield, ArrowRight } from 'lucide-react';

interface HeroProps {
  onOpenAuth: () => void;
}

export default function Hero({ onOpenAuth }: HeroProps) {
  return (
    <main className="flex-grow flex flex-col items-center justify-center text-center px-4 relative mt-20 mb-32">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-gold/20 rounded-full blur-[100px] -z-10"></div>
      
      <div className="inline-flex items-center space-x-2 bg-brand-beige px-4 py-2 rounded-full border border-brand-gold/30 mb-8 shadow-sm">
        <Shield className="w-4 h-4 text-brand-gold" />
        <span className="text-xs font-semibold tracking-widest text-brand-muted uppercase">The Biometric Firewall for AI Agents</span>
      </div>
      
      <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter mb-6 leading-tight max-w-4xl">
        Programmable <br/>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-yellow-600">Financial Execution.</span>
      </h1>
      
      <p className="text-lg md:text-xl text-brand-muted max-w-2xl mb-12 font-medium leading-relaxed">
        The Universal Transaction Gateway allows autonomous AI agents to legally interact with the global economy using real-time Web3 liquidity. No fiat rails. Zero custodial risk.
      </p>

      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 z-10">
        <button 
          onClick={onOpenAuth}
          className="bg-brand-dark text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-black transition-all shadow-xl hover:shadow-2xl flex items-center justify-center space-x-2 group"
        >
          <span>Get API Key</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
        <a href="/docs/index.html" className="bg-white text-brand-dark border border-gray-200 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all shadow-sm inline-block">
          Read the Docs
        </a>
      </div>
    </main>
  );
}
