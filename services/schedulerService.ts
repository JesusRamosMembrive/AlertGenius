
import { ScheduleConfig } from '../types';

/**
 * Calculates the next run timestamp based on the schedule configuration.
 * @param schedule The schedule configuration
 * @param fromDate The reference date (usually Date.now() or lastRun). Defaults to now.
 * @returns Timestamp (number) of the next run.
 */
export const calculateNextRun = (schedule: ScheduleConfig, fromDate: number = Date.now()): number => {
  const now = new Date();
  const reference = new Date(fromDate);
  
  // Ensure we don't schedule in the past. If calculated time is <= now, we usually want the next cycle.
  // However, for logic simplicity, we calculate the *next* theoretical slot.
  // If the calculated slot is in the past relative to 'now', we might need to advance it.
  // For this implementation, we assume 'fromDate' is the last run. If no last run, we use 'now'.

  let target = new Date(reference);

  // Reset seconds/milliseconds for cleaner scheduling if creating new
  if (fromDate === Date.now()) {
    target.setSeconds(0);
    target.setMilliseconds(0);
    // For daily/weekly/etc, we might want to start "tomorrow" or "next interval" if strictly future.
    // But usually "trigger now" logic handles immediate. Here we just calc the pattern.
  }

  switch (schedule.type) {
    case 'hourly':
      const hoursToAdd = schedule.intervalHours || 1;
      target.setHours(target.getHours() + hoursToAdd);
      break;

    case 'daily':
      target.setDate(target.getDate() + 1);
      break;

    case 'weekly': {
      // Find next occurrence of dayOfWeek
      const targetDay = schedule.dayOfWeek ?? 1; // Default Monday
      const currentDay = target.getDay();
      let daysUntil = (targetDay - currentDay + 7) % 7;
      if (daysUntil === 0) daysUntil = 7; // Move to next week if today matches
      target.setDate(target.getDate() + daysUntil);
      break;
    }

    case 'biweekly': {
      // Every 2 weeks on dayOfWeek
      const targetDay = schedule.dayOfWeek ?? 1;
      const currentDay = target.getDay();
      let daysUntil = (targetDay - currentDay + 7) % 7;
      if (daysUntil === 0) daysUntil = 7;
      target.setDate(target.getDate() + daysUntil + 7); // Add an extra week
      break;
    }

    case 'monthly': {
      // Next month on dayOfMonth
      const targetDate = schedule.dayOfMonth ?? 1;
      target.setMonth(target.getMonth() + 1);
      // Handle month overflow (e.g. Jan 31 -> Feb 28)
      const maxDays = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
      target.setDate(Math.min(targetDate, maxDays));
      break;
    }

    case 'semi-annually': {
        // +6 Months
        const targetDate = schedule.dayOfMonth ?? 1;
        target.setMonth(target.getMonth() + 6);
        const maxDays = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
        target.setDate(Math.min(targetDate, maxDays));
        break;
    }

    case 'annually': {
      // Next year, specific month/day
      const targetDate = schedule.dayOfMonth ?? 1;
      const targetMonth = schedule.month ?? 0;
      
      target.setFullYear(target.getFullYear() + 1);
      target.setMonth(targetMonth);
      const maxDays = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
      target.setDate(Math.min(targetDate, maxDays));
      break;
    }
  }

  // Failsafe: If the logic resulted in a time in the past (e.g. due to strict day matching), add time.
  // (Simplified for this demo: We trust the calc adds to the reference date which was 'now' or 'lastRun')
  
  return target.getTime();
};

export const formatSchedule = (schedule: ScheduleConfig): string => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  switch (schedule.type) {
    case 'hourly':
      return `Every ${schedule.intervalHours} Hour${(schedule.intervalHours || 1) > 1 ? 's' : ''}`;
    case 'daily':
      return 'Daily';
    case 'weekly':
      return `Weekly (${days[schedule.dayOfWeek || 0]})`;
    case 'biweekly':
      return `Bi-Weekly (${days[schedule.dayOfWeek || 0]})`;
    case 'monthly':
      return `Monthly (Day ${schedule.dayOfMonth})`;
    case 'semi-annually':
      return `Semi-Annually (Day ${schedule.dayOfMonth})`;
    case 'annually':
      return `Annually (${months[schedule.month || 0]} ${schedule.dayOfMonth})`;
    default:
      return 'Custom';
  }
};
