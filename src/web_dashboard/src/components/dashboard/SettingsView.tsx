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
          <h2 className="text-2xl font-bold text-brand-dark">Configuration</h2>
          <p className="text-brand-muted font-medium mt-1">Manage your agent environments and safety parameters.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-brand-dark text-white px-6 py-2 rounded-xl font-bold hover:bg-black transition-colors flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="space-y-8">
        
        {/* Safety Limit */}
        <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl mt-1">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="flex-grow">
              <h3 className="text-lg font-bold text-brand-dark mb-2">Daily Safety Limit</h3>
              <p className="text-sm text-brand-muted font-medium mb-4">
                Maximum automated transaction volume per day (USD). Transactions exceeding this trigger a Human-In-The-Loop approval flow.
              </p>
              <div className="relative max-w-xs">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                <input 
                  type="number" 
                  value={safetyLimit}
                  onChange={(e) => setSafetyLimit(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-gold outline-none font-bold text-lg text-brand-dark"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Framework */}
        <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl mt-1">
              <Box className="w-6 h-6" />
            </div>
            <div className="flex-grow">
              <h3 className="text-lg font-bold text-brand-dark mb-2">Agent Framework</h3>
              <p className="text-sm text-brand-muted font-medium mb-4">
                The primary AI framework executing the UTG SDK.
              </p>
              <select 
                value={framework}
                onChange={(e) => setFramework(e.target.value)}
                className="w-full max-w-xs px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-gold outline-none font-bold text-brand-dark appearance-none"
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
        <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl mt-1">
              <Network className="w-6 h-6" />
            </div>
            <div className="flex-grow">
              <h3 className="text-lg font-bold text-brand-dark mb-2">Authorized Networks</h3>
              <p className="text-sm text-brand-muted font-medium mb-4">
                Blockchains your agents are allowed to bridge or execute upon.
              </p>
              <div className="flex flex-wrap gap-3">
                {['Base', 'Arbitrum', 'Ethereum', 'Optimism', 'Solana', 'Polygon'].map(net => (
                  <button 
                    key={net}
                    onClick={() => toggleNetwork(net)}
                    className={`px-5 py-2 rounded-full border text-sm font-bold transition-all ${networks.includes(net) ? 'border-brand-gold bg-amber-50 text-brand-dark' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
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
