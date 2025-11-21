
import React, { useState, useEffect } from 'react';
import { CreateAlertData, ScheduleConfig } from '../types';
import { ScheduleSelector } from './ScheduleSelector';
import { X, Sparkles } from 'lucide-react';

interface CreateAlertModalProps {
  isOpen: boolean;
  defaultEmail: string;
  onClose: () => void;
  onSubmit: (data: CreateAlertData) => void;
}

export const CreateAlertModal: React.FC<CreateAlertModalProps> = ({ isOpen, defaultEmail, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [email, setEmail] = useState('');
  const [schedule, setSchedule] = useState<ScheduleConfig>({ type: 'daily' });
  const [isAiGenerated, setIsAiGenerated] = useState(true);

  // Update email when defaultEmail changes or modal opens
  useEffect(() => {
    if (isOpen && !email) {
        setEmail(defaultEmail);
    }
  }, [isOpen, defaultEmail]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, prompt, email, schedule, isAiGenerated });
    onClose();
    // Reset form
    setName('');
    setPrompt('');
    setEmail(defaultEmail); // Reset to default
    setSchedule({ type: 'daily' });
    setIsAiGenerated(true);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-lg my-8 animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 sticky top-0 z-10 backdrop-blur-sm rounded-t-2xl">
          <h2 className="text-lg font-bold text-white">Create New Alert</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Alert Name</label>
            <input
              required
              type="text"
              placeholder="e.g., Morning Motivation"
              className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder-gray-600"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Target Email</label>
            <input
              required
              type="email"
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder-gray-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Schedule</label>
            <ScheduleSelector schedule={schedule} onChange={setSchedule} />
          </div>

          <div>
             <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-gray-300">Content Prompt</label>
                <div className="flex items-center gap-2 bg-slate-800 px-2 py-1 rounded border border-slate-700">
                    <label className="text-xs text-gray-300 cursor-pointer select-none flex items-center gap-2">
                        <input 
                            type="checkbox" 
                            checked={isAiGenerated}
                            onChange={(e) => setIsAiGenerated(e.target.checked)}
                            className="rounded text-blue-600 focus:ring-blue-500 bg-slate-900 border-slate-600"
                        />
                        Use AI Generation
                    </label>
                    {isAiGenerated && <Sparkles size={12} className="text-blue-400"/>}
                </div>
             </div>
            <textarea
              required
              rows={3}
              placeholder={isAiGenerated ? "e.g., Write a short poem about coffee." : "e.g., Don't forget to drink water!"}
              className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all resize-none placeholder-gray-600"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-gray-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-lg shadow-blue-900/40 transition-all hover:scale-[1.02] font-medium"
            >
              Create Alert
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};