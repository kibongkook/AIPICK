'use client';

import { useState, useCallback, useEffect } from 'react';
import { DAILY_FREE_EXECUTIONS } from '@/lib/constants';

export interface ExecutionStatus {
  daily_free_used: number;
  daily_free_limit: number;
  remaining_free: number;
  logged_in: boolean;
  loading: boolean;
}

/** 실행 상태 관리 훅 */
export function useExecutionStatus() {
  const [status, setStatus] = useState<ExecutionStatus>({
    daily_free_used: 0,
    daily_free_limit: DAILY_FREE_EXECUTIONS,
    remaining_free: DAILY_FREE_EXECUTIONS,
    logged_in: false,
    loading: true,
  });

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/recipe/status');
      if (!res.ok) return;
      const data = await res.json();
      setStatus({
        daily_free_used: data.daily_free_used ?? 0,
        daily_free_limit: data.daily_free_limit ?? DAILY_FREE_EXECUTIONS,
        remaining_free: data.remaining_free ?? DAILY_FREE_EXECUTIONS,
        logged_in: data.logged_in ?? false,
        loading: false,
      });
    } catch {
      setStatus((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const decrement = useCallback(() => {
    setStatus((prev) => ({
      ...prev,
      daily_free_used: prev.daily_free_used + 1,
      remaining_free: Math.max(0, prev.remaining_free - 1),
    }));
  }, []);

  return { status, refresh, decrement };
}
