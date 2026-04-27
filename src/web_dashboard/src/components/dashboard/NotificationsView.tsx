import { useState } from 'react';
import { Mail, Smartphone, MessageSquare, Save } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import type { UserProgress } from '../../lib/userProgress';

interface NotificationsViewProps {
  userProgress: UserProgress | null;
}

export default function NotificationsView({ userProgress }: NotificationsViewProps) {
  const [emailAlerts, setEmailAlerts] = useState(
    userProgress?.notificationPreferences?.emailAlerts ?? true,
  );
  const [smsAlerts, setSmsAlerts] = useState(
    userProgress?.notificationPreferences?.smsAlerts ?? false,
  );
  const [webhookUrl, setWebhookUrl] = useState(
    userProgress?.notificationPreferences?.webhookUrl || '',
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!auth.currentUser) {
      setSaveError('No authenticated operator session is available for saving alerts.');
      return;
    }

    setIsSaving(true);
    setSaveNotice(null);
    setSaveError(null);

    try {
      await setDoc(
        doc(db, 'users', auth.currentUser.uid),
        {
          notificationPreferences: {
            emailAlerts,
            smsAlerts,
            webhookUrl: webhookUrl.trim(),
          },
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );
      setSaveNotice('Notification preferences synced to the operator profile.');
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to persist notification preferences.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white tracking-tight">Security Alerts</h2>
          <p className="mt-1 text-sm font-mono text-defi-muted">Choose how the gateway routes approval prompts, policy warnings, and lifecycle notifications.</p>
        </div>
        <button onClick={handleSave} disabled={isSaving} className="button-primary px-6 py-3 text-sm disabled:opacity-70">
          <Save className="h-4 w-4" />
          <span>{isSaving ? 'Synchronizing...' : 'Save preferences'}</span>
        </button>
      </div>

      {saveNotice && (
        <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-mono text-emerald-300">
          {saveNotice}
        </div>
      )}

      {saveError && (
        <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-mono text-red-300">
          {saveError}
        </div>
      )}

      <div className="space-y-6">
        <div className="section-panel flex items-center justify-between p-6">
          <div className="flex items-center space-x-4">
            <div className="rounded-xl border border-defi-gold/30 bg-defi-gold/10 p-3 text-defi-goldBright">
              <Mail className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Encrypted Email Alerts</h3>
              <p className="text-sm font-mono text-defi-muted">Receive approval requests, settlement notices, and policy escalations in the operator inbox.</p>
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
              <h3 className="text-lg font-semibold text-white">Escalation SMS</h3>
              <p className="text-sm font-mono text-defi-muted">Reserve SMS for the smallest set of high-priority halts that need immediate operator attention.</p>
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
                Forward live transaction activity, approvals, and payment reconciliations to a channel your operators already monitor.
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
