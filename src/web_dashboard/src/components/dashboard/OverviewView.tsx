import { useState } from 'react';
import { Key, Copy, Activity, Code, TrendingUp, ShieldAlert, Bot } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-defi-surface p-6 rounded-2xl border border-defi-border shadow-[0_0_20px_rgba(139,92,246,0.1)] flex items-center space-x-4 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-defi-emerald/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <div className="p-4 bg-defi-emerald/20 text-defi-emerald rounded-xl drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-mono text-defi-muted uppercase tracking-wider">30-Day Volume</p>
            <h3 className="text-2xl font-black text-white">$12,460.00</h3>
          </div>
        </div>
        
        <div className="bg-defi-surface p-6 rounded-2xl border border-defi-border shadow-[0_0_20px_rgba(139,92,246,0.1)] flex items-center space-x-4 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <div className="p-4 bg-blue-500/20 text-blue-400 rounded-xl drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">
            <Bot className="w-6 h-6" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-mono text-defi-muted uppercase tracking-wider">Active Agents</p>
            <h3 className="text-2xl font-black text-white">3</h3>
          </div>
        </div>

        <div className="bg-defi-surface p-6 rounded-2xl border border-defi-border shadow-[0_0_20px_rgba(139,92,246,0.1)] flex items-center space-x-4 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <div className="p-4 bg-red-500/20 text-red-400 rounded-xl drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-mono text-defi-muted uppercase tracking-wider">Pending Signatures</p>
            <h3 className="text-2xl font-black text-white">1</h3>
          </div>
        </div>
      </div>

      {/* Chart & Key Row */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Chart Area */}
        <div className="lg:col-span-2 bg-defi-surface rounded-3xl p-8 border border-defi-border shadow-[0_0_30px_rgba(139,92,246,0.1)]">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-defi-accent/20 text-defi-accent rounded-xl drop-shadow-[0_0_5px_rgba(139,92,246,0.8)] border border-defi-accent/30">
              <Activity className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">Protocol Throughput (USD)</h2>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12, fontFamily: 'monospace' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12, fontFamily: 'monospace' }} dx={-10} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #374151', backgroundColor: '#111827', color: '#fff', fontFamily: 'monospace' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: number) => [`$${value}`, 'Volume']}
                />
                <Line type="monotone" dataKey="volume" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#111827' }} activeDot={{ r: 6, fill: '#a78bfa' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* API Key & Code */}
        <div className="space-y-8">
          <section className="bg-defi-surface rounded-3xl p-6 border border-defi-border shadow-[0_0_20px_rgba(139,92,246,0.1)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-defi-accent/5 to-transparent pointer-events-none"></div>
            <div className="flex items-center space-x-3 mb-4 relative z-10">
              <div className="p-2 bg-defi-accent/20 text-defi-accent rounded-lg border border-defi-accent/30 drop-shadow-[0_0_5px_rgba(139,92,246,0.8)]">
                <Key className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white">Gateway Key</h2>
            </div>
            <p className="text-defi-muted text-sm mb-4 font-mono relative z-10">
              Inject this into your agent environment variables. Keep it secret.
            </p>
            <div className="bg-defi-dark border border-defi-border rounded-xl p-3 font-mono text-xs text-gray-300 overflow-hidden text-ellipsis mb-3 relative z-10 shadow-inner">
              {apiKey}
            </div>
            <button 
              onClick={handleCopy}
              className="w-full bg-defi-accent text-white py-3 rounded-xl font-bold hover:bg-violet-600 transition-colors flex items-center justify-center space-x-2 relative z-10 shadow-[0_0_15px_rgba(139,92,246,0.3)]"
            >
              {copied ? <span className="text-emerald-400">Copied!</span> : <><Copy className="w-4 h-4" /><span>Copy Key</span></>}
            </button>
          </section>

          <section className="bg-[#0d1117] border border-[#30363d] rounded-3xl p-6 shadow-xl text-white">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-[#161b22] text-[#8b949e] border border-[#30363d] rounded-lg">
                <Code className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white">Quick Start</h2>
            </div>
            <div className="bg-[#161b22] rounded-xl p-4 border border-[#30363d] font-mono text-xs text-[#c9d1d9] overflow-x-auto shadow-inner">
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
