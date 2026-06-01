import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../api/auth';

interface AuthUser {
  id: string;
  email: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const stored = await AsyncStorage.getItem('user');
        if (token && stored) setUser(JSON.parse(stored));
      } catch {
        // ignore — treat as logged out
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function login(email: string, password: string) {
    const res = await authApi.login(email, password);
    await AsyncStorage.multiSet([
      ['token', res.token],
      ['user', JSON.stringify(res.user)],
    ]);
    setUser(res.user);
  }

  async function register(email: string, password: string, displayName?: string) {
    const res = await authApi.register(email, password, displayName);
    await AsyncStorage.multiSet([
      ['token', res.token],
      ['user', JSON.stringify(res.user)],
    ]);
    setUser(res.user);
  }

  async function logout() {
    await AsyncStorage.multiRemove(['token', 'user']);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
