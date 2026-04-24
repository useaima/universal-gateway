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
          <h2 className="text-2xl font-bold text-brand-dark">Notifications</h2>
          <p className="text-brand-muted font-medium mt-1">Configure how you receive transaction and security alerts.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-brand-dark text-white px-6 py-2 rounded-xl font-bold hover:bg-black transition-colors flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="space-y-6">
        
        {/* Email Alerts */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-brand-dark">Email Alerts</h3>
              <p className="text-sm text-brand-muted font-medium">Receive an email for every transaction requiring human approval.</p>
            </div>
          </div>
          <button 
            onClick={() => setEmailAlerts(!emailAlerts)}
            className={`w-14 h-8 rounded-full transition-colors relative ${emailAlerts ? 'bg-amber-500' : 'bg-gray-200'}`}
          >
            <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform ${emailAlerts ? 'translate-x-7' : 'translate-x-1'}`}></div>
          </button>
        </div>

        {/* SMS Alerts */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-brand-dark">SMS Alerts</h3>
              <p className="text-sm text-brand-muted font-medium">Receive a text message for critical security events.</p>
            </div>
          </div>
          <button 
            onClick={() => setSmsAlerts(!smsAlerts)}
            className={`w-14 h-8 rounded-full transition-colors relative ${smsAlerts ? 'bg-amber-500' : 'bg-gray-200'}`}
          >
            <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform ${smsAlerts ? 'translate-x-7' : 'translate-x-1'}`}></div>
          </button>
        </div>

        {/* Webhooks */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl mt-1">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div className="flex-grow">
              <h3 className="text-lg font-bold text-brand-dark mb-2">Slack / Discord Webhook</h3>
              <p className="text-sm text-brand-muted font-medium mb-4">
                Send all agent transaction activity to a dedicated channel in your workspace.
              </p>
              <input 
                type="url" 
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://hooks.slack.com/services/..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-gold outline-none font-medium text-brand-dark"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
