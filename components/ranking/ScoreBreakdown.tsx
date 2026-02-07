interface ScoreBreakdownProps {
  hybridScore: number;
  internalScore: number;
  externalScore: number;
}

export default function ScoreBreakdown({ hybridScore, internalScore, externalScore }: ScoreBreakdownProps) {
  const total = internalScore + externalScore || 1;
  const internalPct = Math.round((internalScore / total) * 100);
  const externalPct = 100 - internalPct;

  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <h4 className="text-xs font-bold text-foreground mb-3">점수 구성</h4>

      <div className="text-center mb-3">
        <span className="text-2xl font-extrabold text-primary">{hybridScore.toFixed(1)}</span>
        <span className="text-xs text-gray-400 ml-1">/ 100</span>
      </div>

      {/* 바 차트 */}
      <div className="flex h-2 rounded-full overflow-hidden bg-gray-100 mb-2">
        <div
          className="bg-blue-500 transition-all"
          style={{ width: `${internalPct}%` }}
        />
        <div
          className="bg-emerald-500 transition-all"
          style={{ width: `${externalPct}%` }}
        />
      </div>

      <div className="flex justify-between text-[11px]">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-blue-500" />
          사용자 평가 {internalScore.toFixed(1)}
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          외부 데이터 {externalScore.toFixed(1)}
        </span>
      </div>
    </div>
  );
}
