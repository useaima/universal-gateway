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
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="p-4 bg-green-50 text-green-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">30-Day Volume</p>
            <h3 className="text-2xl font-black text-brand-dark">$12,460.00</h3>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Active Agents</p>
            <h3 className="text-2xl font-black text-brand-dark">3</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="p-4 bg-red-50 text-red-600 rounded-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Pending Approvals</p>
            <h3 className="text-2xl font-black text-brand-dark">1</h3>
          </div>
        </div>
      </div>

      {/* Chart & Key Row */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Chart Area */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Activity className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold">Transaction Volume (USD)</h2>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dx={-10} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`$${value}`, 'Volume']}
                />
                <Line type="monotone" dataKey="volume" stroke="#d97706" strokeWidth={3} dot={{ r: 4, fill: '#d97706', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* API Key & Code */}
        <div className="space-y-8">
          <section className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <Key className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold">Gateway Key</h2>
            </div>
            <p className="text-gray-500 text-sm mb-4 font-medium">
              Inject this into your agent environment variables. Keep it secret.
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 font-mono text-xs text-gray-700 overflow-hidden text-ellipsis mb-3">
              {apiKey}
            </div>
            <button 
              onClick={handleCopy}
              className="w-full bg-brand-dark text-white py-3 rounded-xl font-bold hover:bg-black transition-colors flex items-center justify-center space-x-2"
            >
              {copied ? <span className="text-green-400">Copied!</span> : <><Copy className="w-4 h-4" /><span>Copy Key</span></>}
            </button>
          </section>

          <section className="bg-brand-dark rounded-3xl p-6 shadow-xl text-white">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-gray-800 text-brand-gold rounded-lg">
                <Code className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white">Quick Start</h2>
            </div>
            <div className="bg-[#0D1117] rounded-xl p-4 border border-gray-800 font-mono text-xs text-gray-300 overflow-x-auto">
              <pre>
                <code>
<span className="text-pink-400">import</span> {'{'} UTGClient {'}'} <span className="text-pink-400">from</span> <span className="text-green-300">'@useaima/sdk'</span>;{'\n\n'}
<span className="text-pink-400">const</span> client = <span className="text-pink-400">new</span> UTGClient({'{'}{'\n'}
{'  '}apiKey: process.env.API_KEY,{'\n'}
{'}'});{'\n\n'}
<span className="text-pink-400">await</span> client.execute(intent);
                </code>
              </pre>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
