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
    <div className="min-h-screen bg-brand-cream text-brand-dark flex font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-20">
        <div className="p-6 border-b border-gray-100 flex items-center space-x-3">
          <img src="/logo.png" alt="Aima Logo" className="w-8 h-8 object-contain" />
          <span className="text-xl font-bold tracking-tight">Aima UTG</span>
        </div>
        
        <div className="px-4 py-6 flex-grow">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Menu</p>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  activeView === item.id 
                    ? 'bg-brand-dark text-brand-gold shadow-md' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-brand-dark'
                }`}
              >
                <item.icon className={`w-5 h-5 ${activeView === item.id ? 'text-brand-gold' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-100">
          <div className="bg-brand-gold/10 rounded-xl p-4 border border-brand-gold/20 mb-4 flex items-start space-x-3">
             <ShieldCheck className="w-5 h-5 text-yellow-700 mt-0.5" />
             <div>
               <p className="text-xs font-bold text-yellow-900 uppercase">Protection Active</p>
               <p className="text-[10px] text-yellow-800 font-medium leading-tight mt-1">Biometric firewall is securing transactions.</p>
             </div>
          </div>
          
          <button 
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow ml-64 p-8 md:p-12">
        <header className="flex justify-between items-center mb-10 pb-6 border-b border-gray-200">
          <h1 className="text-3xl font-extrabold capitalize text-brand-dark">
            {activeView === 'settings' ? 'Configuration' : activeView}
          </h1>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-brand-gold flex items-center justify-center font-bold text-yellow-900 text-lg shadow-sm border border-yellow-400">
              {userEmail.charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:block text-sm font-bold text-gray-700">
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
