import { useState } from 'react';
import { Save, ShieldCheck, Box, Network } from 'lucide-react';

export default function SettingsView() {
  const [safetyLimit, setSafetyLimit] = useState('100');
  const [framework, setFramework] = useState('OpenClaw');
  const [networks, setNetworks] = useState<string[]>(['Base', 'Arbitrum']);
  const [isSaving, setIsSaving] = useState(false);

  const toggleNetwork = (net: string) => {
    setNetworks(prev => 
      prev.includes(net) ? prev.filter(n => n !== net) : [...prev, net]
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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Protocol Configuration</h2>
          <p className="text-defi-muted font-mono mt-1 text-sm">Manage your agent environments and smart contract parameters.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-defi-accent text-white px-6 py-2 rounded-xl font-bold hover:bg-violet-600 transition-colors flex items-center space-x-2 shadow-[0_0_15px_rgba(139,92,246,0.3)] disabled:opacity-70"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Synchronizing...' : 'Sync to Enclave'}</span>
        </button>
      </div>

      <div className="space-y-8">
        
        {/* Safety Limit */}
        <section className="bg-defi-surface rounded-3xl p-8 border border-defi-border shadow-[0_0_20px_rgba(139,92,246,0.1)] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none"></div>
          <div className="flex items-start space-x-4 relative z-10">
            <div className="p-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl mt-1 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="flex-grow">
              <h3 className="text-lg font-bold text-white mb-2">Smart Contract Guardrails (Daily Limit)</h3>
              <p className="text-sm text-defi-muted font-mono mb-4">
                Maximum automated transaction volume per day (USD). Transactions exceeding this trigger an on-chain pause requiring biometric signature.
              </p>
              <div className="relative max-w-xs">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-defi-muted font-mono">$</span>
                <input 
                  type="number" 
                  value={safetyLimit}
                  onChange={(e) => setSafetyLimit(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 bg-defi-dark border border-defi-border rounded-xl focus:ring-1 focus:ring-defi-accent outline-none font-mono text-lg text-white"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Framework */}
        <section className="bg-defi-surface rounded-3xl p-8 border border-defi-border shadow-[0_0_20px_rgba(139,92,246,0.1)] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none"></div>
          <div className="flex items-start space-x-4 relative z-10">
            <div className="p-3 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl mt-1 drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]">
              <Box className="w-6 h-6" />
            </div>
            <div className="flex-grow">
              <h3 className="text-lg font-bold text-white mb-2">AI Execution Engine</h3>
              <p className="text-sm text-defi-muted font-mono mb-4">
                The primary AI framework executing the Aima Protocol SDK.
              </p>
              <select 
                value={framework}
                onChange={(e) => setFramework(e.target.value)}
                className="w-full max-w-xs px-4 py-3 bg-defi-dark border border-defi-border rounded-xl focus:ring-1 focus:ring-defi-accent outline-none font-mono text-gray-200 appearance-none"
              >
                <option value="OpenClaw">OpenClaw</option>
                <option value="LangChain">LangChain</option>
                <option value="ElizaOS">ElizaOS</option>
                <option value="Custom">Custom / Other</option>
              </select>
            </div>
          </div>
        </section>

        {/* Networks */}
        <section className="bg-defi-surface rounded-3xl p-8 border border-defi-border shadow-[0_0_20px_rgba(139,92,246,0.1)] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/5 to-transparent pointer-events-none"></div>
          <div className="flex items-start space-x-4 relative z-10">
            <div className="p-3 bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30 rounded-xl mt-1 drop-shadow-[0_0_5px_rgba(217,70,239,0.5)]">
              <Network className="w-6 h-6" />
            </div>
            <div className="flex-grow">
              <h3 className="text-lg font-bold text-white mb-2">Authorized Networks</h3>
              <p className="text-sm text-defi-muted font-mono mb-4">
                Blockchains your agents are allowed to bridge or execute upon.
              </p>
              <div className="flex flex-wrap gap-3">
                {['Base', 'Arbitrum', 'Ethereum', 'Optimism', 'Solana', 'Polygon'].map(net => (
                  <button 
                    key={net}
                    onClick={() => toggleNetwork(net)}
                    className={`px-5 py-2 rounded-full border text-sm font-mono transition-all ${networks.includes(net) ? 'border-defi-accent bg-defi-accent/20 text-white shadow-[0_0_10px_rgba(139,92,246,0.2)]' : 'border-defi-border text-defi-muted hover:bg-defi-dark hover:text-gray-300'}`}
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
