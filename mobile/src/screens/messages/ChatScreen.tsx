import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { conversationsApi, type Message } from '../../api/conversations';
import type { MessagesStackParams } from '../../navigation';

type Props = NativeStackScreenProps<MessagesStackParams, 'Chat'>;

export default function ChatScreen({ route }: Props) {
  const { conversationId } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  async function loadMessages() {
    try {
      const res = await conversationsApi.getMessages(conversationId);
      setMessages(res.messages);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 100);
    } catch {
      // fail silently
    } finally {
      setLoading(false);
    }
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    setSending(true);
    try {
      const msg = await conversationsApi.send(conversationId, text);
      setMessages((prev) => [...prev, msg]);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    } catch {
      setInput(text); // restore on failure
    } finally {
      setSending(false);
    }
  }

  function renderMessage({ item }: { item: Message }) {
    const isUser = item.sender_type === 'user';
    return (
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubblePro]}>
        <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextPro]}>
          {item.content}
        </Text>
        <Text style={[styles.bubbleTime, isUser ? styles.bubbleTimeUser : styles.bubbleTimePro]}>
          {formatTime(item.created_at)}
        </Text>
      </View>
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>No messages yet. Send the first one!</Text>
          </View>
        }
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Type a message…"
          placeholderTextColor="#bbb"
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={2000}
          returnKeyType="send"
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!input.trim() || sending}
        >
          <Text style={styles.sendBtnText}>↑</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F3FF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7F3FF' },
  messageList: { padding: 16, paddingBottom: 8 },
  bubble: {
    maxWidth: '78%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10,
    marginBottom: 8,
  },
  bubbleUser: { alignSelf: 'flex-end', backgroundColor: '#5B2D8E', borderBottomRightRadius: 4 },
  bubblePro: { alignSelf: 'flex-start', backgroundColor: '#fff', borderBottomLeftRadius: 4,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  bubbleText: { fontSize: 15, lineHeight: 21 },
  bubbleTextUser: { color: '#fff' },
  bubbleTextPro: { color: '#1a1a1a' },
  bubbleTime: { fontSize: 11, marginTop: 4 },
  bubbleTimeUser: { color: 'rgba(255,255,255,0.6)', textAlign: 'right' },
  bubbleTimePro: { color: '#bbb' },
  emptyWrap: { alignItems: 'center', paddingTop: 80 },
  emptyText: { color: '#bbb', fontSize: 14 },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 12,
    paddingVertical: 10, backgroundColor: '#fff', borderTopWidth: 1,
    borderTopColor: '#F0E8FF',
  },
  input: {
    flex: 1, backgroundColor: '#F7F3FF', borderRadius: 22, paddingHorizontal: 16,
    paddingVertical: 10, fontSize: 15, color: '#1a1a1a', maxHeight: 100,
    marginRight: 8,
  },
  sendBtn: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: '#5B2D8E',
    justifyContent: 'center', alignItems: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#D0BEF5' },
  sendBtnText: { color: '#fff', fontSize: 20, fontWeight: '700', marginTop: -2 },
});
