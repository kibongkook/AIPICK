import { Info } from 'lucide-react';
import type { ToolBenchmarkScore } from '@/types';
import { BENCHMARK_EXPLANATIONS, SPEED_EXPLANATIONS } from '@/lib/constants';
import { getQualityLabel } from '@/lib/utils';

interface BenchmarkScoresProps {
  benchmarks: ToolBenchmarkScore[];
}

const BENCHMARK_LABELS: Record<string, string> = {
  mmlu: 'MMLU',
  hellaswag: 'HellaSwag',
  arc_challenge: 'ARC-C',
  truthfulqa: 'TruthfulQA',
  winogrande: 'WinoGrande',
  gsm8k: 'GSM8K',
  humaneval: 'HumanEval',
};

const SOURCE_LABELS: Record<string, string> = {
  huggingface_llm: 'HuggingFace LLM 리더보드',
  lmsys_chatbot_arena: 'LMSYS Chatbot Arena',
  artificial_analysis: 'Artificial Analysis',
  stanford_helm: 'Stanford HELM',
};

export default function BenchmarkScores({ benchmarks }: BenchmarkScoresProps) {
  if (!benchmarks.length) return null;

  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <h4 className="text-xs font-bold text-foreground mb-1">AI 벤치마크 점수</h4>
      <p className="text-[10px] text-gray-400 mb-3">
        점수가 높을수록 해당 능력이 뛰어납니다
      </p>

      {benchmarks.map((benchmark) => (
        <div key={benchmark.benchmark_source} className="mb-4 last:mb-0">
          <p className="text-[11px] text-gray-400 mb-2">
            {SOURCE_LABELS[benchmark.benchmark_source] || benchmark.benchmark_source}
          </p>

          {/* ELO 등급 */}
          {benchmark.elo_rating && (() => {
            const exp = BENCHMARK_EXPLANATIONS.elo_rating;
            const quality = exp
              ? getQualityLabel(benchmark.elo_rating, exp.goodThreshold, exp.greatThreshold, exp.higherIsBetter)
              : null;
            return (
              <div className="flex items-center justify-between mb-2 px-2 py-1.5 rounded bg-gray-50">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-600">ELO Rating</span>
                  <span className="text-[9px] text-gray-400" title="사용자 선호도 순위 (높을수록 인기)">
                    <Info className="h-3 w-3 inline text-gray-300" />
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-foreground">{benchmark.elo_rating}</span>
                  {quality && (
                    <span className={`text-[9px] font-medium ${quality.color}`}>{quality.label}</span>
                  )}
                </div>
              </div>
            );
          })()}

          {/* 종합 점수 */}
          {benchmark.overall_score && (() => {
            const exp = BENCHMARK_EXPLANATIONS.overall_score;
            const quality = exp
              ? getQualityLabel(benchmark.overall_score, exp.goodThreshold, exp.greatThreshold, exp.higherIsBetter)
              : null;
            return (
              <div className="flex items-center justify-between mb-2 px-2 py-1.5 rounded bg-primary/5">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-600">종합 점수</span>
                  <span className="text-[9px] text-gray-400" title="모든 벤치마크의 종합 점수">
                    <Info className="h-3 w-3 inline text-gray-300" />
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-primary">{benchmark.overall_score.toFixed(1)}</span>
                  {quality && (
                    <span className={`text-[9px] font-medium ${quality.color}`}>{quality.label}</span>
                  )}
                </div>
              </div>
            );
          })()}

          {/* 개별 벤치마크 */}
          <div className="space-y-2">
            {Object.entries(BENCHMARK_LABELS).map(([key, label]) => {
              const score = benchmark[key as keyof ToolBenchmarkScore] as number | null;
              if (!score) return null;
              const exp = BENCHMARK_EXPLANATIONS[key];
              const quality = exp
                ? getQualityLabel(score, exp.goodThreshold, exp.greatThreshold, exp.higherIsBetter)
                : null;
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-gray-500">{label}</span>
                      {exp && (
                        <span className="text-[9px] text-gray-400" title={exp.description}>
                          <Info className="h-2.5 w-2.5 inline text-gray-300" />
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-medium text-gray-600">{score.toFixed(1)}</span>
                      {quality && (
                        <span className={`text-[9px] font-medium ${quality.color}`}>{quality.label}</span>
                      )}
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${quality?.barColor || 'bg-primary/60'}`}
                      style={{ width: `${Math.min(score, 100)}%` }}
                    />
                  </div>
                  {exp && (
                    <p className="text-[9px] text-gray-400 mt-0.5">{exp.description}</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* 속도 지표 */}
          {(benchmark.speed_ttft_ms || benchmark.speed_tps) && (
            <div className="mt-3 space-y-1 border-t border-border pt-2">
              <p className="text-[10px] text-gray-400 font-medium">응답 속도</p>
              <div className="flex gap-3">
                {benchmark.speed_ttft_ms && (() => {
                  const exp = SPEED_EXPLANATIONS.speed_ttft_ms;
                  const quality = getQualityLabel(benchmark.speed_ttft_ms, exp.goodThreshold, exp.greatThreshold, exp.higherIsBetter);
                  return (
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-gray-500">
                        첫 응답: {benchmark.speed_ttft_ms}ms
                      </span>
                      <span className={`text-[9px] font-medium ${quality.color}`}>
                        {quality.label}
                      </span>
                    </div>
                  );
                })()}
                {benchmark.speed_tps && (() => {
                  const exp = SPEED_EXPLANATIONS.speed_tps;
                  const quality = getQualityLabel(benchmark.speed_tps, exp.goodThreshold, exp.greatThreshold, exp.higherIsBetter);
                  return (
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-gray-500">
                        생성: {benchmark.speed_tps} tok/s
                      </span>
                      <span className={`text-[9px] font-medium ${quality.color}`}>
                        {quality.label}
                      </span>
                    </div>
                  );
                })()}
              </div>
              <p className="text-[9px] text-gray-300">낮은 응답시간 + 높은 생성속도 = 빠른 AI</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
