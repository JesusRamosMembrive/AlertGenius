
import React, { useState, useEffect, useCallback } from 'react';
import { Alert, AlertLog, CreateAlertData, ScheduleConfig, AppSettings } from './types';
import { AlertCard } from './components/AlertCard';
import { CreateAlertModal } from './components/CreateAlertModal';
import { EditAlertModal } from './components/EditScheduleModal';
import { LogViewer } from './components/LogViewer';
import { SettingsView } from './components/SettingsView';
import { generateAlertContent } from './services/geminiService';
import { calculateNextRun } from './services/schedulerService';
import { Plus, Bell, Activity, LayoutDashboard, Bot, Settings } from 'lucide-react';

// Helper to generate unique IDs
const uuid = () => Math.random().toString(36).substr(2, 9);

const DEFAULT_SCHEDULES: Record<string, ScheduleConfig> = {
    hourly: { type: 'hourly', intervalHours: 1 },
    daily: { type: 'daily' },
    mon: { type: 'weekly', dayOfWeek: 1 },
    wed: { type: 'weekly', dayOfWeek: 3 },
    fri: { type: 'weekly', dayOfWeek: 5 },
};

const DEFAULT_ALERTS_DATA = [
  { id: 'def-1', name: 'Enlaces rotos', prompt: 'Scan for 404 links.', email: 'admin@ag.com', schedule: DEFAULT_SCHEDULES.daily },
  { id: 'def-2', name: 'Enlaces incorrectos', prompt: 'Verify outbound links.', email: 'seo@ag.com', schedule: DEFAULT_SCHEDULES.daily },
  { id: 'def-3', name: 'Textos - erratas', prompt: 'Review drafts for typos.', email: 'editor@ag.com', schedule: DEFAULT_SCHEDULES.hourly },
  { id: 'def-4', name: 'Informacion actualizada', prompt: 'Check About Us page.', email: 'content@ag.com', schedule: DEFAULT_SCHEDULES.mon },
  { id: 'def-5', name: 'Preguntas frecuentes', prompt: 'Generate FAQ from tickets.', email: 'support@ag.com', schedule: DEFAULT_SCHEDULES.daily },
  { id: 'def-6', name: 'CTAs', prompt: 'Analyze CTA performance.', email: 'mkt@ag.com', schedule: DEFAULT_SCHEDULES.daily },
  { id: 'def-7', name: 'Imagenes', prompt: 'Check alt tags.', email: 'dev@ag.com', schedule: DEFAULT_SCHEDULES.fri },
  { id: 'def-8', name: 'Diseño', prompt: 'Check mobile responsiveness.', email: 'design@ag.com', schedule: DEFAULT_SCHEDULES.wed },
];

// Hydrate defaults with nextRun calculation
const DEFAULT_ALERTS: Alert[] = DEFAULT_ALERTS_DATA.map(d => ({
    ...d,
    isActive: true,
    isAiGenerated: true,
    lastRun: null,
    nextRun: calculateNextRun(d.schedule) // Calculate initial next run
}));

export default function App() {
  // --- State ---
  const [alerts, setAlerts] = useState<Alert[]>(DEFAULT_ALERTS);
  const [logs, setLogs] = useState<AlertLog[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    defaultEmail: 'admin@ag.com',
    deliveryMethod: 'simulated',
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPass: '',
    adminPassword: 'admin'
  });
  
  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'activity' | 'settings'>('dashboard');
  const [processingAlertIds, setProcessingAlertIds] = useState<Set<string>>(new Set());

  // --- Logic: Process an alert ---
  const processAlert = useCallback(async (alert: Alert) => {
    if (processingAlertIds.has(alert.id)) return;

    setProcessingAlertIds(prev => new Set(prev).add(alert.id));

    // Log pending
    const logId = uuid();
    setLogs(prev => [{
      id: logId,
      alertId: alert.id,
      alertName: alert.name,
      emailTarget: alert.email,
      content: 'Generating content...',
      timestamp: Date.now(),
      status: 'pending'
    }, ...prev]);

    try {
      let content = alert.prompt;
      if (alert.isAiGenerated) {
        content = await generateAlertContent(alert.prompt);
      }

      setLogs(prev => prev.map(log => 
        log.id === logId ? { ...log, content, status: 'success' } : log
      ));

      // Update Alert: Set Last Run AND Calculate Next Run
      setAlerts(prev => prev.map(a => 
        a.id === alert.id ? { 
            ...a, 
            lastRun: Date.now(),
            nextRun: calculateNextRun(a.schedule) // Schedule next occurrence
        } : a
      ));

    } catch (error) {
      setLogs(prev => prev.map(log => 
        log.id === logId ? { ...log, content: 'Error generating alert.', status: 'failed' } : log
      ));
    } finally {
      setProcessingAlertIds(prev => {
        const next = new Set(prev);
        next.delete(alert.id);
        return next;
      });
    }
  }, [processingAlertIds]);


  // --- Logic: Watcher Loop ---
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      alerts.forEach(alert => {
        if (!alert.isActive) return;
        
        // Check if current time is past the scheduled nextRun
        if (now >= alert.nextRun) {
            processAlert(alert);
        }
      });
    }, 1000); 

    return () => clearInterval(interval);
  }, [alerts, processAlert]);


  // --- Handlers ---
  const handleCreateAlert = (data: CreateAlertData) => {
    const newAlert: Alert = {
      id: uuid(),
      ...data,
      lastRun: null,
      nextRun: calculateNextRun(data.schedule),
      isActive: true,
    };
    setAlerts(prev => [...prev, newAlert]);
  };

  const toggleAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a));
  };

  const deleteAlert = (id: string) => {
    if(window.confirm('Are you sure you want to delete this alert?')) {
        setAlerts(prev => prev.filter(a => a.id !== id));
    }
  };

  const handleTriggerNow = (id: string) => {
    const alert = alerts.find(a => a.id === id);
    if (alert) processAlert(alert);
  };

  const handleUpdateAlert = (id: string, updates: Partial<Alert>) => {
    setAlerts(prev => prev.map(a => {
        if (a.id !== id) return a;

        const updated = { ...a, ...updates };
        // Recalculate nextRun if schedule changed
        if (updates.schedule) {
            updated.nextRun = calculateNextRun(updates.schedule);
        }
        return updated;
    }));
  };

  // --- Stats ---
  const activeAlertsCount = alerts.filter(a => a.isActive).length;
  const totalSent = logs.filter(l => l.status === 'success').length;

  return (
    <div className="min-h-screen bg-black text-gray-100 flex font-sans selection:bg-blue-500/30 selection:text-blue-200">
      
      {/* Sidebar */}
      <div className="w-72 bg-[#050510] border-r border-white/5 hidden md:flex flex-col shadow-2xl z-20">
        <div className="p-8 border-b border-white/5">
            <div className="flex items-center gap-3 text-white font-bold text-2xl tracking-tight">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
                    <Bot size={24} className="text-white" />
                </div>
                <span>
                    Alert<span className="text-blue-500">Genius</span>
                </span>
            </div>
        </div>
        
        <nav className="flex-1 p-6 space-y-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest px-4 mb-4 mt-2">Menu</p>
            <button 
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 font-medium ${
                    activeTab === 'dashboard' 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 translate-x-1' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                }`}
            >
                <LayoutDashboard size={20} /> Dashboard
            </button>
            <button 
                onClick={() => setActiveTab('activity')}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 font-medium ${
                    activeTab === 'activity' 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 translate-x-1' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                }`}
            >
                <Activity size={20} /> Activity Log
            </button>
            <button 
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 font-medium ${
                    activeTab === 'settings' 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 translate-x-1' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                }`}
            >
                <Settings size={20} /> Settings
            </button>
        </nav>

        <div className="p-6 border-t border-white/5 bg-gradient-to-b from-transparent to-blue-900/5">
            <div className="bg-[#0a0a16] border border-white/10 rounded-2xl p-5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/20 blur-3xl rounded-full pointer-events-none group-hover:bg-blue-500/30 transition-colors"></div>
                <div className="relative z-10">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">Active Monitors</p>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-white">{activeAlertsCount}</span>
                        <span className="text-sm text-gray-500 mb-1.5">/ {alerts.length}</span>
                    </div>
                    <div className="mt-3 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: `${(activeAlertsCount / alerts.length) * 100}%`}}></div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-black">
        {/* Background effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
             <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-900/10 blur-[120px]"></div>
             <div className="absolute bottom-[0%] right-[0%] w-[40%] h-[40%] rounded-full bg-cyan-900/5 blur-[100px]"></div>
        </div>

        {/* Header */}
        <header className="h-20 bg-black/50 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-8 relative z-10">
             <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                    {activeTab === 'dashboard' ? 'Overview' : activeTab === 'activity' ? 'Activity History' : 'Settings'}
                </h1>
                <p className="text-xs text-gray-500 mt-1">Welcome back, Admin</p>
             </div>
             <div className="flex items-center gap-6">
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#0a0a16] rounded-full border border-white/5">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                    </span>
                    <span className="text-xs text-gray-300 font-medium">Engine Online</span>
                </div>
                <button className="p-2.5 text-gray-400 hover:bg-white/5 hover:text-white rounded-full relative transition-colors group">
                    <Bell size={22} className="group-hover:rotate-12 transition-transform duration-300" />
                    {logs.length > 0 && (
                        <span className="absolute top-2 right-2.5 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-black"></span>
                    )}
                </button>
             </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-8 relative z-10 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            
            {/* Dashboard View */}
            {activeTab === 'dashboard' && (
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
                        <div>
                            <h2 className="text-3xl font-bold text-white tracking-tight">Your Alerts</h2>
                            <p className="text-gray-400 mt-2 max-w-lg">Manage automated website monitoring and content generation tasks.</p>
                        </div>
                        <button 
                            onClick={() => setIsCreateModalOpen(true)}
                            className="group flex items-center justify-center gap-2 bg-white text-black hover:bg-gray-200 px-6 py-3 rounded-xl shadow-xl shadow-white/5 transition-all hover:-translate-y-0.5 font-bold"
                        >
                            <Plus size={18} className="transition-transform group-hover:rotate-90" /> Create Alert
                        </button>
                    </div>

                    {alerts.length === 0 ? (
                        <div className="bg-[#0a0a16] rounded-3xl border border-white/5 p-20 text-center">
                             <div className="w-24 h-24 bg-slate-900 text-slate-700 rounded-full flex items-center justify-center mx-auto mb-8 border border-slate-800">
                                <Bell size={48} />
                             </div>
                             <h3 className="text-2xl font-bold text-white mb-2">No alerts configured</h3>
                             <p className="text-gray-500 max-w-md mx-auto mb-8">
                                System is idle. Create a new alert to start the Gemini AI engine.
                             </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {alerts.map(alert => (
                                <AlertCard 
                                    key={alert.id} 
                                    alert={alert} 
                                    onToggle={toggleAlert}
                                    onDelete={deleteAlert}
                                    onTriggerNow={handleTriggerNow}
                                    onEdit={(a) => setEditingAlert(a)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Activity View */}
            {activeTab === 'activity' && (
                <div className="max-w-4xl mx-auto">
                    <div className="bg-[#0a0a16] rounded-2xl border border-white/5 p-6 mb-8 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-white">System Logs</h2>
                            <p className="text-gray-500 text-sm">Real-time execution history</p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-mono font-bold text-blue-400">{totalSent}</div>
                            <div className="text-xs text-gray-500 uppercase tracking-wider">Total Events</div>
                        </div>
                    </div>
                    <LogViewer logs={logs} />
                </div>
            )}

            {/* Settings View */}
            {activeTab === 'settings' && (
                <SettingsView settings={settings} onSave={setSettings} />
            )}

        </div>
      </main>

      <CreateAlertModal 
        isOpen={isCreateModalOpen} 
        defaultEmail={settings.defaultEmail}
        onClose={() => setIsCreateModalOpen(false)} 
        onSubmit={handleCreateAlert} 
      />

      <EditAlertModal 
        isOpen={!!editingAlert}
        alert={editingAlert}
        onClose={() => setEditingAlert(null)}
        onSave={handleUpdateAlert}
      />
    </div>
  );
}
