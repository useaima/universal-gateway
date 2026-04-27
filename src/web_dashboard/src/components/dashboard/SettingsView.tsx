import { useState } from 'react';
import { Save, ShieldCheck, Box, Network } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import type { UserProgress } from '../../lib/userProgress';

interface SettingsViewProps {
  userProgress: UserProgress | null;
}

const networkProfiles = [
  { label: 'Base', mode: 'Executable' },
  { label: 'Ethereum', mode: 'Executable' },
  { label: 'Bitcoin', mode: 'Read-only' },
  { label: 'Solana', mode: 'Read-only' },
] as const;

export default function SettingsView({ userProgress }: SettingsViewProps) {
  const [safetyLimit, setSafetyLimit] = useState(
    userProgress?.dailySafetyLimit !== undefined
      ? String(userProgress.dailySafetyLimit)
      : '100',
  );
  const [framework, setFramework] = useState(userProgress?.agentFramework || 'OpenClaw');
  const [networks, setNetworks] = useState<string[]>(
    userProgress?.authorizedNetworks?.length
      ? userProgress.authorizedNetworks
      : ['Base', 'Ethereum'],
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const toggleNetwork = (net: string) => {
    setSaveNotice(null);
    setSaveError(null);
    setNetworks((prev) =>
      prev.includes(net) ? prev.filter((n) => n !== net) : [...prev, net]
    );
  };

  const handleSave = async () => {
    if (!auth.currentUser) {
      setSaveError('No authenticated operator session is available for saving configuration.');
      return;
    }

    setIsSaving(true);
    setSaveNotice(null);
    setSaveError(null);

    try {
      await setDoc(
        doc(db, 'users', auth.currentUser.uid),
        {
          agentFramework: framework,
          dailySafetyLimit: Number(safetyLimit),
          authorizedNetworks: networks,
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );
      setSaveNotice('Operator configuration synced to the shared profile.');
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to persist operator configuration.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white tracking-tight">Protocol Configuration</h2>
          <p className="mt-1 text-sm font-mono text-defi-muted">Persist operator policy, execution rails, and automation limits to the shared Firebase profile.</p>
        </div>
        <button onClick={handleSave} disabled={isSaving} className="button-primary px-6 py-3 text-sm disabled:opacity-70">
          <Save className="h-4 w-4" />
          <span>{isSaving ? 'Synchronizing...' : 'Save configuration'}</span>
        </button>
      </div>

      {saveNotice && (
        <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-mono text-emerald-300">
          {saveNotice}
        </div>
      )}

      {saveError && (
        <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-mono text-red-300">
          {saveError}
        </div>
      )}

      <div className="space-y-8">
        <section className="section-panel p-8">
          <div className="flex items-start space-x-4">
            <div className="mt-1 rounded-xl border border-red-500/30 bg-red-500/20 p-3 text-red-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="flex-grow">
              <h3 className="mb-2 text-lg font-semibold text-white">Smart Contract Guardrails (Daily Limit)</h3>
              <p className="mb-4 text-sm font-mono text-defi-muted">
                Maximum automated transaction volume per day in USD. Requests above this ceiling remain halted until the operator signs them through the gateway approval flow.
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
                The primary orchestration runtime that will call into the gateway and inherit this operator profile.
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
                Base and Ethereum are executable in the current release. Bitcoin and Solana remain observer-backed visibility networks until execution adapters are installed.
              </p>
              <div className="flex flex-wrap gap-3">
                {networkProfiles.map((network) => (
                  <button
                    key={network.label}
                    onClick={() => toggleNetwork(network.label)}
                    className={`rounded-full border px-5 py-2 text-sm font-mono transition-all ${networks.includes(network.label) ? 'border-defi-gold/35 bg-defi-gold/10 text-white shadow-[0_0_10px_rgba(207,169,93,0.15)]' : 'border-defi-border text-defi-muted hover:bg-defi-dark hover:text-gray-300'}`}
                  >
                    <span>{network.label}</span>
                    <span className="ml-2 text-[11px] uppercase tracking-[0.18em] text-defi-muted">
                      {network.mode}
                    </span>
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
