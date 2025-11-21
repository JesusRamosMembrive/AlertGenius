
import React, { useState, useEffect } from 'react';
import { AppSettings } from '../types';
import { Save, Server, Mail, Shield, Globe, Lock, AlertTriangle, X, Key } from 'lucide-react';

interface SettingsViewProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ settings, onSave }) => {
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [isDirty, setIsDirty] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Auth Modal State (For Delivery Method Change)
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState(false);
  const [pendingMethod, setPendingMethod] = useState<'simulated' | 'smtp' | null>(null);

  // Password Change Modal State
  const [showChangePassModal, setShowChangePassModal] = useState(false);
  const [passForm, setPassForm] = useState({ current: '', new: '', confirm: '' });
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleChange = (field: keyof AppSettings, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    setShowSuccess(false);
  };

  // --- Delivery Method Security Logic ---
  const handleDeliveryMethodClick = (method: 'simulated' | 'smtp') => {
    if (method === formData.deliveryMethod) return; 
    setPendingMethod(method);
    setAuthPassword('');
    setAuthError(false);
    setShowAuthModal(true);
  };

  const confirmDeliveryChange = (e: React.FormEvent) => {
    e.preventDefault();
    // Check against the currently active settings (settings prop), not formData
    const currentAdminPass = settings.adminPassword || 'admin';

    if (authPassword === currentAdminPass) {
        if (pendingMethod) {
            handleChange('deliveryMethod', pendingMethod);
        }
        setShowAuthModal(false);
        setPendingMethod(null);
    } else {
        setAuthError(true);
    }
  };

  // --- Password Change Logic ---
  const handleChangePasswordSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setPassError('');

      const currentRealPass = settings.adminPassword || 'admin';

      // 1. Validate Current Password
      if (passForm.current !== currentRealPass) {
          setPassError('Current password is incorrect.');
          return;
      }

      // 2. Validate New Password
      if (passForm.new.length < 4) {
          setPassError('New password must be at least 4 characters.');
          return;
      }

      if (passForm.new !== passForm.confirm) {
          setPassError('New passwords do not match.');
          return;
      }

      // 3. Save
      handleChange('adminPassword', passForm.new);
      setPassSuccess(true);
      
      // Close modal after delay
      setTimeout(() => {
          setShowChangePassModal(false);
          setPassSuccess(false);
          setPassForm({ current: '', new: '', confirm: '' });
      }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setIsDirty(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <div className="flex items-center justify-between mb-8">
        <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Configuration</h2>
            <p className="text-gray-400 mt-2">Manage global notification settings and delivery methods.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* General Settings */}
        <div className="bg-[#0a0a16] border border-slate-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800/50">
                <div className="p-2 bg-blue-900/20 rounded-lg text-blue-400">
                    <Globe size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">General Preferences</h3>
                    <p className="text-xs text-gray-500">Default settings for new alerts</p>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Default Recipient Email</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-3 text-slate-500" size={18} />
                    <input
                        type="email"
                        value={formData.defaultEmail}
                        onChange={(e) => handleChange('defaultEmail', e.target.value)}
                        placeholder="admin@example.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-black border border-slate-700 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                    />
                </div>
                <p className="text-xs text-gray-500 mt-2 ml-1">This email will be pre-filled when creating new monitors.</p>
            </div>
        </div>

        {/* Delivery Method */}
        <div className="bg-[#0a0a16] border border-slate-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800/50">
                <div className="p-2 bg-blue-900/20 rounded-lg text-blue-400">
                    <Server size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">Delivery Method</h3>
                    <p className="text-xs text-gray-500">Choose how the system sends notifications</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div 
                    onClick={() => handleDeliveryMethodClick('simulated')}
                    className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                        formData.deliveryMethod === 'simulated' 
                        ? 'border-blue-500 bg-blue-500/10' 
                        : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                    }`}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-white">Browser Simulation</span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.deliveryMethod === 'simulated' ? 'border-blue-500' : 'border-slate-600'}`}>
                            {formData.deliveryMethod === 'simulated' && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                        </div>
                    </div>
                    <p className="text-xs text-gray-400">Alerts are logged to the Activity Log only. No real emails are sent. Best for testing.</p>
                </div>

                <div 
                    onClick={() => handleDeliveryMethodClick('smtp')}
                    className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                        formData.deliveryMethod === 'smtp' 
                        ? 'border-blue-500 bg-blue-500/10' 
                        : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                    }`}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-white">SMTP Server</span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.deliveryMethod === 'smtp' ? 'border-blue-500' : 'border-slate-600'}`}>
                             {formData.deliveryMethod === 'smtp' && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                        </div>
                    </div>
                    <p className="text-xs text-gray-400">Connect to an external mail server (Gmail, Outlook, AWS SES) to send real emails.</p>
                </div>
            </div>

            {/* SMTP Details (Conditional) */}
            {formData.deliveryMethod === 'smtp' && (
                <div className="space-y-5 animate-in fade-in slide-in-from-top-2">
                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">SMTP Host</label>
                            <input
                                type="text"
                                value={formData.smtpHost}
                                onChange={(e) => handleChange('smtpHost', e.target.value)}
                                placeholder="smtp.gmail.com"
                                className="w-full px-4 py-2.5 rounded-lg bg-black border border-slate-700 text-white focus:border-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Port</label>
                            <input
                                type="number"
                                value={formData.smtpPort}
                                onChange={(e) => handleChange('smtpPort', parseInt(e.target.value))}
                                placeholder="587"
                                className="w-full px-4 py-2.5 rounded-lg bg-black border border-slate-700 text-white focus:border-blue-500 outline-none"
                            />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-5">
                         <div className="relative">
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Username</label>
                             <input
                                type="text"
                                value={formData.smtpUser}
                                onChange={(e) => handleChange('smtpUser', e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg bg-black border border-slate-700 text-white focus:border-blue-500 outline-none"
                            />
                         </div>
                         <div className="relative">
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
                             <div className="relative">
                                <Shield className="absolute left-3 top-2.5 text-slate-600" size={16} />
                                <input
                                    type="password"
                                    value={formData.smtpPass}
                                    onChange={(e) => handleChange('smtpPass', e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-black border border-slate-700 text-white focus:border-blue-500 outline-none"
                                />
                             </div>
                         </div>
                    </div>
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-200/80">
                        Note: In this web-only demo, SMTP details are saved but actual email transmission requires a backend server proxy to function securely.
                    </div>
                </div>
            )}
        </div>

        {/* Security Settings */}
        <div className="bg-[#0a0a16] border border-slate-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800/50">
                <div className="p-2 bg-blue-900/20 rounded-lg text-blue-400">
                    <Lock size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">Security</h3>
                    <p className="text-xs text-gray-500">Protect critical settings</p>
                </div>
            </div>

            <div className="flex items-center justify-between bg-black p-4 rounded-xl border border-slate-800">
                <div>
                    <div className="text-sm font-medium text-white">Admin Password</div>
                    <div className="text-xs text-gray-500 mt-1">Last changed: Just now (Session)</div>
                </div>
                <button
                    type="button"
                    onClick={() => { 
                        setShowChangePassModal(true); 
                        setPassForm({ current: '', new: '', confirm: '' }); 
                        setPassError('');
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors border border-slate-700"
                >
                    <Key size={14} /> Change Password
                </button>
            </div>
            <p className="text-xs text-gray-600 mt-3 ml-1">
                Note: Since there is no backend database, the password is stored in browser memory and will reset to 'admin' if you refresh the page.
            </p>
        </div>

        <div className="flex items-center justify-end gap-4 pt-4">
            {showSuccess && (
                <span className="text-green-400 text-sm font-medium animate-in fade-in">Settings saved successfully!</span>
            )}
            <button
                type="submit"
                disabled={!isDirty}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                    isDirty 
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30 hover:scale-105' 
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
            >
                <Save size={18} />
                Save Configuration
            </button>
        </div>
      </form>

      {/* Modal 1: Delivery Method Auth Check */}
      {showAuthModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-2xl animate-in fade-in duration-200">
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 shadow-2xl max-w-sm w-full mx-4 relative animate-in zoom-in-95 duration-200">
                <button 
                    onClick={() => { setShowAuthModal(false); setPendingMethod(null); }} 
                    className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>
                
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 mb-4 mx-auto border border-amber-500/20">
                    <Lock size={24} />
                </div>
                
                <h3 className="text-xl font-bold text-white text-center mb-1">Security Check</h3>
                <p className="text-sm text-gray-400 text-center mb-6">Enter your admin password to change the delivery method.</p>

                <form onSubmit={confirmDeliveryChange}>
                    <div className="mb-4">
                        <input 
                            autoFocus
                            type="password" 
                            placeholder="Enter Password" 
                            value={authPassword}
                            onChange={(e) => setAuthPassword(e.target.value)}
                            className={`w-full px-4 py-3 rounded-lg bg-black border text-white focus:outline-none focus:ring-2 transition-all text-center tracking-widest ${
                                authError 
                                ? 'border-red-500 focus:ring-red-500/50' 
                                : 'border-slate-700 focus:ring-blue-500/50 focus:border-blue-500'
                            }`}
                        />
                        {authError && (
                            <p className="text-red-500 text-xs mt-2 text-center flex items-center justify-center gap-1">
                                <AlertTriangle size={12} /> Incorrect password
                            </p>
                        )}
                    </div>
                    <button 
                        type="submit"
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg shadow-blue-900/20 transition-colors"
                    >
                        Verify & Switch
                    </button>
                </form>
            </div>
        </div>
      )}

      {/* Modal 2: Change Password */}
      {showChangePassModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md rounded-2xl animate-in fade-in duration-200">
             <div className="bg-slate-900 p-8 rounded-2xl border border-slate-700 shadow-2xl max-w-md w-full mx-4 relative animate-in zoom-in-95 duration-200">
                <button 
                    type="button"
                    onClick={() => setShowChangePassModal(false)} 
                    className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Key size={20} className="text-blue-500" /> Change Admin Password
                </h3>

                {passSuccess ? (
                    <div className="py-8 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 text-green-500 rounded-full mb-4">
                            <Shield size={32} />
                        </div>
                        <h4 className="text-lg font-bold text-white">Password Updated</h4>
                        <p className="text-gray-400 text-sm">Your admin password has been changed successfully.</p>
                    </div>
                ) : (
                    <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Current Password</label>
                            <input 
                                autoFocus
                                type="password" 
                                value={passForm.current}
                                onChange={(e) => setPassForm({...passForm, current: e.target.value})}
                                className="w-full px-4 py-2.5 rounded-lg bg-black border border-slate-700 text-white focus:border-blue-500 outline-none"
                            />
                        </div>

                        <div className="pt-2 border-t border-slate-800/50">
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">New Password</label>
                            <input 
                                type="password" 
                                value={passForm.new}
                                onChange={(e) => setPassForm({...passForm, new: e.target.value})}
                                className="w-full px-4 py-2.5 rounded-lg bg-black border border-slate-700 text-white focus:border-blue-500 outline-none"
                            />
                        </div>

                        <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Confirm New Password</label>
                            <input 
                                type="password" 
                                value={passForm.confirm}
                                onChange={(e) => setPassForm({...passForm, confirm: e.target.value})}
                                className="w-full px-4 py-2.5 rounded-lg bg-black border border-slate-700 text-white focus:border-blue-500 outline-none"
                            />
                        </div>

                        {passError && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs flex items-center gap-2">
                                <AlertTriangle size={14} /> {passError}
                            </div>
                        )}

                        <button 
                            type="submit"
                            className="w-full py-3 mt-2 bg-white text-black hover:bg-gray-200 font-bold rounded-lg shadow-lg shadow-white/5 transition-colors"
                        >
                            Update Password
                        </button>
                    </form>
                )}
             </div>
        </div>
      )}

    </div>
  );
};
