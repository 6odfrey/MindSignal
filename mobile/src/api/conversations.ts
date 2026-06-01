import { api } from './client';

export interface ConversationSummary {
  id: string;
  professional_id: string;
  professional_name: string;
  professional_type: string;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_type: 'user' | 'professional';
  content: string;
  read_at: string | null;
  created_at: string;
}

export const conversationsApi = {
  start: (professional_id: string) =>
    api.post<{ id: string }>('/conversations', { professional_id }),

  list: () =>
    api.get<{ conversations: ConversationSummary[] }>('/conversations'),

  getMessages: (id: string, limit = 50, offset = 0) =>
    api.get<{ messages: Message[]; total: number }>(
      `/conversations/${id}?limit=${limit}&offset=${offset}`
    ),

  send: (id: string, content: string) =>
    api.post<Message>(`/conversations/${id}/messages`, { content }),
};
