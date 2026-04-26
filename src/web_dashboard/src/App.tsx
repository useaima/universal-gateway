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
import RegistrationFlow from './components/RegistrationFlow';
import Dashboard from './components/Dashboard';
import Onboarding from './components/Onboarding';
import { useState } from 'react';

// Use a valid format projectId or pull from env
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '11111111111111111111111111111111';

const config = getDefaultConfig({
  appName: 'Aima UTG',
  projectId: projectId,
  chains: [mainnet, sepolia, base],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [base.id]: http(),
  },
});

const queryClient = new QueryClient();

function LandingPage({ onLoginSuccess }: { onLoginSuccess: (email: string) => void }) {
  return (
    <div className="page-shell min-h-screen flex flex-col font-sans">
      <Navbar />
      <Hero onOpenAuth={() => onLoginSuccess("trigger")} />
      <HowItWorks />
      <FeatureGrid />
      <Testimonials />
      <Footer />
    </div>
  );
}

export default function App() {
  const [showRegistration, setShowRegistration] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const handleStartRegistration = () => {
    setShowRegistration(true);
  };

  const handleRegistrationComplete = (email: string) => {
    setUserEmail(email);
    setIsAuthenticated(true);
    setShowRegistration(false);
  };

  const handleOnboardingComplete = () => {
    setIsOnboarded(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsOnboarded(false);
    setShowRegistration(false);
    setUserEmail("");
  };

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {isAuthenticated ? (
            isOnboarded ? (
              <Dashboard onLogout={handleLogout} userEmail={userEmail} />
            ) : (
              <Onboarding userEmail={userEmail} onComplete={handleOnboardingComplete} />
            )
          ) : showRegistration ? (
            <RegistrationFlow onRegistrationComplete={handleRegistrationComplete} />
          ) : (
            <LandingPage onLoginSuccess={handleStartRegistration} />
          )}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
