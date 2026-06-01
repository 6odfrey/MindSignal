import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Switch, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert, Platform,
} from 'react-native';
import { notificationsApi, type NotificationPreferences } from '../../api/notifications';
import {
  scheduleMoodReminder,
  cancelMoodReminder,
  registerForPushNotifications,
} from '../../utils/notifications';

const TIMES = [
  '08:00', '09:00', '10:00', '12:00', '14:00',
  '17:00', '18:00', '19:00', '20:00', '21:00', '22:00',
];

function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number);
  const suffix = h >= 12 ? 'pm' : 'am';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${suffix}`;
}

export default function RemindersScreen() {
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await registerForPushNotifications();
        const res = await notificationsApi.getPreferences();
        setPrefs(res);
        if (res.mood_reminder) {
          await scheduleMoodReminder(res.reminder_time);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function toggleMoodReminder(value: boolean) {
    if (!prefs) return;
    setSaving(true);
    try {
      const updated = await notificationsApi.updatePreferences({ mood_reminder: value });
      setPrefs(updated);
      if (value) {
        await scheduleMoodReminder(prefs.reminder_time);
      } else {
        await cancelMoodReminder();
      }
    } catch {
      Alert.alert('Error', 'Could not update reminder. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function setReminderTime(time: string) {
    if (!prefs) return;
    setSaving(true);
    try {
      const updated = await notificationsApi.updatePreferences({ reminder_time: time });
      setPrefs(updated);
      if (prefs.mood_reminder) {
        await scheduleMoodReminder(time);
      }
    } catch {
      Alert.alert('Error', 'Could not update reminder time.');
    } finally {
      setSaving(false);
    }
  }

  async function togglePref(key: 'crisis_alerts' | 'message_alerts', value: boolean) {
    if (!prefs) return;
    setSaving(true);
    try {
      const updated = await notificationsApi.updatePreferences({ [key]: value });
      setPrefs(updated);
    } catch {
      Alert.alert('Error', 'Could not update preference.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#5B2D8E" />
      </View>
    );
  }

  if (!prefs) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Could not load preferences.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {saving && (
        <View style={styles.savingBar}>
          <Text style={styles.savingText}>Saving…</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Daily mood reminder</Text>
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Text style={styles.rowLabel}>Remind me daily</Text>
            <Text style={styles.rowSub}>We'll nudge you to log your mood</Text>
          </View>
          <Switch
            value={prefs.mood_reminder}
            onValueChange={toggleMoodReminder}
            trackColor={{ true: '#5B2D8E' }}
            thumbColor={Platform.OS === 'android' ? '#fff' : undefined}
            disabled={saving}
          />
        </View>

        {prefs.mood_reminder && (
          <>
            <Text style={styles.timeLabel}>Reminder time</Text>
            <View style={styles.timeGrid}>
              {TIMES.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.timeBtn, prefs.reminder_time.startsWith(t) && styles.timeBtnActive]}
                  onPress={() => setReminderTime(t)}
                  disabled={saving}
                >
                  <Text style={[styles.timeBtnText, prefs.reminder_time.startsWith(t) && styles.timeBtnTextActive]}>
                    {formatTime(t)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Other notifications</Text>
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Text style={styles.rowLabel}>Crisis alerts</Text>
            <Text style={styles.rowSub}>Shown when crisis language is detected</Text>
          </View>
          <Switch
            value={prefs.crisis_alerts}
            onValueChange={(v) => togglePref('crisis_alerts', v)}
            trackColor={{ true: '#5B2D8E' }}
            thumbColor={Platform.OS === 'android' ? '#fff' : undefined}
            disabled={saving}
          />
        </View>
        <View style={[styles.row, styles.rowLast]}>
          <View style={styles.rowLeft}>
            <Text style={styles.rowLabel}>Message alerts</Text>
            <Text style={styles.rowSub}>New messages from professionals</Text>
          </View>
          <Switch
            value={prefs.message_alerts}
            onValueChange={(v) => togglePref('message_alerts', v)}
            trackColor={{ true: '#5B2D8E' }}
            thumbColor={Platform.OS === 'android' ? '#fff' : undefined}
            disabled={saving}
          />
        </View>
      </View>

      <Text style={styles.note}>
        Reminders are scheduled on your device. You can turn them off at any time from here or your phone's notification settings.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F3FF' },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7F3FF' },
  errorText: { color: '#999', fontSize: 14 },
  savingBar: {
    backgroundColor: '#E8D9FF', borderRadius: 8, padding: 8,
    alignItems: 'center', marginBottom: 12,
  },
  savingText: { color: '#5B2D8E', fontSize: 13 },
  section: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 20 },
  sectionTitle: {
    fontSize: 13, fontWeight: '600', color: '#999',
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F7F3FF',
  },
  rowLast: { borderBottomWidth: 0 },
  rowLeft: { flex: 1, marginRight: 12 },
  rowLabel: { fontSize: 15, color: '#1a1a1a', fontWeight: '500' },
  rowSub: { fontSize: 12, color: '#999', marginTop: 2 },
  timeLabel: { fontSize: 13, color: '#555', fontWeight: '600', marginTop: 14, marginBottom: 10 },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeBtn: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1.5, borderColor: '#D0BEF5', backgroundColor: '#F7F3FF',
  },
  timeBtnActive: { backgroundColor: '#5B2D8E', borderColor: '#5B2D8E' },
  timeBtnText: { fontSize: 13, color: '#5B2D8E', fontWeight: '500' },
  timeBtnTextActive: { color: '#fff' },
  note: {
    fontSize: 12, color: '#bbb', textAlign: 'center', lineHeight: 18, paddingHorizontal: 8,
  },
});
