import { useEffect, useMemo, useState } from 'react';
import { Key, Copy, Activity, Code, TrendingUp, ShieldAlert, Bot, Zap } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { onValue, ref } from 'firebase/database';
import { rtdb } from '../../lib/firebase';
import {
  emptySummary,
  mapGasRecord,
  mapSummaryRecord,
  mapThroughputRecord,
  type GasSnapshot,
  type LiveSummary,
  type ThroughputPoint,
} from '../../lib/liveDashboard';
import { averageGasGwei, fetchRpcGasSnapshots } from '../../lib/chainTelemetry';

interface OverviewViewProps {
  apiKey: string;
}

export default function OverviewView({ apiKey }: OverviewViewProps) {
  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [summary, setSummary] = useState<LiveSummary>(emptySummary);
  const [throughput, setThroughput] = useState<ThroughputPoint[]>([]);
  const [gasSnapshots, setGasSnapshots] = useState<GasSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const summaryRef = ref(rtdb, 'dashboard_live/summary');
    const throughputRef = ref(rtdb, 'dashboard_live/throughput_30d');
    const gasRef = ref(rtdb, 'gas_live');

    const stopSummary = onValue(summaryRef, (snapshot) => {
      setSummary(mapSummaryRecord(snapshot.val()));
      setIsLoading(false);
    });

    const stopThroughput = onValue(throughputRef, (snapshot) => {
      setThroughput(mapThroughputRecord(snapshot.val()));
      setIsLoading(false);
    });

    const stopGas = onValue(gasRef, (snapshot) => {
      const next = mapGasRecord(snapshot.val());
      if (next.length > 0) {
        setGasSnapshots(next);
      }
    });

    let cancelled = false;

    const syncRpcGas = async () => {
      try {
        const next = await fetchRpcGasSnapshots();
        if (!cancelled && next.length > 0) {
          setGasSnapshots((current) => (current.length > 0 ? current : next));
        }
      } catch (error) {
        console.warn('UTG: Failed to fetch live gas via RPC.', error);
      }
    };

    void syncRpcGas();
    const timer = window.setInterval(() => {
      void syncRpcGas();
    }, 45000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      stopSummary();
      stopThroughput();
      stopGas();
    };
  }, []);

  const chartData = useMemo(
    () => (throughput.length > 0 ? throughput : [{ date: 'No data', volume: 0, count: 0 }]),
    [throughput],
  );

  const averageGas = useMemo(() => averageGasGwei(gasSnapshots), [gasSnapshots]);
  const baseGas = gasSnapshots.find((snapshot) => snapshot.chain === 'base');
  const ethereumGas = gasSnapshots.find((snapshot) => snapshot.chain === 'ethereum');

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="metric-card relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_42%)]" />
          <div className="relative z-10 flex items-center space-x-4">
            <div className="rounded-2xl bg-defi-emerald/20 p-4 text-defi-emerald">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-mono uppercase tracking-wider text-defi-muted">30-Day Volume</p>
              {isLoading ? (
                <div className="skeleton-bar mt-3 h-8 w-28" />
              ) : (
                <h3 className="text-2xl font-semibold text-white">
                  ${summary.thirtyDayVolumeUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </h3>
              )}
              <p className="mt-1 text-xs font-mono text-defi-emerald">
                {summary.lastSyncedAt ? `Synced ${new Date(summary.lastSyncedAt).toLocaleTimeString()}` : 'Live from RTDB'}
              </p>
            </div>
          </div>
        </div>

        <div className="metric-card relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(207,169,93,0.14),transparent_42%)]" />
          <div className="relative z-10 flex items-center space-x-4">
            <div className="rounded-2xl bg-defi-gold/15 p-4 text-defi-goldBright">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-mono uppercase tracking-wider text-defi-muted">Active Agents</p>
              {isLoading ? <div className="skeleton-bar mt-3 h-8 w-12" /> : <h3 className="text-2xl font-semibold text-white">{summary.activeAgents}</h3>}
              <p className="mt-1 text-xs font-mono text-defi-muted">Derived from gateway transaction publishers</p>
            </div>
          </div>
        </div>

        <div className="metric-card relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.18),transparent_42%)]" />
          <div className="relative z-10 flex items-center space-x-4">
            <div className="rounded-2xl bg-defi-amber/20 p-4 text-defi-amber">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-mono uppercase tracking-wider text-defi-muted">Pending Signatures</p>
              {isLoading ? <div className="skeleton-bar mt-3 h-8 w-12" /> : <h3 className="text-2xl font-semibold text-white">{summary.pendingSignatures}</h3>}
              <p className="mt-1 text-xs font-mono text-defi-amber">Awaiting human review or signature shares</p>
            </div>
          </div>
        </div>

        <div className="metric-card relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_42%)]" />
          <div className="relative z-10 flex items-center space-x-4">
            <div className="rounded-2xl bg-[#1f2937] p-4 text-[#9fc5ff]">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-mono uppercase tracking-wider text-defi-muted">Network Gas</p>
              <h3 className="text-2xl font-semibold text-white">
                {averageGas ? `${averageGas.toFixed(1)} gwei` : 'Live'}
              </h3>
              <p className="mt-1 text-xs font-mono text-defi-muted">
                {baseGas && ethereumGas
                  ? `Base ${baseGas.gwei.toFixed(1)} / Ethereum ${ethereumGas.gwei.toFixed(1)}`
                  : 'Live RPC and RTDB-backed network telemetry'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="section-panel p-8 lg:col-span-2">
          <div className="mb-6 flex items-center space-x-3">
            <div className="rounded-xl border border-defi-gold/30 bg-defi-gold/10 p-3 text-defi-goldBright">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Protocol Throughput</h2>
              <p className="text-sm text-defi-muted">Transaction volume and completed execution counts streamed from Firebase Realtime Database.</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="goldArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f1cc7a" stopOpacity={0.34} />
                    <stop offset="100%" stopColor="#f1cc7a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(215,196,165,0.12)" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }} dx={-10} tickFormatter={(value) => `$${value}`} />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: '1px solid rgba(215,196,165,0.18)', backgroundColor: '#12161d', color: '#fff', fontFamily: 'JetBrains Mono, monospace' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: number, name: string) => [name === 'volume' ? `$${value}` : value, name === 'volume' ? 'Volume' : 'Completed']}
                />
                <Area type="monotone" dataKey="volume" stroke="none" fill="url(#goldArea)" />
                <Line type="monotone" dataKey="volume" stroke="#f1cc7a" strokeWidth={3} dot={{ r: 4, fill: '#f1cc7a', strokeWidth: 2, stroke: '#111827' }} activeDot={{ r: 6, fill: '#fff1cf' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-8">
          <section className="section-panel relative overflow-hidden p-6">
            <div className="relative z-10 mb-4 flex items-center space-x-3">
              <div className="rounded-lg border border-defi-gold/30 bg-defi-gold/10 p-2 text-defi-goldBright">
                <Key className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold text-white">Gateway Key</h2>
            </div>
            <p className="relative z-10 mb-4 text-sm font-mono text-defi-muted">
              Inject this into your agent environment variables. Keep it secret.
            </p>
            <button
              onClick={() => setRevealed((value) => !value)}
              className="mb-3 w-full rounded-xl border border-defi-border bg-[#0f1319] p-3 text-left font-mono text-xs text-gray-300 shadow-inner"
            >
              {revealed ? apiKey : `${apiKey.slice(0, 10)}******************************`}
            </button>
            <button
              onClick={() => setRevealed((value) => !value)}
              className="mb-3 text-xs font-mono text-defi-muted transition hover:text-white"
            >
              {revealed ? 'Hide key' : 'Reveal key'}
            </button>
            <button onClick={handleCopy} className="button-primary w-full justify-center">
              {copied ? (
                <span className="text-emerald-950">Copied!</span>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy Key</span>
                </>
              )}
            </button>
          </section>

          <section className="code-shell p-6 text-white">
            <div className="mb-4 flex items-center space-x-3">
              <div className="rounded-lg border border-defi-border bg-[#161b22] p-2 text-defi-muted">
                <Code className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Quick Start</h2>
                <p className="text-sm text-defi-muted">Base-first initialization snippet</p>
              </div>
            </div>
            <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-4 font-mono text-xs text-[#c9d1d9] shadow-inner">
              <pre>
                <code>
<span className="text-[#ff7b72]">import</span> {'{'} UTGClient {'}'} <span className="text-[#ff7b72]">from</span> <span className="text-[#a5d6ff]">'@aima/protocol-sdk'</span>;{'\n'}
<span className="text-[#ff7b72]">import</span> {'{'} pay {'}'} <span className="text-[#ff7b72]">from</span> <span className="text-[#a5d6ff]">'@base-org/account'</span>;{'\n\n'}
<span className="text-[#ff7b72]">const</span> client = <span className="text-[#ff7b72]">new</span> UTGClient({'{'}{'\n'}
{'  '}apiKey: process.env.API_KEY,{'\n'}
{'  '}defaultNetwork: <span className="text-[#a5d6ff]">'base'</span>,{'\n'}
{'}'});{'\n\n'}
<span className="text-[#ff7b72]">await</span> pay({'{'} amount: <span className="text-[#a5d6ff]">'10.00'</span>, to: process.env.BASE_TREASURY {'}'});{'\n'}
<span className="text-[#ff7b72]">await</span> client.execute(intent);
                </code>
              </pre>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
