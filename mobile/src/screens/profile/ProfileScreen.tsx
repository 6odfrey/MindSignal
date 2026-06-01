import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import type { TabParams } from '../../navigation';

type Props = BottomTabScreenProps<TabParams, 'Profile'>;

interface UserProfile {
  id: string;
  email: string;
  profile: {
    display_name: string | null;
    bio: string | null;
    timezone: string;
  } | null;
}

export default function ProfileScreen(_props: Props) {
  const { logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    try {
      const res = await api.get<UserProfile>('/users/me');
      setProfile(res);
    } catch {
      // ignore
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

  function confirmLogout() {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: logout },
    ]);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#5B2D8E" />
      </View>
    );
  }

  const displayName = profile?.profile?.display_name ?? profile?.email?.split('@')[0] ?? 'You';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#5B2D8E" />}
    >
      <View style={styles.avatarCircle}>
        <Text style={styles.avatarLetter}>{displayName[0]?.toUpperCase()}</Text>
      </View>
      <Text style={styles.name}>{displayName}</Text>
      <Text style={styles.email}>{profile?.email}</Text>

      {profile?.profile?.bio && (
        <Text style={styles.bio}>{profile.profile.bio}</Text>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Timezone</Text>
          <Text style={styles.rowValue}>{profile?.profile?.timezone ?? 'UTC'}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Crisis support</Text>
        <View style={styles.crisisCard}>
          <Text style={styles.crisisLine}>Samaritans — 116 123 (free, 24/7)</Text>
          <Text style={styles.crisisLine}>Crisis Text Line — Text SHOUT to 85258</Text>
          <Text style={styles.crisisLine}>Emergency — 999</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={confirmLogout}>
        <Text style={styles.logoutText}>Sign out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F3FF' },
  content: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 40, alignItems: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7F3FF' },
  avatarCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#5B2D8E',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  avatarLetter: { fontSize: 34, fontWeight: '700', color: '#fff' },
  name: { fontSize: 22, fontWeight: '700', color: '#1a1a1a' },
  email: { fontSize: 14, color: '#888', marginTop: 4, marginBottom: 8 },
  bio: { fontSize: 14, color: '#555', textAlign: 'center', lineHeight: 20, marginBottom: 8 },
  section: { width: '100%', marginTop: 28 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#999', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
  },
  rowLabel: { fontSize: 15, color: '#1a1a1a' },
  rowValue: { fontSize: 14, color: '#888' },
  crisisCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, gap: 6,
    borderLeftWidth: 3, borderLeftColor: '#5B2D8E',
  },
  crisisLine: { fontSize: 14, color: '#333', lineHeight: 20 },
  logoutBtn: {
    marginTop: 36, width: '100%', borderWidth: 1.5, borderColor: '#E0D7F5',
    borderRadius: 12, paddingVertical: 14, alignItems: 'center',
  },
  logoutText: { fontSize: 15, color: '#C0392B', fontWeight: '600' },
});
