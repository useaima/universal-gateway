import { useState } from 'react';
import { Key, Copy, Activity, Code, TrendingUp, ShieldAlert, Bot, Zap } from 'lucide-react';
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface OverviewViewProps {
  apiKey: string;
}

const mockChartData = [
  { date: 'Apr 01', volume: 400 },
  { date: 'Apr 05', volume: 3000 },
  { date: 'Apr 10', volume: 2000 },
  { date: 'Apr 15', volume: 2780 },
  { date: 'Apr 20', volume: 1890 },
  { date: 'Apr 24', volume: 2390 },
];

export default function OverviewView({ apiKey }: OverviewViewProps) {
  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="metric-card relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_42%)]" />
          <div className="relative z-10 flex items-center space-x-4">
            <div className="rounded-2xl bg-defi-emerald/20 p-4 text-defi-emerald">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-mono uppercase tracking-wider text-defi-muted">30-Day Volume</p>
              <h3 className="text-2xl font-semibold text-white">$12,460.00</h3>
              <p className="mt-1 text-xs font-mono text-defi-emerald">+18.4% vs prior window</p>
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
              <h3 className="text-2xl font-semibold text-white">3</h3>
              <p className="mt-1 text-xs font-mono text-defi-muted">Treasury, arbitrage, yield</p>
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
              <h3 className="text-2xl font-semibold text-white">1</h3>
              <p className="mt-1 text-xs font-mono text-defi-amber">1 request awaiting manual review</p>
            </div>
          </div>
        </div>

        <div className="metric-card relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.16),transparent_42%)]" />
          <div className="relative z-10 flex items-center space-x-4">
            <div className="rounded-2xl bg-defi-amber/20 p-4 text-defi-amber">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-mono uppercase tracking-wider text-defi-muted">Network Gas</p>
              <h3 className="text-2xl font-semibold text-white">14 gwei</h3>
              <p className="mt-1 text-xs font-mono text-defi-muted">Monitored across enabled networks</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="section-panel lg:col-span-2 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="rounded-xl border border-defi-gold/30 bg-defi-gold/10 p-3 text-defi-goldBright">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Protocol Throughput</h2>
              <p className="text-sm text-defi-muted">Volume, execution cadence, and recent directional movement.</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData}>
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
                  formatter={(value: number) => [`$${value}`, 'Volume']}
                />
                <Area type="monotone" dataKey="volume" stroke="none" fill="url(#goldArea)" />
                <Line type="monotone" dataKey="volume" stroke="#f1cc7a" strokeWidth={3} dot={{ r: 4, fill: '#f1cc7a', strokeWidth: 2, stroke: '#111827' }} activeDot={{ r: 6, fill: '#fff1cf' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-8">
          <section className="section-panel relative overflow-hidden p-6">
            <div className="flex items-center space-x-3 mb-4 relative z-10">
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
            <button
              onClick={handleCopy}
              className="button-primary w-full justify-center"
            >
              {copied ? <span className="text-emerald-950">Copied!</span> : <><Copy className="h-4 w-4" /><span>Copy Key</span></>}
            </button>
          </section>

          <section className="code-shell p-6 text-white">
            <div className="mb-4 flex items-center space-x-3">
              <div className="rounded-lg border border-defi-border bg-[#161b22] p-2 text-defi-muted">
                <Code className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Quick Start</h2>
                <p className="text-sm text-defi-muted">Initialization snippet</p>
              </div>
            </div>
            <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-4 font-mono text-xs text-[#c9d1d9] shadow-inner">
              <pre>
                <code>
<span className="text-[#ff7b72]">import</span> {'{'} UTGClient {'}'} <span className="text-[#ff7b72]">from</span> <span className="text-[#a5d6ff]">'@aima/protocol-sdk'</span>;{'\n\n'}
<span className="text-[#ff7b72]">const</span> client = <span className="text-[#ff7b72]">new</span> UTGClient({'{'}{'\n'}
{'  '}apiKey: process.env.API_KEY,{'\n'}
{'}'});{'\n\n'}
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
