'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Star, Zap, Check } from 'lucide-react';
import { PURPOSE_CATEGORIES, USER_TYPES } from '@/lib/constants';
import type { RecommendedTool } from '@/types';
import { cn, getAvatarColor, formatRating } from '@/lib/utils';
import DynamicIcon from '@/components/ui/DynamicIcon';
import Badge from '@/components/ui/Badge';

type Step = 1 | 2 | 'result';

interface WizardState {
  purpose: string;
  userType: string;
}

export default function Wizard() {
  const [step, setStep] = useState<Step>(1);
  const [state, setState] = useState<WizardState>({
    purpose: '',
    userType: '',
  });
  const [results, setResults] = useState<RecommendedTool[]>([]);
  const [loading, setLoading] = useState(false);

  const totalSteps = 2;
  const currentStep = typeof step === 'number' ? step : totalSteps;

  const skillTypes = USER_TYPES.filter(u => u.group === 'skill');

  const fetchResults = useCallback(async (purpose: string, userType: string) => {
    setLoading(true);
    setStep('result');
    const params = new URLSearchParams();
    if (purpose) params.set('category', purpose);
    if (userType) params.set('userType', userType);

    try {
      const res = await fetch(`/api/recommend?${params.toString()}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch {
      setResults([]);
    }
    setLoading(false);
  }, []);

  const selectPurpose = (slug: string) => {
    setState((s) => ({ ...s, purpose: slug }));
    setStep(2);
  };

  const selectUserType = (slug: string) => {
    const newState = { ...state, userType: slug };
    setState(newState);
    fetchResults(newState.purpose, slug);
  };

  const goBack = () => {
    if (step === 'result') setStep(2);
    else if (step === 2) setStep(1);
  };

  const restart = () => {
    setState({ purpose: '', userType: '' });
    setStep(1);
    setResults([]);
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* 프로그레스 바 */}
      {step !== 'result' && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">단계 {currentStep} / {totalSteps}</span>
            {step === 2 && (
              <button
                onClick={goBack}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition-colors"
              >
                <ArrowLeft className="h-3 w-3" />
                이전
              </button>
            )}
          </div>
          <div className="h-2 rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Step 1: 목적 (Purpose) — 선택하면 자동 진행 */}
      {step === 1 && (
        <StepContainer
          title="지금 뭐 하려고 하세요?"
          subtitle="목적을 선택하면 바로 다음으로 넘어갑니다"
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PURPOSE_CATEGORIES.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => selectPurpose(cat.slug)}
                className={cn(
                  'flex items-center gap-3 rounded-xl border p-4 text-left transition-all hover:shadow-md',
                  state.purpose === cat.slug
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${cat.color} shrink-0`}>
                  <DynamicIcon name={cat.icon} className="h-4 w-4 text-white" />
                </div>
                <div>
                  <span className="text-sm font-medium text-foreground block">{cat.name}</span>
                  <span className="text-[11px] text-gray-400">{cat.description}</span>
                </div>
              </button>
            ))}
          </div>
        </StepContainer>
      )}

      {/* Step 2: 사용 목적 (Usage Goal) — 선택하면 자동 결과 */}
      {step === 2 && (
        <StepContainer
          title="어떤 방식으로 AI를 활용하고 싶으세요?"
          subtitle="목표에 맞는 AI를 추천해드립니다"
        >
          <div className="space-y-3">
            {skillTypes.map((ut) => (
              <button
                key={ut.slug}
                onClick={() => selectUserType(ut.slug)}
                className={cn(
                  'flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all hover:shadow-md',
                  state.userType === ut.slug
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
                  <DynamicIcon name={ut.icon} className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-foreground block">{ut.name}</span>
                  <span className="text-[11px] text-gray-400">{ut.description}</span>
                </div>
              </button>
            ))}
          </div>
        </StepContainer>
      )}

      {/* 결과 */}
      {step === 'result' && (
        <div>
          <div className="mb-8 text-center">
            {loading ? (
              <>
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="mt-3 text-sm text-gray-500">AI를 분석하고 있습니다...</p>
              </>
            ) : (
              <>
                <Sparkles className="mx-auto h-8 w-8 text-primary" />
                <h2 className="mt-3 text-xl font-bold text-foreground">
                  맞춤 AI 추천 결과
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {results.length > 0
                    ? `조건에 맞는 ${results.length}개의 AI 서비스를 찾았습니다`
                    : '조건에 맞는 서비스가 없습니다. 다시 시도해보세요.'
                  }
                </p>
              </>
            )}
          </div>

          {!loading && results.length > 0 && (
            <div className="space-y-4">
              {results.map((result, index) => (
                <ResultCard key={result.tool.id} result={result} rank={index + 1} />
              ))}
            </div>
          )}

          {!loading && results.length === 0 && (
            <div className="text-center py-10">
              <button
                onClick={restart}
                className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
              >
                다시 시도하기
              </button>
            </div>
          )}

          {!loading && (
            <div className="mt-8 flex justify-center gap-3">
              <button
                onClick={restart}
                className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                처음부터 다시
              </button>
              <Link
                href="/discover"
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
              >
                전체 AI 보기
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StepContainer({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-foreground">{title}</h2>
      <p className="mt-1 mb-6 text-sm text-gray-500">{subtitle}</p>
      {children}
    </div>
  );
}

function ResultCard({ result, rank }: { result: RecommendedTool; rank: number }) {
  const { tool, matchScore, reasons, matchDetails } = result;
  const pricingVariant = tool.pricing_type === 'Free' ? 'free' : tool.pricing_type === 'Freemium' ? 'freemium' : 'paid';
  const scorePercent = Math.round(matchScore);

  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="block rounded-xl border border-border bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-4">
        {/* 랭크 + 매칭 점수 */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <span className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white',
            rank === 1 ? 'bg-yellow-400' : rank === 2 ? 'bg-gray-300' : rank === 3 ? 'bg-amber-600' : 'bg-gray-200 text-gray-600'
          )}>
            {rank}
          </span>
          <span className={cn(
            'text-[11px] font-bold',
            scorePercent >= 80 ? 'text-emerald-600' : scorePercent >= 60 ? 'text-blue-600' : 'text-gray-500'
          )}>
            {scorePercent}%
          </span>
        </div>

        <div className="flex-1 min-w-0">
          {/* 도구 이름 + 뱃지 */}
          <div className="flex items-center gap-2">
            {tool.logo_url ? (
              <img src={tool.logo_url} alt={tool.name} className="h-8 w-8 rounded-lg object-cover" />
            ) : (
              <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg text-white text-xs font-bold', getAvatarColor(tool.name))}>
                {tool.name.charAt(0)}
              </div>
            )}
            <h3 className="text-sm font-semibold text-foreground">{tool.name}</h3>
            <Badge variant={pricingVariant} className="text-[10px]">
              {tool.pricing_type === 'Free' ? '무료' : tool.pricing_type === 'Freemium' ? '부분 무료' : '유료'}
            </Badge>
          </div>

          {/* 설명 */}
          <p className="mt-1 text-xs text-gray-500 line-clamp-1">{tool.description}</p>

          {/* 추천 이유 */}
          {reasons.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {reasons.slice(0, 4).map((reason, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-0.5 rounded-full bg-primary/5 px-2 py-0.5 text-[10px] font-medium text-primary"
                >
                  <Check className="h-2.5 w-2.5" />
                  {reason}
                </span>
              ))}
            </div>
          )}

          {/* 무료 사용량 */}
          {tool.free_quota_detail && tool.pricing_type !== 'Paid' && (
            <p className="mt-2 flex items-center gap-1 text-xs text-emerald-700">
              <Zap className="h-3 w-3" />
              {tool.free_quota_detail.slice(0, 60)}
            </p>
          )}

          {/* 평점 + 리뷰 */}
          <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {formatRating(tool.rating_avg)}
            </span>
            <span>{tool.review_count}개 리뷰</span>
            <MatchBar details={matchDetails} />
          </div>
        </div>
      </div>
    </Link>
  );
}

function MatchBar({ details }: { details: RecommendedTool['matchDetails'] }) {
  const segments = [
    { value: details.purposeMatch ?? details.categoryMatch ?? 0, max: 40, color: 'bg-blue-500', label: '목적' },
    { value: details.userTypeMatch ?? details.personaMatch ?? 0, max: 40, color: 'bg-purple-500', label: '숙련도' },
    { value: details.budgetMatch, max: 15, color: 'bg-emerald-500', label: '예산' },
    { value: details.koreanMatch, max: 10, color: 'bg-orange-500', label: '한국어' },
    { value: details.qualitySignal, max: 20, color: 'bg-yellow-500', label: '품질' },
  ];

  return (
    <div className="ml-auto flex items-center gap-0.5" title="매칭 상세">
      {segments.map((seg) => (
        <div
          key={seg.label}
          className={cn('h-1.5 w-3 rounded-full', seg.value > seg.max * 0.3 ? seg.color : 'bg-gray-200')}
          title={`${seg.label}: ${Math.round(seg.value)}/${seg.max}`}
        />
      ))}
    </div>
  );
}
