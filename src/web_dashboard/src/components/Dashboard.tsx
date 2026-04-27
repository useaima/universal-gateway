import { useState } from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Settings,
  Bell,
  LogOut,
  ShieldCheck,
  Landmark,
  Activity,
  Wallet,
} from 'lucide-react';
import OverviewView from './dashboard/OverviewView';
import TransactionsView from './dashboard/TransactionsView';
import SettingsView from './dashboard/SettingsView';
import NotificationsView from './dashboard/NotificationsView';
import PortfolioView from './dashboard/PortfolioView';
import { truncateAddress } from '../lib/baseAuth';
import type { UserProgress } from '../lib/userProgress';

interface DashboardProps {
  onLogout: () => void;
  userLabel: string;
  userProgress: UserProgress | null;
}

type ViewState = 'overview' | 'portfolio' | 'transactions' | 'settings' | 'notifications';

export default function Dashboard({ onLogout, userLabel, userProgress }: DashboardProps) {
  const [activeView, setActiveView] = useState<ViewState>('overview');
  const apiKey = import.meta.env.VITE_AIMA_GATEWAY_KEY || 'key-not-configured';

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'portfolio', label: 'Portfolio', icon: Landmark },
    { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
    { id: 'settings', label: 'Configuration', icon: Settings },
    { id: 'notifications', label: 'Alerts', icon: Bell },
  ] as const;

  const primaryWallet = userProgress?.primaryWallet || userProgress?.walletAddress || '';
  const networks = userProgress?.authorizedNetworks?.length
    ? userProgress.authorizedNetworks
    : ['Base', 'Ethereum'];
  const authLabel = userProgress?.authMode === 'base' ? 'Base session' : 'Firebase session';
  const settingsKey = [
    userProgress?.agentFramework || '',
    userProgress?.dailySafetyLimit || '',
    ...(userProgress?.authorizedNetworks || []),
  ].join('|');
  const notificationsKey = [
    userProgress?.notificationPreferences?.emailAlerts ? 'email' : 'no-email',
    userProgress?.notificationPreferences?.smsAlerts ? 'sms' : 'no-sms',
    userProgress?.notificationPreferences?.webhookUrl || '',
  ].join('|');

  return (
    <div className="dark-shell min-h-screen text-gray-200">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-defi-border bg-[rgba(10,13,18,0.86)] px-5 py-6 backdrop-blur-xl xl:flex xl:flex-col">
        <div className="flex items-center space-x-3 border-b border-defi-border pb-6">
          <img src="/logo.png" alt="Aima Logo" className="h-10 w-10 rounded-full border border-defi-border bg-white/5 p-1.5 object-contain" />
          <div>
            <span className="block text-xl font-semibold text-white">Aima Protocol</span>
            <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-defi-muted">Base-native command center</span>
          </div>
        </div>

        <div className="flex-grow px-2 py-6">
          <p className="mb-4 px-3 text-xs font-mono uppercase tracking-[0.22em] text-defi-muted">Terminal views</p>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center space-x-3 rounded-2xl px-4 py-3 text-left font-mono text-sm transition-all ${
                  activeView === item.id
                    ? 'border border-defi-gold/35 bg-defi-gold/10 text-white shadow-[0_16px_36px_rgba(207,169,93,0.14)]'
                    : 'border border-transparent text-defi-muted hover:border-defi-border hover:bg-white/[0.04] hover:text-gray-200'
                }`}
              >
                <item.icon className={`h-5 w-5 ${activeView === item.id ? 'text-defi-goldBright' : 'text-defi-muted'}`} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="border-t border-defi-border pt-4">
          <div className="mb-4 rounded-2xl border border-defi-emerald/25 bg-defi-emerald/10 p-4 shadow-[0_16px_34px_rgba(16,185,129,0.08)]">
            <div className="flex items-start space-x-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-defi-emerald" />
              <div>
                <p className="text-xs font-mono uppercase tracking-[0.2em] text-white">Guardrails active</p>
                <p className="mt-1 text-[11px] font-mono leading-tight text-defi-emerald">Base-first policy controls and HITL reviews online.</p>
              </div>
            </div>
          </div>

          <div className="mb-4 rounded-2xl border border-defi-border bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 text-defi-cream">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-defi-emerald shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
              <span className="text-xs font-mono uppercase tracking-[0.2em]">Network profile</span>
            </div>
            <div className="mt-3">
              <p className="text-sm font-medium text-white">{networks.join(' / ')}</p>
              <p className="text-xs font-mono text-defi-muted">Base settlement, EVM execution, observer-backed visibility</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 rounded-2xl border border-transparent px-4 py-3 font-mono text-sm text-defi-muted transition-colors hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="h-5 w-5" />
            <span>Disconnect</span>
          </button>
        </div>
      </aside>

      <main className="px-4 py-6 xl:ml-72 xl:px-8">
        <div className="mx-auto max-w-[1440px]">
          <header className="section-panel mb-8 flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between lg:p-8">
            <div>
              <p className="text-xs font-mono uppercase tracking-[0.24em] text-defi-muted">Operations</p>
              <h1 className="mt-3 text-3xl font-semibold capitalize text-white">
                {activeView === 'settings' ? 'Configuration' : activeView}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-defi-muted">
                Live Base-first execution visibility across approvals, payment reconciliation, assets, and policy configuration.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="metric-card min-w-[170px] p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl border border-defi-gold/20 bg-defi-gold/10 p-2 text-defi-goldBright">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-mono uppercase tracking-[0.18em] text-defi-muted">Session state</p>
                    <p className="text-sm font-medium text-white">{authLabel}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 rounded-2xl border border-defi-border bg-white/[0.03] px-4 py-3">
                <div className="relative flex h-11 w-11 items-center justify-center rounded-full border border-defi-gold/30 bg-defi-gold/10 font-mono text-lg text-white">
                  {primaryWallet ? <Wallet className="h-5 w-5" /> : <span>{userLabel.charAt(0).toUpperCase()}</span>}
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-defi-dark bg-defi-emerald" />
                </div>
                <div className="text-sm font-mono text-gray-300">
                  <div>{userLabel}</div>
                  {primaryWallet && (
                    <div className="mt-1 text-xs text-defi-muted">{truncateAddress(primaryWallet)}</div>
                  )}
                </div>
              </div>
            </div>
          </header>

          {activeView === 'overview' && <OverviewView apiKey={apiKey} />}
          {activeView === 'portfolio' && (
            <PortfolioView walletAddress={primaryWallet} userProgress={userProgress} />
          )}
          {activeView === 'transactions' && <TransactionsView />}
          {activeView === 'settings' && (
            <SettingsView key={settingsKey} userProgress={userProgress} />
          )}
          {activeView === 'notifications' && (
            <NotificationsView key={notificationsKey} userProgress={userProgress} />
          )}
        </div>
      </main>
    </div>
  );
}
