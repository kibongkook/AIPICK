'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  provider: 'google' | 'github' | 'kakao' | 'demo';
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (provider: 'google' | 'github' | 'kakao') => void;
  signInDemo: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signIn: () => {},
  signInDemo: () => {},
  signOut: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

const DEMO_USER: User = {
  id: 'demo-user-001',
  email: 'demo@aipick.kr',
  name: '데모 사용자',
  avatar_url: null,
  provider: 'demo',
  created_at: new Date().toISOString(),
};

const STORAGE_KEY = 'aipick_auth_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 초기 로드: localStorage에서 사용자 복원
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
    setIsLoading(false);
  }, []);

  const signIn = useCallback((provider: 'google' | 'github' | 'kakao') => {
    // Supabase 연동 시 실제 OAuth 플로우 실행
    // 현재는 데모 로그인으로 대체
    const demoUser: User = {
      ...DEMO_USER,
      provider,
      name: `${provider === 'google' ? 'Google' : provider === 'github' ? 'GitHub' : 'Kakao'} 사용자`,
    };
    setUser(demoUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demoUser));
  }, []);

  const signInDemo = useCallback(() => {
    setUser(DEMO_USER);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_USER));
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signInDemo, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
