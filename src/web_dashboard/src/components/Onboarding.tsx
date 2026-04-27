import { useEffect, useMemo, useState } from 'react';
import {
  Wallet,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  Box,
  Network,
  CreditCard,
  Bitcoin,
} from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { auth, db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import type { UserProgress } from '../lib/userProgress';

interface OnboardingProps {
  userLabel: string;
  baseMode: boolean;
  userProgress: UserProgress | null;
  onComplete: () => void;
}

const networkOptions = ['Base', 'Ethereum', 'Bitcoin', 'Solana'] as const;

export default function Onboarding({
  userLabel,
  baseMode,
  userProgress,
  onComplete,
}: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isFunding, setIsFunding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fundingInfo, setFundingInfo] = useState<string | null>(null);

  const { isConnected, address } = useAccount();

  const [framework, setFramework] = useState<string>(userProgress?.agentFramework || 'OpenClaw');
  const [safetyLimit, setSafetyLimit] = useState<string>(
    userProgress?.dailySafetyLimit ? String(userProgress.dailySafetyLimit) : '100',
  );
  const [networks, setNetworks] = useState<string[]>(
    userProgress?.authorizedNetworks?.length
      ? userProgress.authorizedNetworks
      : baseMode
        ? ['Base', 'Ethereum']
        : ['Base'],
  );
  const [bitcoinAddress, setBitcoinAddress] = useState(userProgress?.bitcoinAddress || '');
  const [solanaAddress, setSolanaAddress] = useState(userProgress?.solanaAddress || '');

  const walletLinked = step === 1 && isConnected && !!address;

  useEffect(() => {
    if (walletLinked) {
      const timer = window.setTimeout(() => setStep(2), 1200);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [walletLinked]);

  const toggleNetwork = (net: string) => {
    setNetworks((prev) =>
      prev.includes(net) ? prev.filter((item) => item !== net) : [...prev, net],
    );
  };

  const linkedWallet = useMemo(
    () => address || userProgress?.primaryWallet || userProgress?.walletAddress || '',
    [address, userProgress?.primaryWallet, userProgress?.walletAddress],
  );

  const finalizeOnboarding = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!auth.currentUser || !linkedWallet) {
        throw new Error('Missing user session or linked EVM wallet.');
      }

      const onboardingPayload: Record<string, unknown> = {
        primaryWallet: linkedWallet,
        walletAddress: linkedWallet,
        evmAddresses: [linkedWallet],
        agentFramework: framework,
        dailySafetyLimit: Number(safetyLimit),
        authorizedNetworks: networks,
        bitcoinAddress: bitcoinAddress || '',
        solanaAddress: solanaAddress || '',
        onboardedAt: new Date().toISOString(),
        onboardingCompletedAt: new Date().toISOString(),
        billingModel: 'base-pay + x402',
        authMode: userProgress?.authMode || (baseMode ? 'base' : 'firebase'),
      };

      await setDoc(doc(db, 'users', auth.currentUser.uid), onboardingPayload, { merge: true });

      setIsLoading(false);
      onComplete();
    } catch (err: unknown) {
      console.error('Failed to save configuration:', err);
      setError(err instanceof Error ? err.message : 'Failed to save configuration.');
      setIsLoading(false);
    }
  };

  const handleBaseFunding = async () => {
    setError(null);
    setFundingInfo(null);
    setIsFunding(true);

    try {
      const recipient =
        import.meta.env.VITE_BASE_PAY_RECEIVER ||
        linkedWallet ||
        userProgress?.primaryWallet ||
        '';

      if (!recipient) {
        throw new Error('Missing Base payment receiver address.');
      }

      const { pay } = await import('@base-org/account');
      const paymentResult = await pay({
        amount: import.meta.env.VITE_BASE_BOOTSTRAP_USDC || '10.00',
        to: recipient,
        testnet: false,
      });

      const paymentId =
        (paymentResult as { id?: string; paymentId?: string }).paymentId ||
        (paymentResult as { id?: string }).id ||
        window.crypto.randomUUID();
      const txHash =
        (paymentResult as { txHash?: string; transactionHash?: string }).transactionHash ||
        (paymentResult as { txHash?: string }).txHash ||
        '';
      const status =
        (paymentResult as { status?: string }).status || 'submitted';

      await fetch('/api/payments_reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
          status,
          amount: import.meta.env.VITE_BASE_BOOTSTRAP_USDC || '10.00',
          asset: 'USDC',
          network: 'base',
          txHash,
          walletAddress: linkedWallet,
          userId: auth.currentUser?.uid,
          metadata: paymentResult,
        }),
      });

      if (auth.currentUser) {
        await setDoc(
          doc(db, 'users', auth.currentUser.uid),
          {
            lastPaymentReference: {
              paymentId,
              status,
              amount: import.meta.env.VITE_BASE_BOOTSTRAP_USDC || '10.00',
              network: 'base',
              txHash,
              updatedAt: new Date().toISOString(),
            },
          },
          { merge: true },
        );
      }

      setFundingInfo('Base Pay completed and the reconciliation request was recorded.');
    } catch (paymentError) {
      setError(paymentError instanceof Error ? paymentError.message : 'Base Pay funding failed.');
    } finally {
      setIsFunding(false);
    }
  };

  const steps = [
    { num: 1, title: 'Wallet' },
    { num: 2, title: 'Engine' },
    { num: 3, title: 'Policy' },
    { num: 4, title: 'Chains' },
    { num: 5, title: 'Funding' },
  ];

  return (
    <div className="dark-shell flex min-h-screen items-center justify-center px-4 py-12 font-sans text-gray-200">
      <div className="section-panel w-full max-w-3xl p-10">
        <div className="text-center mb-10">
          <ShieldCheck className="mx-auto mb-4 h-16 w-16 text-defi-emerald" />
          <h1 className="mb-2 text-3xl font-semibold text-white">Protocol Configuration</h1>
          <p className="text-sm font-mono text-defi-muted">
            {baseMode
              ? 'Base-native operator setup with wallet-first identity and Base-denominated funding.'
              : 'Configure the gateway operator profile, execution rails, and policy guardrails.'}
          </p>
          <p className="mt-2 text-xs font-mono uppercase tracking-[0.2em] text-defi-beige">{userLabel}</p>
        </div>

        <div className="flex items-center justify-between mb-12 relative px-4">
          <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 rounded-full border border-defi-border bg-defi-dark z-0" />
          <div
            className="absolute left-4 top-1/2 -translate-y-1/2 h-1 rounded-full bg-defi-emerald z-0 transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"
            style={{ width: `calc(${((step - 1) / 4) * 100}% - 2rem)` }}
          />

          {steps.map((currentStep) => (
            <div key={currentStep.num} className="flex flex-col items-center relative z-10">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  step >= currentStep.num
                    ? 'bg-defi-emerald text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                    : 'bg-defi-dark text-defi-muted border border-defi-border'
                }`}
              >
                {step > currentStep.num ? <CheckCircle className="w-6 h-6" /> : currentStep.num}
              </div>
              <span
                className={`text-xs mt-2 font-mono absolute -bottom-6 whitespace-nowrap ${
                  step >= currentStep.num ? 'text-gray-300' : 'text-defi-muted'
                }`}
              >
                {currentStep.title}
              </span>
            </div>
          ))}
        </div>

        <div className="min-h-[360px] mt-8">
          {error && (
            <div className="p-3 bg-red-900/30 text-red-400 text-sm rounded-lg border border-red-500/50 mb-6 font-mono">
              {error}
            </div>
          )}

          {fundingInfo && (
            <div className="p-3 bg-emerald-950/30 text-emerald-300 text-sm rounded-lg border border-emerald-500/40 mb-6 font-mono">
              {fundingInfo}
            </div>
          )}

          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 flex flex-col items-center justify-center text-center">
              <div className="mb-6 rounded-full border border-defi-gold/30 bg-defi-gold/10 p-4 text-defi-goldBright shadow-[0_0_15px_rgba(207,169,93,0.16)]">
                <Wallet className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold mb-4 text-white">Link Your Execution Wallet</h2>
              <p className="text-defi-muted mb-8 font-mono text-sm">
                Connect the EVM wallet that will anchor Base and Ethereum execution. This address becomes the primary operator wallet in the dashboard.
              </p>

              <div className="flex justify-center w-full">
                <ConnectButton />
              </div>

              {walletLinked && (
                <p className="mt-6 text-sm text-defi-emerald font-mono animate-pulse flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Wallet linked. Continuing into operator configuration...
                </p>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center space-x-4 mb-6">
                <div className="rounded-xl border border-defi-gold/30 bg-defi-gold/10 p-3 text-defi-goldBright shadow-[0_0_10px_rgba(207,169,93,0.14)]">
                  <Box className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-white">Select AI Execution Engine</h2>
              </div>
              <p className="text-defi-muted mb-8 font-mono text-sm">
                Choose the agent framework that will connect through the gateway and inherit these policy controls.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {['OpenClaw', 'LangChain', 'ElizaOS', 'Custom / Other'].map((item) => (
                  <button
                    key={item}
                    onClick={() => setFramework(item)}
                    className={`p-4 rounded-xl border-2 text-left font-mono text-sm transition-all ${
                      framework === item
                        ? 'border-defi-gold/35 bg-defi-gold/10 text-white shadow-[0_0_10px_rgba(207,169,93,0.15)]'
                        : 'border-defi-border text-defi-muted hover:border-defi-gold/35 hover:bg-defi-dark'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep(3)}
                disabled={!framework}
                className="button-primary flex w-full justify-center py-4 disabled:opacity-70"
              >
                <span>Continue to policy</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-white">Policy Guardrails</h2>
              </div>
              <p className="text-defi-muted mb-8 font-mono text-sm">
                Set a daily automated notional limit. Any request beyond this amount remains subject to human review through the gateway.
              </p>

              <div className="mb-8">
                <label className="block text-xs font-mono text-defi-muted mb-2 uppercase tracking-wider">Daily automated limit (USD)</label>
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
                <button
                  onClick={() => setStep(2)}
                  className="w-1/3 bg-defi-dark border border-defi-border text-gray-400 py-4 rounded-xl font-mono text-sm hover:bg-defi-surfaceHover transition-all"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  disabled={!safetyLimit || Number(safetyLimit) < 0}
                  className="button-primary w-2/3 justify-center py-4 disabled:opacity-70"
                >
                  <span>Continue to chain policy</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center space-x-4 mb-6">
                <div className="rounded-xl border border-defi-amber/30 bg-defi-amber/10 p-3 text-defi-amber shadow-[0_0_10px_rgba(245,158,11,0.14)]">
                  <Network className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-white">Authorized Networks</h2>
              </div>
              <p className="text-defi-muted mb-8 font-mono text-sm">
                Base and Ethereum are executable in this release. Bitcoin and Solana are read-only visibility networks unless later adapters are installed.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {networkOptions.map((item) => (
                  <button
                    key={item}
                    onClick={() => toggleNetwork(item)}
                    className={`p-4 rounded-xl border-2 text-left font-mono text-sm transition-all flex items-center justify-between ${
                      networks.includes(item)
                        ? 'border-defi-gold/35 bg-defi-gold/10 text-white shadow-[0_0_10px_rgba(207,169,93,0.15)]'
                        : 'border-defi-border text-defi-muted hover:border-defi-gold/35 hover:bg-defi-dark'
                    }`}
                  >
                    {item}
                    {networks.includes(item) && (
                      <CheckCircle className="w-5 h-5 text-defi-goldBright drop-shadow-[0_0_8px_rgba(207,169,93,0.45)]" />
                    )}
                  </button>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {networks.includes('Bitcoin') && (
                  <label className="block">
                    <span className="mb-2 block text-xs font-mono uppercase tracking-[0.2em] text-defi-muted">Bitcoin address</span>
                    <input
                      type="text"
                      value={bitcoinAddress}
                      onChange={(event) => setBitcoinAddress(event.target.value)}
                      placeholder="bc1..."
                      className="input-chrome w-full font-mono"
                    />
                  </label>
                )}

                {networks.includes('Solana') && (
                  <label className="block">
                    <span className="mb-2 block text-xs font-mono uppercase tracking-[0.2em] text-defi-muted">Solana address</span>
                    <input
                      type="text"
                      value={solanaAddress}
                      onChange={(event) => setSolanaAddress(event.target.value)}
                      placeholder="Enter Solana public key"
                      className="input-chrome w-full font-mono"
                    />
                  </label>
                )}
              </div>

              <div className="flex space-x-4 mt-8">
                <button
                  onClick={() => setStep(3)}
                  className="w-1/3 bg-defi-dark border border-defi-border text-gray-400 py-4 rounded-xl font-mono text-sm hover:bg-defi-surfaceHover transition-all"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(5)}
                  disabled={networks.length === 0}
                  className="button-primary w-2/3 justify-center py-4 disabled:opacity-70"
                >
                  <span>Continue to funding</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 text-center">
              <div className="p-4 bg-defi-emerald/20 text-defi-emerald border border-defi-emerald/30 rounded-full inline-flex mb-6 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <CreditCard className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold mb-4 text-white">Base Funding and Billing</h2>
              <p className="text-defi-muted mb-8 font-mono text-sm">
                UTG receives user-facing crypto payments on Base. Use Base Pay to fund this operator setup in USDC, while agent-to-agent flows continue through x402.
              </p>

              <div className="bg-defi-dark p-6 rounded-xl border border-defi-border mb-8 text-left">
                <ul className="space-y-3 font-mono text-sm text-gray-300">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-defi-emerald" />
                    Base is the default settlement rail for user payments
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-defi-emerald" />
                    Base and Ethereum remain executable networks in this release
                  </li>
                  <li className="flex items-center gap-3">
                    <Bitcoin className="h-4 w-4 text-defi-amber" />
                    Bitcoin and Solana show read-only balances when observer data is available
                  </li>
                </ul>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleBaseFunding}
                  disabled={isFunding}
                  className="inline-flex items-center justify-center rounded-xl border border-[#d6dcff] bg-white px-5 py-4 font-medium text-slate-800 shadow-[0_16px_34px_rgba(28,46,150,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(28,46,150,0.12)] disabled:opacity-70"
                >
                  {isFunding ? 'Processing Base Pay...' : 'Fund with Base Pay'}
                </button>

                <button
                  onClick={finalizeOnboarding}
                  disabled={isLoading}
                  className="button-primary justify-center py-4 disabled:opacity-70"
                >
                  <span>{isLoading ? 'Saving configuration...' : 'Enter dashboard'}</span>
                </button>
              </div>

              <button
                onClick={() => setStep(4)}
                className="mt-4 text-sm font-mono text-defi-muted transition hover:text-white"
              >
                Back to network policy
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
