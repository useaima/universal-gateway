import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet, sepolia, base } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeatureGrid from './components/FeatureGrid';
import Footer from './components/Footer';

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
      <Navbar />
      <Hero />
      <FeatureGrid />
      <Footer />
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
