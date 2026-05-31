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

// Extends Express Request with authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}
