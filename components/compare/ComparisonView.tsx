import Link from 'next/link';
import { Star, Check, X, Zap, ExternalLink, TrendingUp } from 'lucide-react';
import type { Tool, ToolBenchmarkScore } from '@/types';
import { cn, getAvatarColor, formatRating } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import TrendBadge from '@/components/ranking/TrendBadge';

interface ComparisonViewProps {
  tools: Tool[];
  benchmarks: Record<string, ToolBenchmarkScore[]>;
}

export default function ComparisonView({ tools, benchmarks }: ComparisonViewProps) {
  if (tools.length < 2) return null;

  return (
    <div className="space-y-8">
      {/* 헤더: 로고 + 이름 + 가격 */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${tools.length}, 1fr)` }}>
        {tools.map((tool) => (
          <ToolHeader key={tool.id} tool={tool} />
        ))}
      </div>

      {/* 점수 비교 */}
      <CompareSection title="종합 점수">
        <CompareRow
          label="하이브리드 점수"
          values={tools.map((t) => ({
            value: (t.hybrid_score || t.ranking_score).toFixed(1),
            raw: t.hybrid_score || t.ranking_score,
          }))}
          higherIsBetter
        />
        <CompareRow
          label="사용자 평점"
          values={tools.map((t) => ({
            value: formatRating(t.rating_avg),
            raw: t.rating_avg,
          }))}
          higherIsBetter
        />
        <CompareRow
          label="리뷰 수"
          values={tools.map((t) => ({
            value: `${t.review_count}개`,
            raw: t.review_count,
          }))}
          higherIsBetter
        />
        <CompareRow
          label="트렌드"
          values={tools.map((t) => ({
            value: '',
            raw: t.trend_magnitude,
            component: <TrendBadge direction={t.trend_direction} magnitude={t.trend_magnitude} />,
          }))}
        />
      </CompareSection>

      {/* 가격 비교 */}
      <CompareSection title="가격 비교">
        <CompareRow
          label="가격 유형"
          values={tools.map((t) => ({
            value: t.pricing_type === 'Free' ? '완전 무료' : t.pricing_type === 'Freemium' ? '부분 무료' : '유료',
            raw: t.pricing_type === 'Free' ? 2 : t.pricing_type === 'Freemium' ? 1 : 0,
          }))}
          higherIsBetter
        />
        <CompareRow
          label="월 가격"
          values={tools.map((t) => ({
            value: t.monthly_price ? `$${t.monthly_price}/월` : t.pricing_type === 'Free' ? '무료' : '-',
            raw: t.monthly_price ? -t.monthly_price : 0,
          }))}
          higherIsBetter
        />
      </CompareSection>

      {/* 무료 사용량 비교 */}
      <CompareSection title="무료 사용량">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${tools.length}, 1fr)` }}>
          {tools.map((tool) => (
            <div key={tool.id} className="rounded-lg border border-border p-4">
              {tool.free_quota_detail ? (
                <div className="flex items-start gap-2">
                  <Zap className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700">{tool.free_quota_detail}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-400">무료 사용량 정보 없음</p>
              )}
            </div>
          ))}
        </div>
      </CompareSection>

      {/* 기능 비교 매트릭스 */}
      <CompareSection title="기능 비교">
        <FeatureRow label="한국어 지원" values={tools.map((t) => t.supports_korean)} />
        <FeatureRow label="에디터 추천" values={tools.map((t) => t.is_editor_pick)} />
        {tools.some((t) => t.github_stars) && (
          <CompareRow
            label="GitHub Stars"
            values={tools.map((t) => ({
              value: t.github_stars ? `${(t.github_stars / 1000).toFixed(1)}k` : '-',
              raw: t.github_stars || 0,
            }))}
            higherIsBetter
          />
        )}
      </CompareSection>

      {/* 태그 비교 */}
      <CompareSection title="태그">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${tools.length}, 1fr)` }}>
          {tools.map((tool) => (
            <div key={tool.id} className="flex flex-wrap gap-1.5">
              {tool.tags.map((tag) => (
                <span
                  key={tag}
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-medium',
                    tools.every((t) => t.tags.includes(tag))
                      ? 'bg-primary/10 text-primary'
                      : 'bg-gray-100 text-gray-600'
                  )}
                >
                  {tag}
                </span>
              ))}
            </div>
          ))}
        </div>
      </CompareSection>

      {/* 장단점 비교 */}
      <CompareSection title="장단점">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${tools.length}, 1fr)` }}>
          {tools.map((tool) => (
            <div key={tool.id} className="space-y-3">
              {tool.pros.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-emerald-600 mb-1.5">장점</p>
                  <ul className="space-y-1">
                    {tool.pros.map((pro, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-gray-700">
                        <Check className="h-3 w-3 text-emerald-500 shrink-0 mt-0.5" />
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {tool.cons.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-red-600 mb-1.5">단점</p>
                  <ul className="space-y-1">
                    {tool.cons.map((con, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-gray-700">
                        <X className="h-3 w-3 text-red-400 shrink-0 mt-0.5" />
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </CompareSection>

      {/* 벤치마크 비교 (해당 도구만) */}
      {tools.some((t) => benchmarks[t.id]?.length > 0) && (
        <CompareSection title="벤치마크 비교">
          {(() => {
            const benchmarkKeys = ['elo_rating', 'quality_index', 'mmlu', 'humaneval'] as const;
            const benchmarkLabels: Record<string, string> = {
              elo_rating: 'ELO Rating',
              quality_index: 'Quality Index',
              mmlu: 'MMLU',
              humaneval: 'HumanEval',
            };
            return benchmarkKeys.map((key) => {
              const hasData = tools.some((t) => {
                const b = benchmarks[t.id]?.[0];
                return b && b[key] !== null && b[key] !== undefined;
              });
              if (!hasData) return null;
              return (
                <CompareRow
                  key={key}
                  label={benchmarkLabels[key]}
                  values={tools.map((t) => {
                    const b = benchmarks[t.id]?.[0];
                    const val = b?.[key];
                    return {
                      value: val != null ? String(val) : '-',
                      raw: val ?? 0,
                    };
                  })}
                  higherIsBetter
                />
              );
            });
          })()}
        </CompareSection>
      )}

      {/* 상세 페이지 링크 */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${tools.length}, 1fr)` }}>
        {tools.map((tool) => (
          <Link
            key={tool.id}
            href={`/tools/${tool.slug}`}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-border px-4 py-3 text-sm font-medium text-foreground hover:bg-gray-50 transition-colors"
          >
            {tool.name} 상세 보기
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        ))}
      </div>
    </div>
  );
}

function ToolHeader({ tool }: { tool: Tool }) {
  const pricingVariant = tool.pricing_type === 'Free' ? 'free' : tool.pricing_type === 'Freemium' ? 'freemium' : 'paid';

  return (
    <div className="flex flex-col items-center text-center">
      {tool.logo_url ? (
        <img src={tool.logo_url} alt={tool.name} className="h-16 w-16 rounded-2xl object-cover" />
      ) : (
        <div className={cn('flex h-16 w-16 items-center justify-center rounded-2xl text-white text-xl font-bold', getAvatarColor(tool.name))}>
          {tool.name.charAt(0)}
        </div>
      )}
      <h3 className="mt-3 text-base font-bold text-foreground">{tool.name}</h3>
      <Badge variant={pricingVariant} className="mt-1.5">
        {tool.pricing_type === 'Free' ? '무료' : tool.pricing_type === 'Freemium' ? '부분 무료' : '유료'}
      </Badge>
      <div className="mt-2 flex items-center gap-1 text-sm text-gray-500">
        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
        <span>{formatRating(tool.rating_avg)}</span>
        <span className="text-xs">({tool.review_count})</span>
      </div>
    </div>
  );
}

function CompareSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-bold text-gray-800 mb-3 pb-2 border-b border-border">
        {title}
      </h3>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}

interface CompareRowValue {
  value: string;
  raw: number;
  component?: React.ReactNode;
}

function CompareRow({
  label,
  values,
  higherIsBetter,
}: {
  label: string;
  values: CompareRowValue[];
  higherIsBetter?: boolean;
}) {
  const maxRaw = higherIsBetter ? Math.max(...values.map((v) => v.raw)) : null;

  return (
    <div className="flex items-center gap-2 py-1.5">
      <span className="w-28 shrink-0 text-xs text-gray-500">{label}</span>
      <div className="flex flex-1 gap-4">
        {values.map((v, i) => (
          <div
            key={i}
            className={cn(
              'flex-1 text-center text-sm font-medium',
              higherIsBetter && maxRaw !== null && v.raw === maxRaw && values.filter((x) => x.raw === maxRaw).length === 1
                ? 'text-primary font-bold'
                : 'text-foreground'
            )}
          >
            {v.component || v.value}
          </div>
        ))}
      </div>
    </div>
  );
}

function FeatureRow({ label, values }: { label: string; values: boolean[] }) {
  return (
    <div className="flex items-center gap-2 py-1.5">
      <span className="w-28 shrink-0 text-xs text-gray-500">{label}</span>
      <div className="flex flex-1 gap-4">
        {values.map((v, i) => (
          <div key={i} className="flex-1 flex justify-center">
            {v ? (
              <Check className="h-4 w-4 text-emerald-500" />
            ) : (
              <X className="h-4 w-4 text-gray-300" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
