import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { subscribeUserToPush } from '../utils/pushHelper.js';
import { 
  Bell, 
  Mail, 
  Calendar, 
  Smartphone, 
  Save, 
  CalendarCheck, 
  Check, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

interface Preferences {
  push_enabled: boolean;
  email_enabled: boolean;
  calendar_sync_enabled: boolean;
  reminder_offsets: number[];
}

export const Settings: React.FC = () => {
  const [prefs, setPrefs] = useState<Preferences>({
    push_enabled: true,
    email_enabled: true,
    calendar_sync_enabled: true,
    reminder_offsets: [1440]
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(false);

  // Offset options mapped to minutes
  const offsetOptions = [
    { label: '7 days before', value: 10080 },
    { label: '3 days before', value: 4320 },
    { label: '1 day before', value: 1440 },
    { label: '1 hour before', value: 60 },
    { label: '30 minutes before', value: 30 }
  ];

  // Parse redirect state from URL if Google Calendar connects successfully
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('google_connected') === 'success') {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
      // clean up URL query params
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const preferences = await api.get('/settings/notifications');
        setPrefs({
          push_enabled: preferences.push_enabled,
          email_enabled: preferences.email_enabled,
          calendar_sync_enabled: preferences.calendar_sync_enabled,
          reminder_offsets: preferences.reminder_offsets || [1440]
        });

        // Check if google connection exists
        const { data: googleConn } = await api.get('/profile'); // We can fetch connection or check directly
        // Query google_connections table directly from DB or check
        setGoogleConnected(!!preferences.user_id); // Simplified placeholder check, check if preference is linked
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleTogglePref = (field: keyof Preferences) => {
    setPrefs(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleToggleOffset = (value: number) => {
    setPrefs(prev => {
      const offsets = [...prev.reminder_offsets];
      if (offsets.includes(value)) {
        return {
          ...prev,
          reminder_offsets: offsets.filter(o => o !== value)
        };
      } else {
        return {
          ...prev,
          reminder_offsets: [...offsets, value]
        };
      }
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);

    try {
      // 1. If push enabled, register web push subscription
      if (prefs.push_enabled) {
        // Request notification permissions
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          // Use standard VAPID public key (Vite client env or placeholder)
          const VAPID_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || 'BM2x54U_aO5U8rZkIhHw5D9V3k82G-z2t108LlzTjK7k8'; // Replace with real VAPID or allow default
          try {
            await subscribeUserToPush(VAPID_KEY);
          } catch (err) {
            console.error('Push subscription failed:', err);
          }
        } else {
          // Fallback if denied
          alert('Notification permission denied. Please allow notifications in your browser settings to receive push alerts.');
          setPrefs(prev => ({ ...prev, push_enabled: false }));
        }
      }

      // 2. Put settings to backend
      await api.put('/settings/notifications', prefs);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      alert('Failed to save preferences.');
    } finally {
      setSaving(false);
    }
  };

  const handleConnectGoogle = async () => {
    try {
      const { url } = await api.get('/calendar/auth-url');
      if (url) {
        window.location.href = url; // Redirect to google authorization screen
      }
    } catch (err) {
      console.error(err);
      alert('Could not initialize Google OAuth flow. Configure Calendar variables.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-indigoAccent border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 text-sm">Loading configuration...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 md:space-y-8 animate-slide-up select-none">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white font-outfit tracking-wide">Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Configure your notifications, calendar syncs, and reminder preferences.</p>
      </div>

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center space-x-2 text-xs font-bold animate-fade-in">
          <Check size={16} />
          <span>Configurations updated successfully!</span>
        </div>
      )}

      {/* Main Settings Card */}
      <div className="space-y-6">
        {/* Section 1: Google Calendar Integration */}
        <div className="glass-panel p-6 rounded-2xl border border-cardBorder space-y-5">
          <h3 className="font-bold text-white border-b border-cardBorder/30 pb-3 flex items-center space-x-2">
            <CalendarCheck size={18} className="text-indigo-400" />
            <span>Calendar Synchronization</span>
          </h3>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-bold text-gray-200">Sync with Google Calendar</p>
              <p className="text-xs text-gray-500 max-w-md leading-relaxed">
                Connect your Google Account to automatically populate registration deadlines, round dates, and event schedules to Google Calendar.
              </p>
            </div>

            <button
              onClick={handleConnectGoogle}
              className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-cardBorder hover:border-gray-600 rounded-xl text-xs font-extrabold transition-all shrink-0 w-fit"
            >
              <span>Connect Google Calendar</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-[#090d16]/30 border border-cardBorder rounded-xl">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-glowEmerald animate-pulse"></div>
            <p className="text-xs text-gray-400">
              Note: Token refreshes are handled in the backend securely. We never expose Google Secrets to the browser.
            </p>
          </div>
        </div>

        {/* Section 2: Notification Toggles */}
        <div className="glass-panel p-6 rounded-2xl border border-cardBorder space-y-6">
          <h3 className="font-bold text-white border-b border-cardBorder/30 pb-3 flex items-center space-x-2">
            <Bell size={18} className="text-cyan-400" />
            <span>Notification Settings</span>
          </h3>

          <div className="space-y-5">
            {/* Email Notifications */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 pr-4">
                <span className="text-sm font-bold text-gray-200 flex items-center space-x-2">
                  <Mail size={16} className="text-gray-500" />
                  <span>Email Notifications</span>
                </span>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Receive alerts in your inbox for upcoming registration deadlines and round submissions.
                </p>
              </div>
              <button
                onClick={() => handleTogglePref('email_enabled')}
                className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                  prefs.email_enabled ? 'bg-indigoAccent' : 'bg-gray-800 border border-cardBorder'
                }`}
              >
                <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                  prefs.email_enabled ? 'left-6' : 'left-1'
                }`}></span>
              </button>
            </div>

            {/* Push Notifications */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 pr-4">
                <span className="text-sm font-bold text-gray-200 flex items-center space-x-2">
                  <Smartphone size={16} className="text-gray-500" />
                  <span>Browser Push Notifications</span>
                </span>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Receive real-time alerts in your web browser before round starts and deadlines approach.
                </p>
              </div>
              <button
                onClick={() => handleTogglePref('push_enabled')}
                className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                  prefs.push_enabled ? 'bg-indigoAccent' : 'bg-gray-800 border border-cardBorder'
                }`}
              >
                <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                  prefs.push_enabled ? 'left-6' : 'left-1'
                }`}></span>
              </button>
            </div>

            {/* Google Calendar Sync Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 pr-4">
                <span className="text-sm font-bold text-gray-200 flex items-center space-x-2">
                  <Calendar size={16} className="text-gray-500" />
                  <span>Calendar Synchronization Enabled</span>
                </span>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Allow background synchronization to publish events to Google Calendar.
                </p>
              </div>
              <button
                onClick={() => handleTogglePref('calendar_sync_enabled')}
                className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                  prefs.calendar_sync_enabled ? 'bg-indigoAccent' : 'bg-gray-800 border border-cardBorder'
                }`}
              >
                <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                  prefs.calendar_sync_enabled ? 'left-6' : 'left-1'
                }`}></span>
              </button>
            </div>
          </div>
        </div>

        {/* Section 3: Reminder offsets */}
        <div className="glass-panel p-6 rounded-2xl border border-cardBorder space-y-5">
          <div className="space-y-1 border-b border-cardBorder/30 pb-3">
            <h3 className="font-bold text-white font-outfit text-base">Reminder Preferences</h3>
            <p className="text-xs text-gray-500">Configure how early you want to receive push/email reminders before deadlines.</p>
          </div>

          <div className="space-y-3.5">
            {offsetOptions.map((opt) => {
              const checked = prefs.reminder_offsets.includes(opt.value);
              return (
                <div 
                  key={opt.value}
                  onClick={() => handleToggleOffset(opt.value)}
                  className="flex items-center space-x-3 p-3 bg-[#090d16]/40 border border-cardBorder hover:border-indigo-500/10 rounded-xl cursor-pointer transition-all"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    readOnly
                    className="h-4 w-4 bg-[#0d1321] border border-cardBorder rounded text-indigoAccent focus:ring-0"
                  />
                  <span className="text-xs font-semibold text-gray-300">{opt.label}</span>
                </div>
              );
            })}
          </div>

          {prefs.reminder_offsets.length === 0 && (
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-xl flex items-center space-x-2 text-xs">
              <AlertTriangle size={15} />
              <span>Selecting no offsets will effectively disable upcoming reminder alerts.</span>
            </div>
          )}
        </div>

        {/* Action Save Control */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 px-8 py-3 bg-indigoAccent hover:bg-indigo-600 text-white rounded-xl font-bold shadow-glow hover:shadow-indigo-500/30 transition-all text-sm disabled:opacity-50"
          >
            <Save size={16} />
            <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
export default Settings;
