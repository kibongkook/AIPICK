'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';

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

/** Supabase 사용자 → AIPICK User 변환 */
function mapSupabaseUser(supabaseUser: { id: string; email?: string; user_metadata?: Record<string, string>; app_metadata?: Record<string, string>; created_at: string }): User {
  const provider = (supabaseUser.app_metadata?.provider || 'demo') as User['provider'];
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || '사용자',
    avatar_url: supabaseUser.user_metadata?.avatar_url || null,
    provider,
    created_at: supabaseUser.created_at,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabaseReady = isSupabaseConfigured();

  // 초기 로드: Supabase 세션 또는 localStorage 복원
  useEffect(() => {
    if (supabaseReady) {
      // Supabase 모드: 세션에서 사용자 복원
      const supabase = createClient();

      supabase.auth.getUser().then(({ data: { user: supabaseUser } }) => {
        if (supabaseUser) {
          setUser(mapSupabaseUser(supabaseUser));
        }
        setIsLoading(false);
      });

      // 인증 상태 변경 리스너
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser(mapSupabaseUser(session.user));
        } else {
          setUser(null);
        }
      });

      return () => subscription.unsubscribe();
    } else {
      // 데모 모드: localStorage에서 복원
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setUser(JSON.parse(stored));
        }
      } catch {
        // ignore
      }
      setIsLoading(false);
    }
  }, [supabaseReady]);

  const signIn = useCallback((provider: 'google' | 'github' | 'kakao') => {
    if (supabaseReady) {
      // Supabase OAuth 실행
      const supabase = createClient();
      supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    } else {
      // 데모 모드: 가상 사용자 생성
      const demoUser: User = {
        ...DEMO_USER,
        provider,
        name: `${provider === 'google' ? 'Google' : provider === 'github' ? 'GitHub' : 'Kakao'} 사용자`,
      };
      setUser(demoUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(demoUser));
    }
  }, [supabaseReady]);

  const signInDemo = useCallback(() => {
    setUser(DEMO_USER);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_USER));
  }, []);

  const signOut = useCallback(async () => {
    if (supabaseReady) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, [supabaseReady]);

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signInDemo, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
