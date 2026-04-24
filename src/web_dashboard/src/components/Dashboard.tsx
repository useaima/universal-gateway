import { useState } from 'react';
import { Key, Copy, Activity, ShieldCheck, CreditCard, LogOut, Code } from 'lucide-react';
import Navbar from './Navbar';

interface DashboardProps {
  onLogout: () => void;
  userEmail: string;
}

export default function Dashboard({ onLogout, userEmail }: DashboardProps) {
  const [copied, setCopied] = useState(false);
  const apiKey = "sk_live_aima_8f92a1b3c4d5e6f7g8h9i0j1k2l3m4n5";

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-brand-cream text-brand-dark flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-12 mt-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
          <div>
            <h1 className="text-4xl font-extrabold mb-2 text-brand-dark">Dashboard</h1>
            <p className="text-brand-muted font-medium">Welcome back, {userEmail}</p>
          </div>
          <button 
            onClick={onLogout}
            className="mt-4 md:mt-0 flex items-center space-x-2 text-gray-500 hover:text-red-600 transition-colors bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm font-bold"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* API Key Section */}
            <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-brand-beige/50">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                  <Key className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold">Your Gateway Key</h2>
              </div>
              <p className="text-brand-muted mb-6 font-medium">
                This is your master API key. Inject this into your OpenClaw or LangChain agent environment variables. Keep it secret.
              </p>
              
              <div className="flex items-center space-x-4">
                <div className="flex-grow bg-gray-50 border border-gray-200 rounded-xl p-4 font-mono text-sm text-gray-700 overflow-hidden text-ellipsis">
                  {apiKey}
                </div>
                <button 
                  onClick={handleCopy}
                  className="flex-shrink-0 bg-brand-dark text-white px-6 py-4 rounded-xl font-bold hover:bg-black transition-colors flex items-center space-x-2 min-w-[120px] justify-center"
                >
                  {copied ? (
                    <span className="text-green-400">Copied!</span>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </section>

            {/* Quick Setup Code Snippet */}
            <section className="bg-brand-dark rounded-3xl p-8 shadow-xl text-white">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-gray-800 text-brand-gold rounded-xl">
                  <Code className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-white">Quick Integration</h2>
              </div>
              <p className="text-gray-400 mb-6 font-medium">
                Pass the API key to the UTG Client to initialize your agent's transaction capabilities.
              </p>
              <div className="bg-[#0D1117] rounded-xl p-6 border border-gray-800 font-mono text-sm text-gray-300 overflow-x-auto">
                <pre>
                  <code>
<span className="text-pink-400">import</span> {'{'} UTGClient {'}'} <span className="text-pink-400">from</span> <span className="text-green-300">'@useaima/utg-sdk'</span>;{'\n\n'}
<span className="text-pink-400">const</span> client = <span className="text-pink-400">new</span> UTGClient({'{'}{'\n'}
{'  '}apiKey: process.env.AIMA_API_KEY,{'\n'}
{'  '}network: <span className="text-green-300">'base-mainnet'</span>{'\n'}
{'}'});{'\n\n'}
<span className="text-gray-500">// Your agent can now securely execute</span>{'\n'}
<span className="text-pink-400">await</span> client.execute(agentIntent);
                  </code>
                </pre>
              </div>
            </section>
          </div>

          {/* Sidebar / Stats */}
          <div className="space-y-8">
            <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-brand-beige/50">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                  <Activity className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold">Activity</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <div className="text-4xl font-black text-brand-dark mb-1">0</div>
                  <div className="text-sm font-bold text-brand-muted uppercase tracking-wider">Transactions Processed</div>
                </div>
                <div className="pt-6 border-t border-gray-100">
                  <div className="text-4xl font-black text-brand-dark mb-1">$0.00</div>
                  <div className="text-sm font-bold text-brand-muted uppercase tracking-wider">Volume Handled</div>
                </div>
              </div>
            </section>

            <section className="bg-brand-gold/10 rounded-3xl p-8 border border-brand-gold/20">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-brand-gold/20 text-yellow-800 rounded-xl">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-yellow-900">Security Status</h2>
              </div>
              <p className="text-yellow-800 font-medium mb-4 text-sm leading-relaxed">
                Biometric Safety Sandwich is currently active. All agent proposals require human-in-the-loop wallet signatures.
              </p>
              <div className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-brand-gold/30">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-brand-dark uppercase tracking-wide">Protected</span>
              </div>
            </section>
          </div>

        </div>
      </main>
    </div>
  );
}
