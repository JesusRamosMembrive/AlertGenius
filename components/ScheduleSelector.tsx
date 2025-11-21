
import React from 'react';
import { ScheduleConfig, FrequencyType } from '../types';

interface ScheduleSelectorProps {
  schedule: ScheduleConfig;
  onChange: (schedule: ScheduleConfig) => void;
}

export const ScheduleSelector: React.FC<ScheduleSelectorProps> = ({ schedule, onChange }) => {
  
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as FrequencyType;
    // Set sensible defaults when switching types
    const newSchedule: ScheduleConfig = { type: newType };
    
    if (newType === 'hourly') newSchedule.intervalHours = 1;
    if (['weekly', 'biweekly'].includes(newType)) newSchedule.dayOfWeek = 1; // Monday
    if (['monthly', 'semi-annually', 'annually'].includes(newType)) newSchedule.dayOfMonth = 1;
    if (newType === 'annually') newSchedule.month = 0; // January
    
    onChange(newSchedule);
  };

  const updateField = (field: keyof ScheduleConfig, value: number) => {
    onChange({ ...schedule, [field]: value });
  };

  return (
    <div className="space-y-4 bg-slate-950/50 p-4 rounded-lg border border-slate-800">
      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Frequency Type</label>
        <select
          value={schedule.type}
          onChange={handleTypeChange}
          className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
        >
          <option value="hourly">Every X Hours</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="biweekly">Bi-Weekly (Every 2 weeks)</option>
          <option value="monthly">Monthly</option>
          <option value="semi-annually">Semi-Annually</option>
          <option value="annually">Annually</option>
        </select>
      </div>

      {/* Dynamic Fields based on Type */}
      <div className="grid grid-cols-2 gap-4">
        
        {schedule.type === 'hourly' && (
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-400 mb-1">Interval (Hours)</label>
            <input
              type="number"
              min="1"
              max="168"
              value={schedule.intervalHours || ''}
              onChange={(e) => updateField('intervalHours', parseInt(e.target.value) || 1)}
              className="w-full px-4 py-2 rounded-lg bg-black border border-slate-700 text-white focus:border-blue-500 outline-none"
            />
          </div>
        )}

        {(schedule.type === 'weekly' || schedule.type === 'biweekly') && (
          <div className="col-span-2">
             <label className="block text-xs font-medium text-gray-400 mb-1">Day of the Week</label>
             <div className="flex justify-between gap-1">
                {['S','M','T','W','T','F','S'].map((day, idx) => (
                    <button
                        key={idx}
                        type="button"
                        onClick={() => updateField('dayOfWeek', idx)}
                        className={`flex-1 h-10 rounded-md text-sm font-bold transition-all ${
                            schedule.dayOfWeek === idx 
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                            : 'bg-slate-900 text-gray-500 hover:bg-slate-800'
                        }`}
                    >
                        {day}
                    </button>
                ))}
             </div>
          </div>
        )}

        {(schedule.type === 'monthly' || schedule.type === 'semi-annually' || schedule.type === 'annually') && (
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Day of Month</label>
            <select 
                value={schedule.dayOfMonth}
                onChange={(e) => updateField('dayOfMonth', parseInt(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-black border border-slate-700 text-white outline-none"
            >
                {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                    <option key={day} value={day}>{day}{day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'}</option>
                ))}
            </select>
          </div>
        )}

        {schedule.type === 'annually' && (
          <div>
             <label className="block text-xs font-medium text-gray-400 mb-1">Month</label>
             <select 
                value={schedule.month}
                onChange={(e) => updateField('month', parseInt(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-black border border-slate-700 text-white outline-none"
            >
                {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => (
                    <option key={i} value={i}>{m}</option>
                ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};
