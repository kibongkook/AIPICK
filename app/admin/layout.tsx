'use client';

import { useAuth } from '@/lib/auth/AuthContext';
import { Shield } from 'lucide-react';
import type { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-gray-400">로딩 중...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <Shield className="mx-auto h-16 w-16 text-gray-300" />
        <h1 className="mt-4 text-xl font-bold text-foreground">관리자 접근 필요</h1>
        <p className="mt-2 text-sm text-gray-500">
          관리자 대시보드에 접근하려면 로그인이 필요합니다.
        </p>
        <a
          href="/auth/login"
          className="mt-4 inline-block rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
        >
          로그인
        </a>
      </div>
    );
  }

  return <>{children}</>;
}
