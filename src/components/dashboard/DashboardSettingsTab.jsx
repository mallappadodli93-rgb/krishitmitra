import React, { useState } from 'react';
import { Settings, Bell, Globe, Shield, Save, CheckCircle2, Phone, User } from 'lucide-react';
import Button from '../common/Button';
import Card from '../common/Card';

export default function DashboardSettingsTab({ user, onUpdateUser }) {
  const [language, setLanguage] = useState(user?.preferredLanguage || 'Marathi');
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [weatherAlerts, setWeatherAlerts] = useState(true);
  const [mandiAlerts, setMandiAlerts] = useState(true);
  const [primaryCrop, setPrimaryCrop] = useState('Wheat & Grapes');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    if (user && onUpdateUser) {
      const updated = {
        ...user,
        preferredLanguage: language,
        primaryCrop: primaryCrop,
        smsAlerts,
        whatsappAlerts
      };
      onUpdateUser(updated);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-6">
      
      {/* Heading */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-600" />
          <span>Farmer Portal Settings & Preferences</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure how you receive agro alerts, language preferences, and farm profile data.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-900 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Preferences updated and saved to LocalStorage!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Language & Regional Settings */}
        <Card className="p-6 border-slate-200 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-600" />
            <span>Advisory Language</span>
          </h3>

          <div className="max-w-md">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Preferred Language for AI Voice & Text Advisory
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full text-xs sm:text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="Hindi">हिन्दी (Hindi)</option>
              <option value="Marathi">मराठी (Marathi)</option>
              <option value="Punjabi">ਪੰਜਾਬੀ (Punjabi)</option>
              <option value="Gujarati">ગુજરાતી (Gujarati)</option>
              <option value="Telugu">తెలుగు (Telugu)</option>
              <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
              <option value="Bengali">বাংলা (Bengali)</option>
              <option value="Tamil">தமிழ் (Tamil)</option>
              <option value="English">English</option>
            </select>
          </div>
        </Card>

        {/* Notification Alerts */}
        <Card className="p-6 border-slate-200 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-600" />
            <span>Farmer Alerts & Notifications</span>
          </h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
              <div>
                <span className="text-xs font-bold text-slate-800 block">WhatsApp Daily Advisory</span>
                <span className="text-[11px] text-slate-500">Receive morning weather, spray timing, and mandi updates on WhatsApp</span>
              </div>
              <input
                type="checkbox"
                checked={whatsappAlerts}
                onChange={(e) => setWhatsappAlerts(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Critical Pest & Weather SMS</span>
                <span className="text-[11px] text-slate-500">Instant SMS if frost, sudden rain, or pest breakout threatens your district</span>
              </div>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Daily Mandi Auction Alerts</span>
                <span className="text-[11px] text-slate-500">Get closing price changes for your registered crops</span>
              </div>
              <input
                type="checkbox"
                checked={mandiAlerts}
                onChange={(e) => setMandiAlerts(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
            </label>
          </div>
        </Card>

        {/* Farm & Crop Preferences */}
        <Card className="p-6 border-slate-200 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-600" />
            <span>Farm & Crop Configuration</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Primary Cultivated Crops
              </label>
              <input
                type="text"
                value={primaryCrop}
                onChange={(e) => setPrimaryCrop(e.target.value)}
                placeholder="e.g. Wheat, Gram, Soybean"
                className="w-full text-xs sm:text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Registered Mobile Number
              </label>
              <input
                type="text"
                disabled
                value={user?.mobile || '9876543210'}
                className="w-full text-xs sm:text-sm p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            icon={Save}
          >
            Save Settings & Preferences
          </Button>
        </div>

      </form>

    </div>
  );
}

