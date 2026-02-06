'use client';

import { useRouter } from 'next/navigation';
import { LogIn, X } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  message?: string;
}

/** 로그인 필요 시 로그인 유도 UI를 표시합니다 */
export default function AuthGuard({ children, fallback, message = '이 기능을 사용하려면 로그인이 필요합니다.' }: AuthGuardProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (user) return <>{children}</>;
  if (fallback) return <>{fallback}</>;

  return <LoginPrompt message={message} />;
}

/** 로그인 유도 모달/배너 */
export function LoginPrompt({ message, onClose }: { message: string; onClose?: () => void }) {
  const router = useRouter();

  return (
    <div className="rounded-xl border border-border bg-gray-50 p-6 text-center">
      {onClose && (
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
          <X className="h-4 w-4" />
        </button>
      )}
      <LogIn className="mx-auto h-8 w-8 text-gray-400" />
      <p className="mt-3 text-sm text-gray-600">{message}</p>
      <button
        onClick={() => router.push('/auth/login')}
        className="mt-4 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
      >
        로그인하기
      </button>
    </div>
  );
}
