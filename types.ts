
export type FrequencyType = 'hourly' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'semi-annually' | 'annually';

export interface ScheduleConfig {
  type: FrequencyType;
  intervalHours?: number; // For 'hourly' (e.g., 4)
  dayOfWeek?: number; // 0-6 (Sun-Sat)
  dayOfMonth?: number; // 1-31
  month?: number; // 0-11 (Jan-Dec)
}

export interface Alert {
  id: string;
  name: string;
  prompt: string;
  email: string;
  schedule: ScheduleConfig;
  nextRun: number; // Timestamp for the next trigger
  lastRun: number | null;
  isActive: boolean;
  isAiGenerated: boolean;
}

export interface AlertLog {
  id: string;
  alertId: string;
  alertName: string;
  emailTarget: string;
  content: string;
  timestamp: number;
  status: 'success' | 'failed' | 'pending';
}

export interface CreateAlertData {
  name: string;
  prompt: string;
  email: string;
  schedule: ScheduleConfig;
  isAiGenerated: boolean;
}

export interface AppSettings {
  defaultEmail: string;
  deliveryMethod: 'simulated' | 'smtp';
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  adminPassword?: string;
}
