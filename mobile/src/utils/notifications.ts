import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { api } from '../api/client';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) return null;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Mind Signal',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const tokenData = await Notifications.getExpoPushTokenAsync();
  const token = tokenData.data;
  const platform = Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web';

  try {
    await api.post('/notifications/token', { token, platform });
  } catch {
    // non-fatal — token stored locally even if backend call fails
  }

  return token;
}

const MOOD_REMINDER_ID = 'mood-daily-reminder';

export async function scheduleMoodReminder(timeString: string): Promise<void> {
  await cancelMoodReminder();

  const [hourStr, minuteStr] = timeString.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  await Notifications.scheduleNotificationAsync({
    identifier: MOOD_REMINDER_ID,
    content: {
      title: 'How are you feeling today?',
      body: 'Take a moment to log your mood — it only takes a few seconds.',
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function cancelMoodReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(MOOD_REMINDER_ID);
}

export async function isMoodReminderScheduled(): Promise<boolean> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  return scheduled.some((n) => n.identifier === MOOD_REMINDER_ID);
}
