import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Alert, KeyboardAvoidingView, Platform, Modal,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { moodsApi, type CrisisResource } from '../../api/moods';
import type { LogMoodStackParams } from '../../navigation';

type Props = NativeStackScreenProps<LogMoodStackParams, 'LogMood'>;

const TAGS = ['anxious', 'sad', 'tired', 'angry', 'calm', 'happy', 'stressed', 'grateful', 'lonely', 'hopeful'];
const SCORE_LABEL: Record<number, string> = {
  1: 'Very low', 2: 'Low', 3: 'Struggling', 4: 'Below average', 5: 'Neutral',
  6: 'Okay', 7: 'Good', 8: 'Great', 9: 'Excellent', 10: 'Amazing',
};

export default function LogMoodScreen({ navigation }: Props) {
  const [score, setScore] = useState(5);
  const [note, setNote] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [crisisResources, setCrisisResources] = useState<CrisisResource[]>([]);
  const [crisisMessage, setCrisisMessage] = useState('');
  const [showCrisis, setShowCrisis] = useState(false);

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      const res = await moodsApi.create(score, note.trim() || undefined, selectedTags);
      if (res.crisis_alert) {
        setCrisisMessage(res.crisis_alert.message);
        setCrisisResources(res.crisis_alert.resources);
        setShowCrisis(true);
      } else {
        Alert.alert('Logged', 'Your mood has been saved.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Could not save mood.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>How are you feeling?</Text>

        {/* Score picker */}
        <View style={styles.scoreRow}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <TouchableOpacity
              key={n}
              style={[styles.scoreBtn, score === n && styles.scoreBtnActive]}
              onPress={() => setScore(n)}
            >
              <Text style={[styles.scoreBtnText, score === n && styles.scoreBtnTextActive]}>
                {n}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.scoreLabel}>{SCORE_LABEL[score]}</Text>

        {/* Tags */}
        <Text style={styles.sectionLabel}>Tags (optional)</Text>
        <View style={styles.tagsRow}>
          {TAGS.map((tag) => (
            <TouchableOpacity
              key={tag}
              style={[styles.tag, selectedTags.includes(tag) && styles.tagActive]}
              onPress={() => toggleTag(tag)}
            >
              <Text style={[styles.tagText, selectedTags.includes(tag) && styles.tagTextActive]}>
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Note */}
        <Text style={styles.sectionLabel}>Note (optional)</Text>
        <TextInput
          style={styles.noteInput}
          placeholder="How's your day been? What's on your mind?"
          placeholderTextColor="#bbb"
          multiline
          maxLength={1000}
          value={note}
          onChangeText={setNote}
        />
        <Text style={styles.charCount}>{note.length}/1000</Text>

        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitBtnText}>{loading ? 'Saving…' : 'Save mood'}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Crisis modal */}
      <Modal visible={showCrisis} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>You're not alone</Text>
            <Text style={styles.modalMessage}>{crisisMessage}</Text>
            {crisisResources.map((r) => (
              <View key={r.name} style={styles.resourceRow}>
                <Text style={styles.resourceName}>{r.name}</Text>
                {r.phone && <Text style={styles.resourceContact}>{r.phone}</Text>}
                {r.text_number && <Text style={styles.resourceContact}>{r.text_number}</Text>}
                <Text style={styles.resourceHours}>{r.available_hours}</Text>
              </View>
            ))}
            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => {
                setShowCrisis(false);
                navigation.goBack();
              }}
            >
              <Text style={styles.modalBtnText}>I understand, close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F3FF' },
  content: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 },
  heading: { fontSize: 22, fontWeight: '700', color: '#1a1a1a', marginBottom: 24 },
  scoreRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  scoreBtn: {
    width: 44, height: 44, borderRadius: 22, borderWidth: 1.5,
    borderColor: '#D0BEF5', justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#fff',
  },
  scoreBtnActive: { backgroundColor: '#5B2D8E', borderColor: '#5B2D8E' },
  scoreBtnText: { fontSize: 15, fontWeight: '600', color: '#5B2D8E' },
  scoreBtnTextActive: { color: '#fff' },
  scoreLabel: { fontSize: 14, color: '#888', marginBottom: 24, textAlign: 'center' },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 10 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  tag: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1.5, borderColor: '#D0BEF5', backgroundColor: '#fff',
  },
  tagActive: { backgroundColor: '#5B2D8E', borderColor: '#5B2D8E' },
  tagText: { fontSize: 13, color: '#5B2D8E', fontWeight: '500' },
  tagTextActive: { color: '#fff' },
  noteInput: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#E0D7F5',
    borderRadius: 12, padding: 14, fontSize: 15, color: '#1a1a1a',
    minHeight: 100, textAlignVertical: 'top',
  },
  charCount: { fontSize: 11, color: '#bbb', textAlign: 'right', marginTop: 4, marginBottom: 24 },
  submitBtn: {
    backgroundColor: '#5B2D8E', borderRadius: 14, paddingVertical: 16, alignItems: 'center',
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 28, paddingBottom: 40,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1a1a1a', marginBottom: 10 },
  modalMessage: { fontSize: 14, color: '#555', marginBottom: 20, lineHeight: 20 },
  resourceRow: {
    backgroundColor: '#F7F3FF', borderRadius: 12, padding: 14, marginBottom: 10,
  },
  resourceName: { fontSize: 14, fontWeight: '700', color: '#5B2D8E' },
  resourceContact: { fontSize: 16, fontWeight: '600', color: '#1a1a1a', marginTop: 4 },
  resourceHours: { fontSize: 12, color: '#888', marginTop: 2 },
  modalBtn: {
    backgroundColor: '#5B2D8E', borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', marginTop: 8,
  },
  modalBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
