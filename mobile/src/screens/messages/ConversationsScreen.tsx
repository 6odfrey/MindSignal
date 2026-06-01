import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { conversationsApi, type ConversationSummary } from '../../api/conversations';
import type { MessagesStackParams } from '../../navigation';

type Nav = NativeStackNavigationProp<MessagesStackParams>;

export default function ConversationsScreen() {
  const navigation = useNavigation<Nav>();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    try {
      const res = await conversationsApi.list();
      setConversations(res.conversations);
    } catch {
      // fail silently
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

  function renderItem({ item }: { item: ConversationSummary }) {
    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() => navigation.navigate('Chat', {
          conversationId: item.id,
          professionalName: item.professional_name,
        })}
        activeOpacity={0.75}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarLetter}>{item.professional_name[0]}</Text>
        </View>
        <View style={styles.meta}>
          <View style={styles.topRow}>
            <Text style={styles.name}>{item.professional_name}</Text>
            {item.last_message_at && (
              <Text style={styles.time}>{formatTime(item.last_message_at)}</Text>
            )}
          </View>
          <Text style={styles.type}>{formatType(item.professional_type)}</Text>
          {item.last_message && (
            <Text style={styles.preview} numberOfLines={1}>{item.last_message}</Text>
          )}
        </View>
        {item.unread_count > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.unread_count}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#5B2D8E" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Messages</Text>
      <FlatList
        data={conversations}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#5B2D8E" />}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptyText}>
              Find a professional and start a conversation from their profile.
            </Text>
          </View>
        }
      />
    </View>
  );
}

function formatType(t: string) {
  return t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  return isToday
    ? d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F3FF', paddingTop: 56 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7F3FF' },
  heading: { fontSize: 24, fontWeight: '700', color: '#1a1a1a', paddingHorizontal: 20, marginBottom: 8 },
  list: { paddingHorizontal: 20, paddingBottom: 32 },
  row: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 14, padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  avatar: {
    width: 46, height: 46, borderRadius: 23, backgroundColor: '#E8D9FF',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  avatarLetter: { fontSize: 20, fontWeight: '700', color: '#5B2D8E' },
  meta: { flex: 1 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  time: { fontSize: 12, color: '#bbb' },
  type: { fontSize: 12, color: '#5B2D8E', marginTop: 1 },
  preview: { fontSize: 13, color: '#999', marginTop: 3 },
  badge: {
    backgroundColor: '#5B2D8E', borderRadius: 10, minWidth: 20,
    height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 5,
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  emptyWrap: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 17, fontWeight: '600', color: '#1a1a1a', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#999', textAlign: 'center', lineHeight: 20 },
});
