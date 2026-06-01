import { api } from './client';

export interface LoginResponse {
  token: string;
  user: { id: string; email: string };
}

export interface RegisterResponse {
  token: string;
  user: { id: string; email: string };
}

export const authApi = {
  login: (email: string, password: string) =>
    api.post<LoginResponse>('/auth/login', { email, password }),

  register: (email: string, password: string, display_name?: string) =>
    api.post<RegisterResponse>('/auth/register', { email, password, display_name }),

  verify: () => api.get<{ valid: boolean }>('/auth/verify'),
};
