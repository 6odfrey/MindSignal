import { api } from './client';

export interface Mood {
  id: string;
  score: number;
  note: string | null;
  tags: string[];
  crisis_flagged: boolean;
  created_at: string;
}

export interface CrisisResource {
  name: string;
  phone: string | null;
  text_number: string | null;
  available_hours: string;
}

export interface CreateMoodResponse {
  mood: Mood;
  crisis_alert?: {
    message: string;
    resources: CrisisResource[];
  };
}

export interface MoodAnalytics {
  total_entries: number;
  average_score: number;
  highest_score: number;
  lowest_score: number;
  crisis_flags: number;
  trend: 'improving' | 'declining' | 'stable';
  daily_averages: { date: string; avg_score: number }[];
}

export const moodsApi = {
  create: (score: number, note?: string, tags?: string[]) =>
    api.post<CreateMoodResponse>('/moods', { score, note, tags }),

  list: (limit = 20, offset = 0) =>
    api.get<{ moods: Mood[]; total: number }>(`/moods?limit=${limit}&offset=${offset}`),

  analytics: (days = 30) =>
    api.get<MoodAnalytics>(`/moods/analytics?days=${days}`),

  delete: (id: string) => api.delete<void>(`/moods/${id}`),
};
