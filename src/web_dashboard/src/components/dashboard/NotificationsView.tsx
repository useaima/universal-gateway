import { useState } from 'react';
import { Mail, Smartphone, MessageSquare, Save } from 'lucide-react';

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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white tracking-tight">Security Alerts</h2>
          <p className="mt-1 text-sm font-mono text-defi-muted">Configure how you receive transaction and smart contract alerts.</p>
        </div>
        <button onClick={handleSave} disabled={isSaving} className="button-primary px-6 py-3 text-sm disabled:opacity-70">
          <Save className="h-4 w-4" />
          <span>{isSaving ? 'Synchronizing...' : 'Sync to Enclave'}</span>
        </button>
      </div>

      <div className="space-y-6">
        <div className="section-panel flex items-center justify-between p-6">
          <div className="flex items-center space-x-4">
            <div className="rounded-xl border border-defi-gold/30 bg-defi-gold/10 p-3 text-defi-goldBright">
              <Mail className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Encrypted Email Alerts</h3>
              <p className="text-sm font-mono text-defi-muted">Receive an email for every transaction requiring biometric signature.</p>
            </div>
          </div>
          <button
            onClick={() => setEmailAlerts(!emailAlerts)}
            className={`relative h-8 w-14 rounded-full transition-colors ${emailAlerts ? 'bg-defi-gold shadow-[0_0_10px_rgba(207,169,93,0.35)]' : 'border border-defi-border bg-defi-dark'}`}
          >
            <div className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${emailAlerts ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>

        <div className="section-panel flex items-center justify-between p-6">
          <div className="flex items-center space-x-4">
            <div className="rounded-xl border border-defi-emerald/30 bg-defi-emerald/20 p-3 text-defi-emerald">
              <Smartphone className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">SMS Priority Alerts</h3>
              <p className="text-sm font-mono text-defi-muted">Receive a text message for critical smart contract events.</p>
            </div>
          </div>
          <button
            onClick={() => setSmsAlerts(!smsAlerts)}
            className={`relative h-8 w-14 rounded-full transition-colors ${smsAlerts ? 'bg-defi-gold shadow-[0_0_10px_rgba(207,169,93,0.35)]' : 'border border-defi-border bg-defi-dark'}`}
          >
            <div className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${smsAlerts ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>

        <div className="section-panel p-6">
          <div className="flex items-start space-x-4">
            <div className="mt-1 rounded-xl border border-defi-amber/30 bg-defi-amber/10 p-3 text-defi-amber">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div className="flex-grow">
              <h3 className="mb-2 text-lg font-semibold text-white">Web3 / Discord Webhook</h3>
              <p className="mb-4 text-sm font-mono text-defi-muted">
                Send all agent transaction activity to a dedicated channel in your workspace.
              </p>
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://discord.com/api/webhooks/..."
                className="input-chrome w-full font-mono"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
