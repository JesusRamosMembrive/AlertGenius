
import React from 'react';
import { AlertLog } from '../types';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface LogViewerProps {
  logs: AlertLog[];
}

export const LogViewer: React.FC<LogViewerProps> = ({ logs }) => {
  if (logs.length === 0) {
    return (
      <div className="text-center py-20 bg-slate-900/50 rounded-xl border border-slate-800 border-dashed">
        <div className="mx-auto w-12 h-12 bg-slate-800 text-slate-600 rounded-full flex items-center justify-center mb-3">
            <Clock size={24} />
        </div>
        <h3 className="text-gray-400 font-medium">No activity yet</h3>
        <p className="text-gray-600 text-sm mt-1">Triggers will appear here once alerts run.</p>
      </div>
    );
  }

  // Sort logs by timestamp descending
  const sortedLogs = [...logs].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="space-y-4">
      {sortedLogs.map((log) => (
        <div key={log.id} className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm flex gap-4 animate-in fade-in slide-in-from-bottom-2 hover:border-slate-700 transition-colors">
          <div className="flex-shrink-0 mt-1">
            {log.status === 'success' && <CheckCircle className="text-green-500 drop-shadow-[0_0_3px_rgba(34,197,94,0.5)]" size={20} />}
            {log.status === 'failed' && <XCircle className="text-red-500 drop-shadow-[0_0_3px_rgba(239,68,68,0.5)]" size={20} />}
            {log.status === 'pending' && <Clock className="text-amber-500 animate-pulse" size={20} />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-1">
              <h4 className="font-semibold text-white truncate text-lg">{log.alertName}</h4>
              <span className="text-xs text-gray-500 font-mono whitespace-nowrap">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <p className="text-xs text-blue-400 mb-3 font-medium">To: {log.emailTarget}</p>
            <div className="bg-black/40 p-4 rounded-md text-sm text-gray-300 border border-slate-800 font-serif leading-relaxed shadow-inner">
                {log.content}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
