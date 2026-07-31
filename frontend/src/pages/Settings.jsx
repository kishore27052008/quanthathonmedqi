import React, { useState } from 'react';
import { Bell, ShieldCheck, Sun, Save } from 'lucide-react';

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [highRiskAlerts, setHighRiskAlerts] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Platform Settings</h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Configure notification preferences and workspace defaults
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6 text-xs">
        {/* Section 1: Notifications */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 mb-3">
            <Bell className="w-4 h-4 text-brand-500" /> Notifications & Alerts
          </h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl cursor-pointer">
              <div>
                <p className="font-bold text-slate-900">Email Notifications</p>
                <p className="text-slate-400">Receive summary reports of daily predictions</p>
              </div>
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="w-4 h-4 text-brand-500 rounded border-slate-300 focus:ring-brand-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl cursor-pointer">
              <div>
                <p className="font-bold text-slate-900">Instant High-Risk Alerts</p>
                <p className="text-slate-400">Push immediate alert when high risk probability &gt; 75%</p>
              </div>
              <input
                type="checkbox"
                checked={highRiskAlerts}
                onChange={(e) => setHighRiskAlerts(e.target.checked)}
                className="w-4 h-4 text-brand-500 rounded border-slate-300 focus:ring-brand-500"
              />
            </label>
          </div>
        </div>

        {/* Section 2: Appearance & Security */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 mb-3">
            <Sun className="w-4 h-4 text-brand-500" /> Interface Preferences
          </h3>
          <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl cursor-pointer">
            <div>
              <p className="font-bold text-slate-900">Compact Table Density</p>
              <p className="text-slate-400">Show dense view for history tables</p>
            </div>
            <input
              type="checkbox"
              checked={darkMode}
              onChange={(e) => setDarkMode(e.target.checked)}
              className="w-4 h-4 text-brand-500 rounded border-slate-300 focus:ring-brand-500"
            />
          </label>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={() => alert('Settings saved successfully.')}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold shadow-md shadow-brand-500/20 transition-all"
          >
            <Save className="w-4 h-4" /> Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
