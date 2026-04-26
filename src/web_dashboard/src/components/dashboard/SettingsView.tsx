import { useState } from 'react';
import { Save, ShieldCheck, Box, Network } from 'lucide-react';

export default function SettingsView() {
  const [safetyLimit, setSafetyLimit] = useState('100');
  const [framework, setFramework] = useState('OpenClaw');
  const [networks, setNetworks] = useState<string[]>(['Base', 'Arbitrum']);
  const [isSaving, setIsSaving] = useState(false);

  const toggleNetwork = (net: string) => {
    setNetworks((prev) =>
      prev.includes(net) ? prev.filter((n) => n !== net) : [...prev, net]
    );
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert("Settings saved successfully!");
    }, 1000);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white tracking-tight">Protocol Configuration</h2>
          <p className="mt-1 text-sm font-mono text-defi-muted">Manage agent environments and guardrail parameters without changing backend logic.</p>
        </div>
        <button onClick={handleSave} disabled={isSaving} className="button-primary px-6 py-3 text-sm disabled:opacity-70">
          <Save className="h-4 w-4" />
          <span>{isSaving ? 'Synchronizing...' : 'Sync to Enclave'}</span>
        </button>
      </div>

      <div className="space-y-8">
        <section className="section-panel p-8">
          <div className="flex items-start space-x-4">
            <div className="mt-1 rounded-xl border border-red-500/30 bg-red-500/20 p-3 text-red-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="flex-grow">
              <h3 className="mb-2 text-lg font-semibold text-white">Smart Contract Guardrails (Daily Limit)</h3>
              <p className="mb-4 text-sm font-mono text-defi-muted">
                Maximum automated transaction volume per day (USD). Transactions exceeding this trigger an on-chain pause requiring biometric signature.
              </p>
              <div className="relative max-w-xs">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-defi-muted">$</span>
                <input
                  type="number"
                  value={safetyLimit}
                  onChange={(e) => setSafetyLimit(e.target.value)}
                  className="input-chrome w-full pl-8 font-mono text-lg"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="section-panel p-8">
          <div className="flex items-start space-x-4">
            <div className="mt-1 rounded-xl border border-defi-gold/30 bg-defi-gold/10 p-3 text-defi-goldBright">
              <Box className="h-6 w-6" />
            </div>
            <div className="flex-grow">
              <h3 className="mb-2 text-lg font-semibold text-white">AI Execution Engine</h3>
              <p className="mb-4 text-sm font-mono text-defi-muted">
                The primary AI framework executing the Aima Protocol SDK.
              </p>
              <select
                value={framework}
                onChange={(e) => setFramework(e.target.value)}
                className="input-chrome w-full max-w-xs appearance-none font-mono text-gray-200"
              >
                <option value="OpenClaw">OpenClaw</option>
                <option value="LangChain">LangChain</option>
                <option value="ElizaOS">ElizaOS</option>
                <option value="Custom">Custom / Other</option>
              </select>
            </div>
          </div>
        </section>

        <section className="section-panel p-8">
          <div className="flex items-start space-x-4">
            <div className="mt-1 rounded-xl border border-defi-amber/30 bg-defi-amber/10 p-3 text-defi-amber">
              <Network className="h-6 w-6" />
            </div>
            <div className="flex-grow">
              <h3 className="mb-2 text-lg font-semibold text-white">Authorized Networks</h3>
              <p className="mb-4 text-sm font-mono text-defi-muted">
                Blockchains your agents are allowed to bridge or execute upon.
              </p>
              <div className="flex flex-wrap gap-3">
                {['Base', 'Arbitrum', 'Ethereum', 'Optimism', 'Solana', 'Polygon'].map((net) => (
                  <button
                    key={net}
                    onClick={() => toggleNetwork(net)}
                    className={`rounded-full border px-5 py-2 text-sm font-mono transition-all ${networks.includes(net) ? 'border-defi-gold/35 bg-defi-gold/10 text-white shadow-[0_0_10px_rgba(207,169,93,0.15)]' : 'border-defi-border text-defi-muted hover:bg-defi-dark hover:text-gray-300'}`}
                  >
                    {net}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
