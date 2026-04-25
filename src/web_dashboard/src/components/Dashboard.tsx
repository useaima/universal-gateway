import { useState } from 'react';
import { LayoutDashboard, ArrowLeftRight, Settings, Bell, LogOut, ShieldCheck } from 'lucide-react';
import OverviewView from './dashboard/OverviewView';
import TransactionsView from './dashboard/TransactionsView';
import SettingsView from './dashboard/SettingsView';
import NotificationsView from './dashboard/NotificationsView';

interface DashboardProps {
  onLogout: () => void;
  userEmail: string;
}

type ViewState = 'overview' | 'transactions' | 'settings' | 'notifications';

export default function Dashboard({ onLogout, userEmail }: DashboardProps) {
  const [activeView, setActiveView] = useState<ViewState>('overview');
  const apiKey = "sk_live_aima_8f92a1b3c4d5e6f7g8h9i0j1k2l3m4n5";

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
    { id: 'settings', label: 'Configuration', icon: Settings },
    { id: 'notifications', label: 'Alerts', icon: Bell },
  ] as const;

  return (
    <div className="min-h-screen bg-defi-dark text-gray-200 flex font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 bg-defi-surface border-r border-defi-border flex flex-col fixed h-full z-20">
        <div className="p-6 border-b border-defi-border flex items-center space-x-3">
          <img src="/logo.png" alt="Aima Logo" className="w-8 h-8 object-contain drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
          <span className="text-xl font-bold tracking-tight text-white">Aima Protocol</span>
        </div>
        
        <div className="px-4 py-6 flex-grow">
          <p className="text-xs font-mono text-defi-muted uppercase tracking-wider mb-4 px-2">Terminal</p>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-mono text-sm transition-all ${
                  activeView === item.id 
                    ? 'bg-defi-accent/20 text-white shadow-[0_0_10px_rgba(139,92,246,0.2)] border border-defi-accent/30' 
                    : 'text-defi-muted hover:bg-defi-dark hover:text-gray-200'
                }`}
              >
                <item.icon className={`w-5 h-5 ${activeView === item.id ? 'text-defi-accent drop-shadow-[0_0_5px_rgba(139,92,246,0.8)]' : 'text-defi-muted'}`} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-defi-border">
          <div className="bg-defi-emerald/10 rounded-xl p-4 border border-defi-emerald/30 mb-4 flex items-start space-x-3 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
             <ShieldCheck className="w-5 h-5 text-defi-emerald mt-0.5 drop-shadow-[0_0_5px_rgba(16,185,129,0.8)]" />
             <div>
               <p className="text-xs font-mono text-white uppercase tracking-wider">Guardrails Active</p>
               <p className="text-[10px] text-defi-emerald font-mono leading-tight mt-1">Biometric signatures enforced on-chain.</p>
             </div>
          </div>
          
          <button 
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-mono text-sm text-defi-muted hover:bg-red-500/10 hover:text-red-400 transition-colors border border-transparent hover:border-red-500/30"
          >
            <LogOut className="w-5 h-5" />
            <span>Disconnect</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow ml-64 p-8 md:p-12 relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-defi-accent/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        <header className="flex justify-between items-center mb-10 pb-6 border-b border-defi-border">
          <h1 className="text-3xl font-extrabold capitalize text-white tracking-tight">
            {activeView === 'settings' ? 'Configuration' : activeView}
          </h1>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-defi-surface flex items-center justify-center font-mono text-white text-lg shadow-[0_0_10px_rgba(139,92,246,0.3)] border border-defi-accent/50 relative">
              <div className="absolute inset-0 bg-defi-accent/20 rounded-full animate-ping opacity-50"></div>
              <span className="relative z-10">{userEmail.charAt(0).toUpperCase()}</span>
            </div>
            <div className="hidden md:block text-sm font-mono text-gray-300">
              {userEmail}
            </div>
          </div>
        </header>

        {/* Dynamic View Rendering */}
        {activeView === 'overview' && <OverviewView apiKey={apiKey} />}
        {activeView === 'transactions' && <TransactionsView />}
        {activeView === 'settings' && <SettingsView />}
        {activeView === 'notifications' && <NotificationsView />}

      </main>
    </div>
  );
}
