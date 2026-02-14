import { cn } from '@/lib/utils';
import type { ConfidenceLevel } from '@/types';
import ConfidenceBadge from './ConfidenceBadge';

interface ScoreBreakdownProps {
  hybridScore: number;
  reviewScore?: number;
  popularityScore?: number;
  communityScore?: number;
  benchmarkScore?: number;
  confidenceLevel?: ConfidenceLevel;
  sourceCount?: number;
  /** 하위 호환: internalScore/externalScore 전달 시 레거시 모드 */
  internalScore?: number;
  externalScore?: number;
}

const CATEGORY_CONFIG = [
  { key: 'review', label: '사용자 리뷰', color: 'bg-blue-500' },
  { key: 'popularity', label: '인기도', color: 'bg-emerald-500' },
  { key: 'community', label: '커뮤니티', color: 'bg-purple-500' },
  { key: 'benchmark', label: '벤치마크', color: 'bg-amber-500' },
] as const;

export default function ScoreBreakdown({
  hybridScore,
  reviewScore = 0,
  popularityScore = 0,
  communityScore = 0,
  benchmarkScore = 0,
  confidenceLevel,
  sourceCount,
  internalScore,
  externalScore,
}: ScoreBreakdownProps) {
  // 4-카테고리 점수 배열
  const scores = [
    { ...CATEGORY_CONFIG[0], value: reviewScore },
    { ...CATEGORY_CONFIG[1], value: popularityScore },
    { ...CATEGORY_CONFIG[2], value: communityScore },
    { ...CATEGORY_CONFIG[3], value: benchmarkScore },
  ];

  const totalContrib = scores.reduce((sum, s) => sum + s.value, 0);
  const hasData = totalContrib > 0 || hybridScore > 0;

  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-bold text-foreground">점수 구성</h4>
        {confidenceLevel && confidenceLevel !== 'none' && (
          <ConfidenceBadge level={confidenceLevel} sourceCount={sourceCount} size="sm" />
        )}
      </div>

      <div className="text-center mb-3">
        {hasData ? (
          <>
            <span className="text-2xl font-extrabold text-primary">{hybridScore.toFixed(1)}</span>
            <span className="text-xs text-gray-400 ml-1">/ 100</span>
          </>
        ) : (
          <span className="text-sm text-gray-400">데이터 수집 중</span>
        )}
      </div>

      {hasData && (
        <>
          {/* 4-카테고리 바 차트 */}
          <div className="flex h-2 rounded-full overflow-hidden bg-gray-100 mb-3">
            {scores.map((s) => {
              const pct = totalContrib > 0 ? (s.value / totalContrib) * 100 : 0;
              if (pct <= 0) return null;
              return (
                <div
                  key={s.key}
                  className={cn(s.color, 'transition-all')}
                  style={{ width: `${pct}%` }}
                />
              );
            })}
          </div>

          {/* 범례 */}
          <div className="grid grid-cols-2 gap-1">
            {scores.map((s) => (
              <span key={s.key} className="flex items-center gap-1 text-[11px] text-gray-500">
                <span className={cn('h-2 w-2 rounded-full shrink-0', s.color)} />
                {s.label} {s.value > 0 ? s.value.toFixed(1) : '-'}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
