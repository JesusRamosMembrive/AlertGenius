
import React from 'react';
import { Alert } from '../types';
import { formatSchedule } from '../services/schedulerService';
import { Clock, Mail, Play, Pause, Trash2, Zap, Pencil } from 'lucide-react';

interface AlertCardProps {
  alert: Alert;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onTriggerNow: (id: string) => void;
  onEdit: (alert: Alert) => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({ alert, onToggle, onDelete, onTriggerNow, onEdit }) => {
  
  return (
    <div className={`relative flex flex-col justify-between p-6 rounded-xl border transition-all duration-300 group ${
      alert.isActive 
        ? 'bg-slate-900 border-blue-500/30 shadow-lg shadow-black hover:border-blue-500/60 hover:shadow-blue-900/20' 
        : 'bg-slate-900/40 border-slate-800 opacity-60 grayscale-[0.5]'
    }`}>
      {/* Glow effect behind card */}
      {alert.isActive && <div className="absolute inset-0 rounded-xl bg-blue-600/5 blur-xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>}

      <div className="flex justify-between items-start mb-5">
        <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className={`p-3 rounded-xl transition-colors shadow-inner shrink-0 ${
                alert.isActive 
                ? 'bg-blue-950/50 text-blue-400 border border-blue-500/20 shadow-blue-900/20' 
                : 'bg-slate-800 text-slate-500 border border-slate-700'
            }`}>
                <Mail size={22} />
            </div>
            <div className="min-w-0">
                <h3 className={`font-bold text-lg leading-tight truncate ${alert.isActive ? 'text-white' : 'text-gray-400'}`} title={alert.name}>{alert.name}</h3>
                
                {/* Frequency Display / Button */}
                <button 
                    onClick={() => onEdit(alert)}
                    className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-blue-300 transition-colors bg-black/20 px-2 py-1 rounded hover:bg-blue-500/10"
                >
                    <Clock size={12} />
                    <span>{formatSchedule(alert.schedule)}</span>
                    <Pencil size={10} className="opacity-50" />
                </button>
            </div>
        </div>
        
        <div className="flex gap-1 pl-2 shrink-0">
             <button 
                onClick={() => onTriggerNow(alert.id)}
                className="p-2 text-blue-400 hover:bg-blue-500/20 hover:text-blue-200 rounded-lg transition-colors"
                title="Trigger Now"
            >
                <Zap size={18} />
            </button>
             <button 
                onClick={() => onDelete(alert.id)}
                className="p-2 text-slate-600 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors"
                title="Delete"
            >
                <Trash2 size={18} />
            </button>
        </div>
      </div>

      <div className="mb-6 flex-1 group/prompt">
        <div className="bg-black/40 p-3.5 rounded-lg border border-slate-800/50 hover:border-blue-500/20 transition-colors relative">
            <p className="text-sm text-gray-300 line-clamp-3 font-mono leading-relaxed opacity-90 pr-5">
                {alert.prompt}
            </p>
            <button 
                onClick={(e) => { e.stopPropagation(); onEdit(alert); }}
                className="absolute top-2 right-2 text-slate-600 hover:text-blue-400 opacity-0 group-hover/prompt:opacity-100 transition-all p-1 bg-black/50 rounded hover:bg-blue-500/10"
                title="Edit message"
            >
                <Pencil size={12} />
            </button>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-slate-800/50 flex justify-between items-center text-xs">
        <div className="flex items-center gap-2 overflow-hidden max-w-[55%]">
             <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${alert.isActive ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.6)]' : 'bg-slate-600'}`}></span>
             <span className="truncate text-gray-500 hover:text-gray-300 transition-colors" title={alert.email}>{alert.email}</span>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="text-right">
                <div className="text-xs font-bold text-gray-600 uppercase tracking-wider scale-90 origin-right">Next Run</div>
                <div className="text-gray-400 font-medium font-mono">
                    {new Date(alert.nextRun).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
            </div>
            <button 
                onClick={() => onToggle(alert.id)}
                className={`h-7 px-3 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                    alert.isActive 
                    ? 'bg-white/5 text-white border border-white/10 hover:bg-white/10' 
                    : 'bg-blue-600 text-white shadow-lg shadow-blue-900/50 hover:bg-blue-500 hover:scale-105'
                }`}
            >
                {alert.isActive ? (
                    <Pause size={10} fill="currentColor" />
                ) : (
                    <Play size={10} fill="currentColor" />
                )}
            </button>
        </div>
      </div>
    </div>
  );
};
