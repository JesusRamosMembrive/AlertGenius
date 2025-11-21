
import React, { useState, useEffect } from 'react';
import { Alert, ScheduleConfig } from '../types';
import { ScheduleSelector } from './ScheduleSelector';
import { X, Pencil, Sparkles } from 'lucide-react';

interface EditAlertModalProps {
  isOpen: boolean;
  alert: Alert | null;
  onClose: () => void;
  onSave: (alertId: string, updates: Partial<Alert>) => void;
}

export const EditAlertModal: React.FC<EditAlertModalProps> = ({ isOpen, alert, onClose, onSave }) => {
  const [schedule, setSchedule] = useState<ScheduleConfig | null>(null);
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    if (alert) {
      setSchedule(alert.schedule);
      setPrompt(alert.prompt);
    }
  }, [alert]);

  if (!isOpen || !alert || !schedule) return null;

  const handleSave = () => {
    onSave(alert.id, {
        schedule: schedule,
        prompt: prompt
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-lg animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div className="flex items-center gap-2">
             <Pencil className="text-blue-500" size={20}/>
             <h2 className="text-lg font-bold text-white">Edit Alert</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Alert Name</label>
                <p className="text-lg font-bold text-white">{alert.name}</p>
            </div>

            <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Message Prompt</label>
                    {alert.isAiGenerated && <Sparkles size={12} className="text-blue-400" />}
                </div>
                <textarea
                    rows={3}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-black border border-slate-700 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all resize-none font-mono text-sm leading-relaxed"
                />
            </div>
            
            <div>
                <ScheduleSelector schedule={schedule} onChange={setSchedule} />
            </div>

            <div className="pt-2 flex gap-3">
                <button onClick={onClose} className="flex-1 py-3 text-gray-400 hover:text-white font-medium transition-colors rounded-lg hover:bg-white/5">
                    Cancel
                </button>
                <button onClick={handleSave} className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold shadow-lg shadow-blue-900/20 transition-all hover:scale-[1.02]">
                    Save Changes
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
