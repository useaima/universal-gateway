import { useState } from 'react';
import { Bell, Mail, Smartphone, MessageSquare, Save } from 'lucide-react';

export default function NotificationsView() {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert("Notification preferences saved.");
    }, 1000);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Security Alerts</h2>
          <p className="text-defi-muted font-mono mt-1 text-sm">Configure how you receive transaction and smart contract alerts.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-defi-accent text-white px-6 py-2 rounded-xl font-bold hover:bg-violet-600 transition-colors flex items-center space-x-2 shadow-[0_0_15px_rgba(139,92,246,0.3)] disabled:opacity-70"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Synchronizing...' : 'Sync to Enclave'}</span>
        </button>
      </div>

      <div className="space-y-6">
        
        {/* Email Alerts */}
        <div className="bg-defi-surface rounded-3xl p-6 border border-defi-border shadow-[0_0_20px_rgba(139,92,246,0.1)] flex items-center justify-between relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          <div className="flex items-center space-x-4 relative z-10">
            <div className="p-3 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Encrypted Email Alerts</h3>
              <p className="text-sm text-defi-muted font-mono">Receive an email for every transaction requiring biometric signature.</p>
            </div>
          </div>
          <button 
            onClick={() => setEmailAlerts(!emailAlerts)}
            className={`w-14 h-8 rounded-full transition-colors relative z-10 ${emailAlerts ? 'bg-defi-accent shadow-[0_0_10px_rgba(139,92,246,0.5)]' : 'bg-defi-dark border border-defi-border'}`}
          >
            <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform shadow-sm ${emailAlerts ? 'translate-x-7' : 'translate-x-1'}`}></div>
          </button>
        </div>

        {/* SMS Alerts */}
        <div className="bg-defi-surface rounded-3xl p-6 border border-defi-border shadow-[0_0_20px_rgba(139,92,246,0.1)] flex items-center justify-between relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-defi-emerald/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          <div className="flex items-center space-x-4 relative z-10">
            <div className="p-3 bg-defi-emerald/20 text-defi-emerald border border-defi-emerald/30 rounded-xl drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">SMS Priority Alerts</h3>
              <p className="text-sm text-defi-muted font-mono">Receive a text message for critical smart contract events.</p>
            </div>
          </div>
          <button 
            onClick={() => setSmsAlerts(!smsAlerts)}
            className={`w-14 h-8 rounded-full transition-colors relative z-10 ${smsAlerts ? 'bg-defi-accent shadow-[0_0_10px_rgba(139,92,246,0.5)]' : 'bg-defi-dark border border-defi-border'}`}
          >
            <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform shadow-sm ${smsAlerts ? 'translate-x-7' : 'translate-x-1'}`}></div>
          </button>
        </div>

        {/* Webhooks */}
        <div className="bg-defi-surface rounded-3xl p-6 border border-defi-border shadow-[0_0_20px_rgba(139,92,246,0.1)] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/5 to-transparent pointer-events-none"></div>
          <div className="flex items-start space-x-4 relative z-10">
            <div className="p-3 bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30 rounded-xl mt-1 drop-shadow-[0_0_5px_rgba(217,70,239,0.5)]">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div className="flex-grow">
              <h3 className="text-lg font-bold text-white mb-2">Web3 / Discord Webhook</h3>
              <p className="text-sm text-defi-muted font-mono mb-4">
                Send all agent transaction activity to a dedicated channel in your workspace.
              </p>
              <input 
                type="url" 
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://discord.com/api/webhooks/..."
                className="w-full px-4 py-3 bg-defi-dark border border-defi-border rounded-xl focus:ring-1 focus:ring-defi-accent outline-none font-mono text-white placeholder-gray-600"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
