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
  const [walletLinked, setWalletLinked] = useState(false);
  const [framework, setFramework] = useState<string>('');
  const [safetyLimit, setSafetyLimit] = useState<string>('100');
  const [networks, setNetworks] = useState<string[]>([]);

  useEffect(() => {
    // If we're on step 1 (wallet connection) and it connects, mark as linked
    if (step === 1 && isConnected && address && !walletLinked) {
      setWalletLinked(true);
      // Automatically proceed after a short delay
      setTimeout(() => setStep(2), 1500);
    }
  }, [isConnected, address, step, walletLinked]);

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
        await setDoc(doc(db, "users", auth.currentUser.uid), {
          walletAddress: address,
          agentFramework: framework,
          dailySafetyLimit: Number(safetyLimit),
          authorizedNetworks: networks,
          onboardedAt: new Date().toISOString(),
          billingModel: "pay-as-you-go"
        }, { merge: true });
        
        setIsLoading(false);
        onComplete();
      } else {
        throw new Error("Missing user session or wallet address.");
      }
    } catch (err: any) {
      console.error("Failed to save configuration:", err);
      setError(err.message);
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
    <div className="min-h-screen bg-brand-cream text-brand-dark flex flex-col font-sans items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-10 border border-brand-beige">
        
        <div className="text-center mb-10">
          <ShieldCheck className="w-16 h-16 text-brand-gold mx-auto mb-4" />
          <h1 className="text-3xl font-extrabold mb-2">UTG Configuration</h1>
          <p className="text-brand-muted font-medium">Set up your Universal Transaction Gateway environment.</p>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-12 relative px-4">
          <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-gray-100 rounded-full z-0"></div>
          <div className={`absolute left-4 top-1/2 -translate-y-1/2 h-1 bg-amber-500 rounded-full z-0 transition-all duration-500`} style={{ width: `calc(${((step - 1) / 4) * 100}% - 2rem)` }}></div>
          
          {steps.map((s) => (
            <div key={s.num} className="flex flex-col items-center relative z-10">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${step >= s.num ? 'bg-amber-500 text-white shadow-lg' : 'bg-gray-200 text-gray-400'}`}>
                {step > s.num ? <CheckCircle className="w-6 h-6" /> : s.num}
              </div>
              <span className={`text-xs mt-2 font-semibold absolute -bottom-6 whitespace-nowrap ${step >= s.num ? 'text-brand-dark' : 'text-gray-400'}`}>{s.title}</span>
            </div>
          ))}
        </div>

        <div className="min-h-[350px] mt-8">
          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 mb-6">{error}</div>}

          {/* STEP 1: WALLET */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 flex flex-col items-center justify-center text-center">
              <div className="p-4 bg-brand-gold/20 text-yellow-800 rounded-full mb-6">
                <Wallet className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Link Your Vault Wallet</h2>
              <p className="text-brand-muted mb-8 font-medium">
                Connect the Web3 wallet that will act as the master signer for your AI agent transactions.
              </p>
              
              <div className="flex justify-center w-full">
                <ConnectButton />
              </div>

              {walletLinked && (
                <p className="mt-6 text-sm text-green-600 font-bold animate-pulse flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Wallet Connected! Moving to next step...
                </p>
              )}
            </div>
          )}

          {/* STEP 2: FRAMEWORK */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <Box className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold">Select AI Framework</h2>
              </div>
              <p className="text-brand-muted mb-8 font-medium">
                Which AI framework are you using to build your autonomous agents?
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {['OpenClaw', 'LangChain', 'ElizaOS', 'Custom / Other'].map(fw => (
                  <button 
                    key={fw}
                    onClick={() => setFramework(fw)}
                    className={`p-4 rounded-xl border-2 text-left font-bold transition-all ${framework === fw ? 'border-brand-gold bg-amber-50 text-brand-dark' : 'border-gray-200 text-gray-500 hover:border-brand-gold hover:bg-gray-50'}`}
                  >
                    {fw}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setStep(3)}
                disabled={!framework}
                className="w-full bg-brand-dark text-white py-4 rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center space-x-2 disabled:opacity-70"
              >
                <span>Continue</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* STEP 3: SAFETY SANDWICH */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold">Safety Sandwich Limits</h2>
              </div>
              <p className="text-brand-muted mb-8 font-medium">
                Set a daily transaction limit for your agents. Any transaction exceeding this limit will be paused and sent to your email for manual Human-In-The-Loop approval.
              </p>
              
              <div className="mb-8">
                <label className="block text-sm font-bold text-gray-700 mb-2">Daily Automated Limit (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                  <input 
                    type="number" 
                    value={safetyLimit}
                    onChange={(e) => setSafetyLimit(e.target.value)}
                    className="w-full pl-8 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-gold outline-none font-bold text-xl text-brand-dark"
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <button onClick={() => setStep(2)} className="w-1/3 bg-gray-100 text-gray-600 py-4 rounded-xl font-bold hover:bg-gray-200 transition-all">Back</button>
                <button 
                  onClick={() => setStep(4)}
                  disabled={!safetyLimit || Number(safetyLimit) < 0}
                  className="w-2/3 bg-brand-dark text-white py-4 rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center space-x-2 disabled:opacity-70"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: NETWORKS */}
          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                  <Network className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold">Authorized Networks</h2>
              </div>
              <p className="text-brand-muted mb-8 font-medium">
                Select the blockchain networks your agents are allowed to interact with.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {['Base', 'Arbitrum', 'Ethereum', 'Optimism', 'Solana', 'Polygon'].map(net => (
                  <button 
                    key={net}
                    onClick={() => toggleNetwork(net)}
                    className={`p-4 rounded-xl border-2 text-left font-bold transition-all flex items-center justify-between ${networks.includes(net) ? 'border-brand-gold bg-amber-50 text-brand-dark' : 'border-gray-200 text-gray-500 hover:border-brand-gold hover:bg-gray-50'}`}
                  >
                    {net}
                    {networks.includes(net) && <CheckCircle className="w-5 h-5 text-amber-500" />}
                  </button>
                ))}
              </div>

              <div className="flex space-x-4">
                <button onClick={() => setStep(3)} className="w-1/3 bg-gray-100 text-gray-600 py-4 rounded-xl font-bold hover:bg-gray-200 transition-all">Back</button>
                <button 
                  onClick={() => setStep(5)}
                  disabled={networks.length === 0}
                  className="w-2/3 bg-brand-dark text-white py-4 rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center space-x-2 disabled:opacity-70"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: BILLING */}
          {step === 5 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 text-center">
              <div className="p-4 bg-green-50 text-green-600 rounded-full inline-flex mb-6">
                <CreditCard className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Pay-As-You-Go Billing</h2>
              <p className="text-brand-muted mb-8 font-medium">
                Aima UTG uses a decentralized Pay-As-You-Go model. You will only be charged a small percentage fee (the spread) on successful API transactions executed by your agents.
              </p>
              
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8 text-left">
                <ul className="space-y-3 font-medium text-brand-dark">
                  <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500" /> No monthly subscription fees.</li>
                  <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500" /> Fees are automatically deducted on-chain.</li>
                  <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500" /> Full analytics available in your dashboard.</li>
                </ul>
              </div>

              <div className="flex space-x-4">
                <button onClick={() => setStep(4)} disabled={isLoading} className="w-1/3 bg-gray-100 text-gray-600 py-4 rounded-xl font-bold hover:bg-gray-200 transition-all">Back</button>
                <button 
                  onClick={finalizeOnboarding}
                  disabled={isLoading}
                  className="w-2/3 bg-brand-gold text-yellow-900 py-4 rounded-xl font-extrabold hover:bg-amber-500 transition-all flex items-center justify-center space-x-2 disabled:opacity-70"
                >
                  <span>{isLoading ? 'Finalizing...' : 'Enter Dashboard'}</span>
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
