import { WagmiProvider, http } from 'wagmi';
import { mainnet, sepolia, base } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeatureGrid from './components/FeatureGrid';
import Footer from './components/Footer';
import HowItWorks from './components/HowItWorks';
import Testimonials from './components/Testimonials';
import AuthModal from './components/AuthModal';
import { useState } from 'react';

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
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <div className="min-h-screen bg-brand-cream text-brand-dark flex flex-col font-sans">
      <Navbar />
      <Hero onOpenAuth={() => setIsAuthOpen(true)} />
      <HowItWorks />
      <FeatureGrid />
      <Testimonials />
      <Footer />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
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
