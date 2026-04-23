import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet, sepolia, base } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, ConnectButton, getDefaultConfig } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { Shield, Brain, ArrowRight, Zap, Code, ShieldCheck } from 'lucide-react';

const config = getDefaultConfig({
  appName: 'Aima UTG',
  projectId: 'aima_utg_project_id', // Placeholder for WalletConnect Cloud
  chains: [mainnet, sepolia, base],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [base.id]: http(),
  },
});

const queryClient = new QueryClient();

function LandingPage() {
  return (
    <div className="min-h-screen bg-brand-cream text-brand-dark flex flex-col font-sans">
      <header className="w-full px-8 py-6 flex justify-between items-center z-10 glass-panel sticky top-0 rounded-none border-t-0 border-x-0">
        <div className="flex items-center space-x-3">
          <Brain className="w-8 h-8 text-brand-gold" />
          <span className="text-2xl font-bold tracking-tight">Aima UTG</span>
        </div>
        <nav className="hidden md:flex space-x-8 text-sm font-semibold tracking-wide text-brand-muted">
          <a href="#features" className="hover:text-brand-dark transition-colors">Features</a>
          <a href="#developers" className="hover:text-brand-dark transition-colors">Developers</a>
          <a href="#docs" className="hover:text-brand-dark transition-colors">Documentation</a>
        </nav>
        <div className="flex items-center space-x-4">
           {/* RainbowKit Connect Button acts as Web3 Login */}
           <ConnectButton />
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center text-center px-4 relative mt-20">
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
          <button className="bg-brand-dark text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-black transition-all shadow-xl hover:shadow-2xl flex items-center justify-center space-x-2 group">
            <span>Get API Key</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="bg-white text-brand-dark border border-gray-200 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all shadow-sm">
            Read the Docs
          </button>
        </div>
      </main>

      <section id="features" className="py-24 bg-white mt-32">
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

      <footer className="w-full py-12 border-t border-brand-beige text-center bg-brand-cream">
        <p className="text-sm font-semibold text-brand-muted">© 2026 Engineering at Aima. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <LandingPage />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
