import { api } from './client';

export interface NotificationPreferences {
  mood_reminder: boolean;
  reminder_time: string;
  crisis_alerts: boolean;
  message_alerts: boolean;
}

export const notificationsApi = {
  getPreferences: () =>
    api.get<NotificationPreferences>('/notifications/preferences'),

  updatePreferences: (prefs: Partial<NotificationPreferences>) =>
    api.put<NotificationPreferences>('/notifications/preferences', prefs),
};
