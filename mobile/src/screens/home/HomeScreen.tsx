import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { moodsApi, type MoodAnalytics, type Mood } from '../../api/moods';
import { useAuth } from '../../context/AuthContext';
import type { TabParams } from '../../navigation';

type Props = BottomTabScreenProps<TabParams, 'Home'>;

const TREND_EMOJI = { improving: '📈', stable: '➡️', declining: '📉' } as const;
const SCORE_LABEL: Record<number, string> = {
  1: 'Very low', 2: 'Low', 3: 'Struggling', 4: 'Below average', 5: 'Neutral',
  6: 'Okay', 7: 'Good', 8: 'Great', 9: 'Excellent', 10: 'Amazing',
};

export default function HomeScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<MoodAnalytics | null>(null);
  const [recent, setRecent] = useState<Mood[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    try {
      const [ana, moodRes] = await Promise.all([
        moodsApi.analytics(7),
        moodsApi.list(5, 0),
      ]);
      setAnalytics(ana);
      setRecent(moodRes.moods);
    } catch {
      // fail silently — new user may have no data
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useFocusEffect(useCallback(() => { load(); }, []));

  function onRefresh() {
    setRefreshing(true);
    load();
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#5B2D8E" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#5B2D8E" />}
    >
      <Text style={styles.greeting}>
        Hey{user ? ` ${user.email.split('@')[0]}` : ''} 👋
      </Text>
      <Text style={styles.subheading}>How have you been?</Text>

      {analytics && analytics.total_entries > 0 ? (
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{analytics.average_score.toFixed(1)}</Text>
            <Text style={styles.statLabel}>7-day avg</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{TREND_EMOJI[analytics.trend]}</Text>
            <Text style={styles.statLabel}>{analytics.trend}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{analytics.total_entries}</Text>
            <Text style={styles.statLabel}>entries</Text>
          </View>
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No mood entries yet. Log your first one below.</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.logBtn}
        onPress={() => navigation.navigate('LogMood')}
        activeOpacity={0.85}
      >
        <Text style={styles.logBtnText}>+ Log today's mood</Text>
      </TouchableOpacity>

      {recent.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Recent entries</Text>
          {recent.map((m) => (
            <View key={m.id} style={styles.moodRow}>
              <View style={[styles.scoreBadge, { backgroundColor: scoreColor(m.score) }]}>
                <Text style={styles.scoreText}>{m.score}</Text>
              </View>
              <View style={styles.moodMeta}>
                <Text style={styles.moodLabel}>{SCORE_LABEL[m.score] ?? ''}</Text>
                <Text style={styles.moodDate}>{formatDate(m.created_at)}</Text>
              </View>
              {m.crisis_flagged && <Text style={styles.crisisTag}>crisis</Text>}
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

function scoreColor(score: number): string {
  if (score <= 3) return '#FFD6D6';
  if (score <= 5) return '#FFF3CD';
  if (score <= 7) return '#D6F0FF';
  return '#D6F5D6';
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F3FF' },
  content: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 32 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7F3FF' },
  greeting: { fontSize: 26, fontWeight: '700', color: '#1a1a1a' },
  subheading: { fontSize: 15, color: '#888', marginTop: 4, marginBottom: 24 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 16,
    alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  statValue: { fontSize: 22, fontWeight: '700', color: '#5B2D8E' },
  statLabel: { fontSize: 12, color: '#999', marginTop: 4 },
  emptyCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 20,
    marginBottom: 24, alignItems: 'center',
  },
  emptyText: { color: '#999', fontSize: 14, textAlign: 'center' },
  logBtn: {
    backgroundColor: '#5B2D8E', borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginBottom: 32,
  },
  logBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1a1a1a', marginBottom: 12 },
  moodRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 12, padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
  },
  scoreBadge: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  scoreText: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  moodMeta: { flex: 1, marginLeft: 12 },
  moodLabel: { fontSize: 14, fontWeight: '500', color: '#1a1a1a' },
  moodDate: { fontSize: 12, color: '#999', marginTop: 2 },
  crisisTag: {
    backgroundColor: '#FFD6D6', color: '#C0392B', fontSize: 11,
    fontWeight: '600', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
});
