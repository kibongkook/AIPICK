'use client';

import { Zap } from 'lucide-react';
import { DAILY_FREE_EXECUTIONS, EXECUTION_PRICE_KRW } from '@/lib/constants';

interface ExecutionCounterProps {
  remaining: number;
  loading?: boolean;
  compact?: boolean;
}

export default function ExecutionCounter({ remaining, loading = false, compact = false }: ExecutionCounterProps) {
  if (loading) {
    return <span className="text-xs text-gray-400 animate-pulse">확인 중...</span>;
  }

  const pct = (remaining / DAILY_FREE_EXECUTIONS) * 100;
  const color = pct > 50 ? 'text-emerald-600' : pct > 0 ? 'text-amber-600' : 'text-red-500';

  if (compact) {
    return (
      <span className={`text-xs font-medium ${color}`}>
        무료 {remaining}/{DAILY_FREE_EXECUTIONS}회
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs text-gray-500">
      <Zap className="h-3 w-3 text-yellow-500 shrink-0" />
      {remaining > 0 ? (
        <span>
          오늘 남은 무료 실행:{' '}
          <span className={`font-bold ${color}`}>{remaining}/{DAILY_FREE_EXECUTIONS}회</span>
        </span>
      ) : (
        <span>
          오늘 무료 소진 —{' '}
          <span className="font-bold text-primary">₩{EXECUTION_PRICE_KRW.toLocaleString()}/건</span>
        </span>
      )}
    </div>
  );
}
