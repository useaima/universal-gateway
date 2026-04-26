import { useState, useEffect } from 'react';
import { Wallet, CheckCircle, ArrowRight, ShieldCheck, Box, Network, CreditCard } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { auth, db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

interface OnboardingProps {
  userEmail: string;
  onComplete: () => void;
}

export default function Onboarding({ userEmail, onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Wagmi hook to detect when wallet is connected
  const { isConnected, address } = useAccount();

  // Onboarding States
  const [framework, setFramework] = useState<string>('');
  const [safetyLimit, setSafetyLimit] = useState<string>('100');
  const [networks, setNetworks] = useState<string[]>([]);
  const walletLinked = step === 1 && isConnected && !!address;

  useEffect(() => {
    if (walletLinked) {
      const timer = setTimeout(() => setStep(2), 1500);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [walletLinked]);

  const toggleNetwork = (net: string) => {
    setNetworks(prev => 
      prev.includes(net) ? prev.filter(n => n !== net) : [...prev, net]
    );
  };

  const finalizeOnboarding = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (auth.currentUser && address) {
        const onboardingPayload: Record<string, unknown> = {
          walletAddress: address,
          agentFramework: framework,
          dailySafetyLimit: Number(safetyLimit),
          authorizedNetworks: networks,
          onboardedAt: new Date().toISOString(),
          onboardingCompletedAt: new Date().toISOString(),
          billingModel: "pay-as-you-go"
        };

        if (auth.currentUser.phoneNumber) {
          onboardingPayload.phoneNumber = auth.currentUser.phoneNumber;
          onboardingPayload.phoneVerifiedAt = new Date().toISOString();
        }

        await setDoc(doc(db, "users", auth.currentUser.uid), {
          ...onboardingPayload
        }, { merge: true });
        
        setIsLoading(false);
        onComplete();
      } else {
        throw new Error("Missing user session or wallet address.");
      }
    } catch (err: unknown) {
      console.error("Failed to save configuration:", err);
      setError(err instanceof Error ? err.message : "Failed to save configuration.");
      setIsLoading(false);
    }
  };

  const steps = [
    { num: 1, title: "Vault Wallet" },
    { num: 2, title: "AI Agent" },
    { num: 3, title: "Safety Limits" },
    { num: 4, title: "Networks" },
    { num: 5, title: "Billing" }
  ];

  return (
    <div className="dark-shell flex min-h-screen items-center justify-center px-4 py-12 text-gray-200 font-sans">
      <div className="section-panel max-w-2xl w-full p-10">
        
        <div className="text-center mb-10">
          <ShieldCheck className="mx-auto mb-4 h-16 w-16 text-defi-emerald" />
          <h1 className="mb-2 text-3xl font-semibold text-white">Protocol Configuration</h1>
          <p className="text-sm font-mono text-defi-muted">Set up your Smart Contract parameters.</p>
          <p className="mt-2 text-xs font-mono uppercase tracking-[0.2em] text-defi-beige">{userEmail}</p>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-12 relative px-4">
          <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 rounded-full border border-defi-border bg-defi-dark z-0"></div>
          <div className={`absolute left-4 top-1/2 -translate-y-1/2 h-1 bg-defi-emerald rounded-full z-0 transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]`} style={{ width: `calc(${((step - 1) / 4) * 100}% - 2rem)` }}></div>
          
          {steps.map((s) => (
            <div key={s.num} className="flex flex-col items-center relative z-10">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= s.num ? 'bg-defi-emerald text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-defi-dark text-defi-muted border border-defi-border'}`}>
                {step > s.num ? <CheckCircle className="w-6 h-6" /> : s.num}
              </div>
              <span className={`text-xs mt-2 font-mono absolute -bottom-6 whitespace-nowrap ${step >= s.num ? 'text-gray-300' : 'text-defi-muted'}`}>{s.title}</span>
            </div>
          ))}
        </div>

        <div className="min-h-[350px] mt-8">
          {error && <div className="p-3 bg-red-900/30 text-red-400 text-sm rounded-lg border border-red-500/50 mb-6 font-mono">{error}</div>}

          {/* STEP 1: WALLET */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 flex flex-col items-center justify-center text-center">
              <div className="mb-6 rounded-full border border-defi-gold/30 bg-defi-gold/10 p-4 text-defi-goldBright shadow-[0_0_15px_rgba(207,169,93,0.16)]">
                <Wallet className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold mb-4 text-white">Link Your Vault Wallet</h2>
              <p className="text-defi-muted mb-8 font-mono text-sm">
                Connect the Web3 wallet that will act as the master signer for your AI agent transactions.
              </p>
              
              <div className="flex justify-center w-full">
                <ConnectButton />
              </div>

              {walletLinked && (
                <p className="mt-6 text-sm text-defi-emerald font-mono animate-pulse flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Web3 Handshake Complete...
                </p>
              )}
            </div>
          )}

          {/* STEP 2: FRAMEWORK */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center space-x-4 mb-6">
                <div className="rounded-xl border border-defi-gold/30 bg-defi-gold/10 p-3 text-defi-goldBright shadow-[0_0_10px_rgba(207,169,93,0.14)]">
                  <Box className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-white">Select AI Engine</h2>
              </div>
              <p className="text-defi-muted mb-8 font-mono text-sm">
                Which AI framework are you using to build your autonomous agents?
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {['OpenClaw', 'LangChain', 'ElizaOS', 'Custom / Other'].map(fw => (
                  <button 
                    key={fw}
                    onClick={() => setFramework(fw)}
                    className={`p-4 rounded-xl border-2 text-left font-mono text-sm transition-all ${framework === fw ? 'border-defi-gold/35 bg-defi-gold/10 text-white shadow-[0_0_10px_rgba(207,169,93,0.15)]' : 'border-defi-border text-defi-muted hover:border-defi-gold/35 hover:bg-defi-dark'}`}
                  >
                    {fw}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setStep(3)}
                disabled={!framework}
                className="button-primary flex w-full justify-center py-4 disabled:opacity-70"
              >
                <span>Initialize Engine</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* STEP 3: SAFETY LIMITS */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-white">Smart Contract Guardrails</h2>
              </div>
              <p className="text-defi-muted mb-8 font-mono text-sm">
                Set a daily transaction limit for your agents. Any transaction intent exceeding this limit will be paused on-chain and require manual Human-In-The-Loop cryptographic signature.
              </p>
              
              <div className="mb-8">
                <label className="block text-xs font-mono text-defi-muted mb-2 uppercase tracking-wider">Daily Automated Limit (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-defi-muted font-mono">$</span>
                  <input
                    type="number" 
                    value={safetyLimit}
                    onChange={(e) => setSafetyLimit(e.target.value)}
                    className="input-chrome w-full pl-8 font-mono text-xl text-white"
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <button onClick={() => setStep(2)} className="w-1/3 bg-defi-dark border border-defi-border text-gray-400 py-4 rounded-xl font-mono text-sm hover:bg-defi-surfaceHover transition-all">Back</button>
                <button 
                  onClick={() => setStep(4)}
                  disabled={!safetyLimit || Number(safetyLimit) < 0}
                  className="button-primary w-2/3 justify-center py-4 disabled:opacity-70"
                >
                  <span>Set Guardrails</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: NETWORKS */}
          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center space-x-4 mb-6">
                <div className="rounded-xl border border-defi-amber/30 bg-defi-amber/10 p-3 text-defi-amber shadow-[0_0_10px_rgba(245,158,11,0.14)]">
                  <Network className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-white">Supported L2s & Chains</h2>
              </div>
              <p className="text-defi-muted mb-8 font-mono text-sm">
                Select the blockchain networks your agents are allowed to interact with.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {['Base', 'Arbitrum', 'Ethereum', 'Optimism', 'Solana', 'Polygon'].map(net => (
                  <button 
                    key={net}
                    onClick={() => toggleNetwork(net)}
                    className={`p-4 rounded-xl border-2 text-left font-mono text-sm transition-all flex items-center justify-between ${networks.includes(net) ? 'border-defi-gold/35 bg-defi-gold/10 text-white shadow-[0_0_10px_rgba(207,169,93,0.15)]' : 'border-defi-border text-defi-muted hover:border-defi-gold/35 hover:bg-defi-dark'}`}
                  >
                    {net}
                    {networks.includes(net) && <CheckCircle className="w-5 h-5 text-defi-goldBright drop-shadow-[0_0_8px_rgba(207,169,93,0.45)]" />}
                  </button>
                ))}
              </div>

              <div className="flex space-x-4">
                <button onClick={() => setStep(3)} className="w-1/3 bg-defi-dark border border-defi-border text-gray-400 py-4 rounded-xl font-mono text-sm hover:bg-defi-surfaceHover transition-all">Back</button>
                <button 
                  onClick={() => setStep(5)}
                  disabled={networks.length === 0}
                  className="button-primary w-2/3 justify-center py-4 disabled:opacity-70"
                >
                  <span>Select Networks</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: BILLING */}
          {step === 5 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 text-center">
              <div className="p-4 bg-defi-emerald/20 text-defi-emerald border border-defi-emerald/30 rounded-full inline-flex mb-6 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <CreditCard className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold mb-4 text-white">Smart Contract Gas & Spread</h2>
              <p className="text-defi-muted mb-8 font-mono text-sm">
                Aima Protocol uses a decentralized Pay-As-You-Go model. You will only be charged a small percentage fee (the spread) on successful on-chain transactions executed by your agents.
              </p>
              
              <div className="bg-defi-dark p-6 rounded-xl border border-defi-border mb-8 text-left">
                <ul className="space-y-3 font-mono text-sm text-gray-300">
                  <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-defi-emerald" /> No monthly subscription fees.</li>
                  <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-defi-emerald" /> Fees are settled automatically via the UTG Router Contract.</li>
                  <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-defi-emerald" /> Full execution trace available in your Terminal.</li>
                </ul>
              </div>

              <div className="flex space-x-4">
                <button onClick={() => setStep(4)} disabled={isLoading} className="w-1/3 bg-defi-dark border border-defi-border text-gray-400 py-4 rounded-xl font-mono text-sm hover:bg-defi-surfaceHover transition-all">Back</button>
                <button 
                  onClick={finalizeOnboarding}
                  disabled={isLoading}
                  className="w-2/3 bg-defi-emerald text-white py-4 rounded-xl font-bold hover:bg-emerald-500 transition-all flex items-center justify-center space-x-2 disabled:opacity-70 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                >
                  <span>{isLoading ? 'Finalizing...' : 'Launch Protocol Interface'}</span>
                  {!isLoading && <ArrowRight className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
