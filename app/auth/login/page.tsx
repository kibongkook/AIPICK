'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { useEffect } from 'react';

export default function LoginPage() {
  const { user, signIn, signInDemo } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.replace('/');
  }, [user, router]);

  return (
    <div className="mx-auto max-w-sm px-4 py-20">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">로그인</h1>
        <p className="mt-2 text-sm text-gray-500">AIPICK에 로그인하고 리뷰, 북마크, 컬렉션을 이용하세요.</p>
      </div>

      <div className="mt-8 space-y-3">
        {/* Google */}
        <button
          onClick={() => signIn('google')}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google로 계속하기
        </button>

        {/* GitHub */}
        <button
          onClick={() => signIn('github')}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          GitHub로 계속하기
        </button>

        {/* Kakao */}
        <button
          onClick={() => signIn('kakao')}
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#FEE500] px-4 py-3 text-sm font-medium text-[#3C1E1E] hover:bg-[#FDD835] transition-colors"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#3C1E1E">
            <path d="M12 3C6.48 3 2 6.48 2 10.8c0 2.76 1.84 5.18 4.6 6.56-.16.56-.58 2.04-.66 2.36-.1.4.15.39.31.28.13-.08 2.04-1.38 2.86-1.94.58.08 1.18.14 1.8.14h.18c5.52 0 10-3.48 10-7.8S17.52 3 12 3z"/>
          </svg>
          카카오로 계속하기
        </button>
      </div>

      <div className="mt-6 text-center">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative bg-white px-3">
            <span className="text-xs text-gray-400">또는</span>
          </div>
        </div>
      </div>

      {/* 데모 로그인 */}
      <button
        onClick={signInDemo}
        className="mt-4 w-full rounded-xl border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500 hover:border-primary hover:text-primary transition-colors"
      >
        데모 계정으로 체험하기
      </button>

      <p className="mt-6 text-center text-xs text-gray-400">
        로그인 시 AIPICK의 이용약관과 개인정보 처리방침에 동의합니다.
      </p>
    </div>
  );
}
