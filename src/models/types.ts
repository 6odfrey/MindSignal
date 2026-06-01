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

export type ProfessionType = 'therapist' | 'counsellor' | 'psychologist' | 'psychiatrist' | 'cbt_therapist' | 'life_coach';
export type DeliveryMethod = 'online' | 'in_person' | 'both';

export interface Professional {
  id: string;
  name: string;
  bio: string | null;
  profession_type: ProfessionType;
  specializations: string[];
  delivery_method: DeliveryMethod;
  location: string | null;
  nhs_funded: boolean;
  languages: string[];
  accepting_clients: boolean;
  booking_url: string | null;
  contact_email: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ProfessionalWithSaved extends Professional {
  is_saved: boolean;
}

export interface SavedProfessional {
  id: string;
  user_id: string;
  professional_id: string;
  created_at: Date;
}

export interface ListProfessionalsQuery {
  specialization?: string;
  delivery_method?: DeliveryMethod;
  location?: string;
  nhs_funded?: string;
  profession_type?: ProfessionType;
  accepting_only?: string;
  limit?: string;
  offset?: string;
}

export type MessageSender = 'user' | 'professional';

export interface Conversation {
  id: string;
  user_id: string;
  professional_id: string;
  last_message_at: Date | null;
  created_at: Date;
}

export interface ConversationWithDetails extends Conversation {
  professional_name: string;
  professional_type: string;
  unread_count: number;
  last_message: string | null;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_type: MessageSender;
  content: string;
  read_at: Date | null;
  created_at: Date;
}

export interface SendMessageBody {
  content: string;
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
