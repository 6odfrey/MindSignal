export interface User {
  id: string;
  email: string;
  password_hash: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  timezone: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserWithProfile extends Omit<User, 'password_hash'> {
  profile: UserProfile | null;
}

export interface Mood {
  id: string;
  user_id: string;
  score: number;
  note: string | null;
  tags: string[];
  crisis_flagged: boolean;
  created_at: Date;
}

export interface CrisisResource {
  id: string;
  name: string;
  description: string | null;
  phone: string | null;
  text_number: string | null;
  url: string | null;
  available_hours: string;
  created_at: Date;
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

export interface AuthTokenPayload {
  userId: string;
  email: string;
}

export interface RegisterBody {
  email: string;
  password: string;
  display_name?: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface UpdateProfileBody {
  display_name?: string;
  bio?: string;
  timezone?: string;
}

export interface CreateMoodBody {
  score: number;
  note?: string;
  tags?: string[];
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}
