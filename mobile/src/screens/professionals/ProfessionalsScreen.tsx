import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { professionalsApi, type Professional } from '../../api/professionals';
import { conversationsApi } from '../../api/conversations';
import type { TabParams, MessagesStackParams } from '../../navigation';

type Props = BottomTabScreenProps<TabParams, 'Professionals'>;
type MessagesNav = NativeStackNavigationProp<MessagesStackParams>;

const DELIVERY_FILTERS = [
  { label: 'All', value: undefined },
  { label: 'Online', value: 'online' },
  { label: 'In person', value: 'in_person' },
  { label: 'Both', value: 'both' },
] as const;

export default function ProfessionalsScreen({ navigation: _navigation }: Props) {
  const messagesNav = useNavigation<MessagesNav>();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [deliveryFilter, setDeliveryFilter] = useState<string | undefined>(undefined);
  const [nhsOnly, setNhsOnly] = useState(false);

  async function load() {
    try {
      const res = await professionalsApi.list({
        delivery_method: deliveryFilter as Professional['delivery_method'],
        nhs_funded: nhsOnly || undefined,
        location: search.trim() || undefined,
        accepting_only: true,
        limit: 50,
      });
      setProfessionals(res.professionals);
    } catch {
      // fail silently
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useFocusEffect(useCallback(() => { load(); }, [deliveryFilter, nhsOnly, search]));

  function onRefresh() {
    setRefreshing(true);
    load();
  }

  async function handleMessage(pro: Professional) {
    try {
      const conv = await conversationsApi.start(pro.id);
      messagesNav.navigate('Chat', {
        conversationId: conv.id,
        professionalName: pro.name,
      });
    } catch {
      Alert.alert('Error', 'Could not start conversation. Please try again.');
    }
  }

  function toggleSave(pro: Professional) {
    const action = pro.is_saved ? professionalsApi.unsave : professionalsApi.save;
    action(pro.id).then(() => {
      setProfessionals((prev) =>
        prev.map((p) => p.id === pro.id ? { ...p, is_saved: !p.is_saved } : p)
      );
    }).catch(() => {});
  }

  function renderItem({ item }: { item: Professional }) {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.type}>{formatType(item.profession_type)}</Text>
          </View>
          <TouchableOpacity onPress={() => toggleSave(item)} style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>{item.is_saved ? '♥' : '♡'}</Text>
          </TouchableOpacity>
        </View>

        {item.bio && <Text style={styles.bio} numberOfLines={3}>{item.bio}</Text>}

        <View style={styles.tagRow}>
          {item.specializations.slice(0, 3).map((s) => (
            <View key={s} style={styles.pill}>
              <Text style={styles.pillText}>{s.replace(/_/g, ' ')}</Text>
            </View>
          ))}
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.meta}>{deliveryLabel(item.delivery_method)}</Text>
          {item.location && <Text style={styles.meta}> · {item.location}</Text>}
          {item.nhs_funded && <Text style={styles.nhsBadge}> NHS</Text>}
          {!item.accepting_clients && <Text style={styles.closedBadge}> Not accepting</Text>}
        </View>

        <View style={styles.actionRow}>
          {item.booking_url && (
            <Text style={styles.bookingNote}>Booking available</Text>
          )}
          <TouchableOpacity style={styles.msgBtn} onPress={() => handleMessage(item)}>
            <Text style={styles.msgBtnText}>Message</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Find support</Text>

      <TextInput
        style={styles.search}
        placeholder="Search by location (e.g. London)"
        placeholderTextColor="#bbb"
        value={search}
        onChangeText={setSearch}
        returnKeyType="search"
        onSubmitEditing={load}
      />

      <View style={styles.filterRow}>
        {DELIVERY_FILTERS.map((f) => (
          <TouchableOpacity
            key={String(f.value)}
            style={[styles.filter, deliveryFilter === f.value && styles.filterActive]}
            onPress={() => setDeliveryFilter(f.value)}
          >
            <Text style={[styles.filterText, deliveryFilter === f.value && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.filter, nhsOnly && styles.filterActive]}
          onPress={() => setNhsOnly((v) => !v)}
        >
          <Text style={[styles.filterText, nhsOnly && styles.filterTextActive]}>NHS</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#5B2D8E" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={professionals}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#5B2D8E" />}
          ListEmptyComponent={
            <Text style={styles.empty}>No professionals found. Try adjusting your filters.</Text>
          }
        />
      )}
    </View>
  );
}

function formatType(t: string) {
  return t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function deliveryLabel(d: string) {
  return { online: 'Online', in_person: 'In person', both: 'Online & in person' }[d] ?? d;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F3FF', paddingTop: 56 },
  heading: { fontSize: 24, fontWeight: '700', color: '#1a1a1a', paddingHorizontal: 20, marginBottom: 14 },
  search: {
    marginHorizontal: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E0D7F5',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14,
    color: '#1a1a1a', marginBottom: 12,
  },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginBottom: 16, flexWrap: 'wrap' },
  filter: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    borderWidth: 1.5, borderColor: '#D0BEF5', backgroundColor: '#fff',
  },
  filterActive: { backgroundColor: '#5B2D8E', borderColor: '#5B2D8E' },
  filterText: { fontSize: 13, color: '#5B2D8E', fontWeight: '500' },
  filterTextActive: { color: '#fff' },
  list: { paddingHorizontal: 20, paddingBottom: 32 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  name: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  type: { fontSize: 13, color: '#5B2D8E', marginTop: 2 },
  saveBtn: { padding: 4 },
  saveBtnText: { fontSize: 22, color: '#5B2D8E' },
  bio: { fontSize: 13, color: '#666', lineHeight: 18, marginBottom: 10 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  pill: {
    backgroundColor: '#F0E8FF', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4,
  },
  pillText: { fontSize: 11, color: '#5B2D8E', fontWeight: '500' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  meta: { fontSize: 12, color: '#888' },
  nhsBadge: { fontSize: 11, color: '#fff', backgroundColor: '#005EB8', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, overflow: 'hidden', fontWeight: '600' },
  closedBadge: { fontSize: 11, color: '#888', backgroundColor: '#eee', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, overflow: 'hidden' },
  actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  bookingNote: { fontSize: 12, color: '#5B2D8E', fontWeight: '500' },
  msgBtn: {
    backgroundColor: '#5B2D8E', borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 7,
  },
  msgBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  empty: { textAlign: 'center', color: '#bbb', marginTop: 40, fontSize: 14 },
});
