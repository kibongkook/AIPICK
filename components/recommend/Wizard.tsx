'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Star, Zap, Check } from 'lucide-react';
import { PURPOSE_CATEGORIES, CATEGORY_USE_CASES } from '@/lib/constants';
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

  // 사이드바/헤더에서 "AI 찾기" 클릭 시 위자드 초기화
  useEffect(() => {
    const handleNavClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest('a');
      if (!link) return;
      const href = link.getAttribute('href');
      if (href === '/discover' && step !== 1) {
        setState({ purpose: '', userType: '' });
        setStep(1);
        setResults([]);
      }
    };
    document.addEventListener('click', handleNavClick);
    return () => document.removeEventListener('click', handleNavClick);
  }, [step]);

  const totalSteps = 2;
  const currentStep = typeof step === 'number' ? step : totalSteps;

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

  // Step 2 동적 옵션: 선택된 카테고리에 맞는 세부 질문
  const useCases = CATEGORY_USE_CASES[state.purpose] || [];
  const selectedCategory = PURPOSE_CATEGORIES.find((c) => c.slug === state.purpose);

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

      {/* Step 2: 동적 세부 질문 — 카테고리별로 다른 옵션 */}
      {step === 2 && (
        <StepContainer
          title={`${selectedCategory?.name || ''} — 어떤 용도인가요?`}
          subtitle="용도에 맞는 AI를 추천해드립니다"
        >
          <div className="space-y-3">
            {useCases.map((useCase) => (
              <button
                key={useCase.userTypeSlug}
                onClick={() => selectUserType(useCase.userTypeSlug)}
                className={cn(
                  'flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all hover:shadow-md',
                  state.userType === useCase.userTypeSlug
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
                  <DynamicIcon name={useCase.icon} className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-foreground block">{useCase.label}</span>
                  <span className="text-[11px] text-gray-400">{useCase.description}</span>
                </div>
              </button>
            ))}
          </div>
        </StepContainer>
      )}

      {/* 결과 */}
      {step === 'result' && (
        <div>
          {/* 뒤로가기 */}
          <button
            onClick={goBack}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="h-3 w-3" />
            다른 용도 선택
          </button>

          <div className="mb-6 text-center">
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
            <div>
              {/* TOP 3 강조 */}
              <div className="mb-2">
                <span className="text-xs font-bold text-primary uppercase tracking-wide">TOP PICKS</span>
              </div>
              <div className="space-y-3 mb-6">
                {results.slice(0, 3).map((result, index) => (
                  <TopResultCard key={result.tool.id} result={result} rank={index + 1} />
                ))}
              </div>

              {/* 나머지 (compact) */}
              {results.length > 3 && (
                <>
                  <div className="mb-2">
                    <span className="text-xs font-medium text-gray-400">이런 것도 있어요</span>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {results.slice(3).map((result, index) => (
                      <CompactResultCard key={result.tool.id} result={result} rank={index + 4} />
                    ))}
                  </div>
                </>
              )}
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
                href={`/category/${state.purpose}`}
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
              >
                {selectedCategory?.name || '카테고리'} 전체 보기
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

/* ================================================
   TOP 3 결과 카드 — 강조 스타일
   ================================================ */
function TopResultCard({ result, rank }: { result: RecommendedTool; rank: number }) {
  const { tool, matchScore, reasons } = result;
  const pricingVariant = tool.pricing_type === 'Free' ? 'free' : tool.pricing_type === 'Freemium' ? 'freemium' : 'paid';
  const scorePercent = Math.round(matchScore);

  return (
    <Link
      href={`/tools/${tool.slug}`}
      className={cn(
        'block rounded-xl border bg-white p-5 shadow-sm hover:shadow-md transition-shadow',
        rank === 1 ? 'border-primary/30 ring-1 ring-primary/10' : 'border-border'
      )}
    >
      <div className="flex items-start gap-4">
        {/* 랭크 + 매칭 점수 */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <span className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white',
            rank === 1 ? 'bg-yellow-400 ring-2 ring-yellow-200' : rank === 2 ? 'bg-gray-300 ring-2 ring-gray-200' : 'bg-amber-600 ring-2 ring-amber-200'
          )}>
            {rank}
          </span>
          <span className={cn(
            'text-xs font-bold',
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
            {rank === 1 && (
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">TOP PICK</span>
            )}
          </div>

          {/* 설명 */}
          <p className="mt-1 text-xs text-gray-500 line-clamp-2">{tool.description}</p>

          {/* 추천 이유 */}
          {reasons.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {reasons.map((reason, i) => (
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
              {tool.free_quota_detail.slice(0, 80)}
            </p>
          )}

          {/* 평점 + 리뷰 */}
          <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {formatRating(tool.rating_avg)}
            </span>
            <span>{tool.review_count}개 리뷰</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ================================================
   나머지 결과 카드 — 컴팩트 스타일
   ================================================ */
function CompactResultCard({ result, rank }: { result: RecommendedTool; rank: number }) {
  const { tool, matchScore, reasons } = result;
  const pricingVariant = tool.pricing_type === 'Free' ? 'free' : tool.pricing_type === 'Freemium' ? 'freemium' : 'paid';

  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="flex items-center gap-3 rounded-lg border border-border bg-white p-3 hover:shadow-sm transition-shadow"
    >
      {/* 랭크 */}
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-gray-500 shrink-0">
        {rank}
      </span>

      {/* 로고 */}
      {tool.logo_url ? (
        <img src={tool.logo_url} alt={tool.name} className="h-8 w-8 rounded-lg object-cover shrink-0" />
      ) : (
        <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg text-white text-xs font-bold shrink-0', getAvatarColor(tool.name))}>
          {tool.name.charAt(0)}
        </div>
      )}

      {/* 정보 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-foreground truncate">{tool.name}</span>
          <Badge variant={pricingVariant} className="text-[9px] shrink-0">
            {tool.pricing_type === 'Free' ? '무료' : tool.pricing_type === 'Freemium' ? '부분무료' : '유료'}
          </Badge>
        </div>
        {reasons[0] && (
          <span className="text-[11px] text-gray-400 truncate block">{reasons[0]}</span>
        )}
      </div>

      {/* 매칭 점수 */}
      <span className={cn(
        'text-xs font-bold shrink-0',
        Math.round(matchScore) >= 60 ? 'text-primary' : 'text-gray-400'
      )}>
        {Math.round(matchScore)}%
      </span>
    </Link>
  );
}
