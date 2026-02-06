'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Sparkles, Star, Zap, ExternalLink } from 'lucide-react';
import { CATEGORIES, JOB_CATEGORIES, EDU_LEVELS } from '@/lib/constants';
import type { Tool, PricingType } from '@/types';
import { cn, getAvatarColor, formatRating } from '@/lib/utils';
import DynamicIcon from '@/components/ui/DynamicIcon';
import Badge from '@/components/ui/Badge';

type Step = 1 | 2 | 3 | 4 | 'result';

interface WizardState {
  category: string;
  persona: string; // job slug or edu slug
  personaType: 'job' | 'edu' | '';
  budget: 'free' | 'under10' | 'any';
  korean: 'required' | 'any';
}

export default function Wizard() {
  const [step, setStep] = useState<Step>(1);
  const [state, setState] = useState<WizardState>({
    category: '',
    persona: '',
    personaType: '',
    budget: 'any',
    korean: 'any',
  });
  const [results, setResults] = useState<Tool[]>([]);

  const totalSteps = 4;
  const currentStep = typeof step === 'number' ? step : totalSteps;

  const goNext = async () => {
    if (step === 4) {
      // API를 통해 검색 실행
      const params = new URLSearchParams();
      if (state.category) params.append('category', state.category);
      if (state.budget === 'free') params.append('pricing', 'Free');
      else if (state.budget === 'under10') {
        params.append('pricing', 'Free');
        params.append('pricing', 'Freemium');
      }
      if (state.korean === 'required') params.set('korean', 'true');
      if (state.personaType === 'job' && state.persona) params.set('job', state.persona);
      if (state.personaType === 'edu' && state.persona) params.set('edu', state.persona);
      params.set('sort', 'popular');

      try {
        const res = await fetch(`/api/search?${params.toString()}`);
        const data = await res.json();
        setResults((data.results || []).slice(0, 6));
      } catch {
        setResults([]);
      }
      setStep('result');
    } else {
      setStep(((step as number) + 1) as Step);
    }
  };

  const goBack = () => {
    if (step === 'result') setStep(4);
    else if ((step as number) > 1) setStep(((step as number) - 1) as Step);
  };

  const restart = () => {
    setState({ category: '', persona: '', personaType: '', budget: 'any', korean: 'any' });
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
          </div>
          <div className="h-2 rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Step 1: 카테고리 */}
      {step === 1 && (
        <StepContainer
          title="어떤 작업을 하시나요?"
          subtitle="가장 관련 있는 분야를 선택하세요"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setState((s) => ({ ...s, category: cat.slug }))}
                className={cn(
                  'flex items-center gap-3 rounded-xl border p-4 text-left transition-all',
                  state.category === cat.slug
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <DynamicIcon name={cat.icon} className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm font-medium text-foreground">{cat.name}</span>
              </button>
            ))}
          </div>
        </StepContainer>
      )}

      {/* Step 2: 직군/학년 */}
      {step === 2 && (
        <StepContainer
          title="당신은 누구인가요?"
          subtitle="직군 또는 학년을 선택하면 맞춤 추천이 가능합니다"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">직군</p>
          <div className="grid gap-2 sm:grid-cols-2 mb-6">
            {JOB_CATEGORIES.map((job) => (
              <button
                key={job.slug}
                onClick={() => setState((s) => ({ ...s, persona: job.slug, personaType: 'job' }))}
                className={cn(
                  'flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all',
                  state.persona === job.slug && state.personaType === 'job'
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <DynamicIcon name={job.icon} className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm text-foreground">{job.name}</span>
              </button>
            ))}
          </div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">학년</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {EDU_LEVELS.map((level) => (
              <button
                key={level.slug}
                onClick={() => setState((s) => ({ ...s, persona: level.slug, personaType: 'edu' }))}
                className={cn(
                  'flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left transition-all',
                  state.persona === level.slug && state.personaType === 'edu'
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <DynamicIcon name={level.icon} className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm text-foreground">{level.name}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => setState((s) => ({ ...s, persona: '', personaType: '' }))}
            className={cn(
              'mt-3 w-full rounded-lg border px-3 py-2.5 text-sm text-gray-500 transition-all',
              !state.persona ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            )}
          >
            건너뛰기
          </button>
        </StepContainer>
      )}

      {/* Step 3: 예산 */}
      {step === 3 && (
        <StepContainer title="예산은 어느 정도인가요?" subtitle="무료 서비스를 우선 추천해드립니다">
          <div className="space-y-3">
            {[
              { value: 'free' as const, label: '무료만', desc: '완전 무료 서비스만 보기' },
              { value: 'under10' as const, label: '월 $10 이하', desc: '무료 + 저렴한 유료 포함' },
              { value: 'any' as const, label: '상관없음', desc: '모든 가격대 포함' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setState((s) => ({ ...s, budget: opt.value }))}
                className={cn(
                  'flex w-full flex-col rounded-xl border p-4 text-left transition-all',
                  state.budget === opt.value
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <span className="text-sm font-semibold text-foreground">{opt.label}</span>
                <span className="text-xs text-gray-400 mt-0.5">{opt.desc}</span>
              </button>
            ))}
          </div>
        </StepContainer>
      )}

      {/* Step 4: 한국어 */}
      {step === 4 && (
        <StepContainer title="한국어 지원이 필요한가요?" subtitle="한국어를 지원하는 AI만 필터링할 수 있습니다">
          <div className="space-y-3">
            {[
              { value: 'required' as const, label: '필수', desc: '한국어 지원 서비스만 보기' },
              { value: 'any' as const, label: '상관없음', desc: '영문 서비스도 포함' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setState((s) => ({ ...s, korean: opt.value }))}
                className={cn(
                  'flex w-full flex-col rounded-xl border p-4 text-left transition-all',
                  state.korean === opt.value
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <span className="text-sm font-semibold text-foreground">{opt.label}</span>
                <span className="text-xs text-gray-400 mt-0.5">{opt.desc}</span>
              </button>
            ))}
          </div>
        </StepContainer>
      )}

      {/* 결과 */}
      {step === 'result' && (
        <div>
          <div className="mb-8 text-center">
            <Sparkles className="mx-auto h-8 w-8 text-primary" />
            <h2 className="mt-3 text-xl font-bold text-foreground">
              맞춤 AI 추천 결과
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {results.length > 0
                ? `조건에 맞는 ${results.length}개의 AI 서비스를 찾았습니다`
                : '조건에 맞는 서비스가 없습니다. 필터를 조정해보세요.'
              }
            </p>
          </div>

          {results.length > 0 ? (
            <div className="space-y-4">
              {results.map((tool, index) => (
                <ResultCard key={tool.id} tool={tool} rank={index + 1} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <button
                onClick={restart}
                className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
              >
                다시 시도하기
              </button>
            </div>
          )}

          <div className="mt-8 flex justify-center gap-3">
            <button
              onClick={restart}
              className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              처음부터 다시
            </button>
            <Link
              href="/search"
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
            >
              전체 검색으로 이동
            </Link>
          </div>
        </div>
      )}

      {/* 네비게이션 버튼 */}
      {step !== 'result' && (
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={goBack}
            disabled={step === 1}
            className={cn(
              'flex items-center gap-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
              step === 1
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-100'
            )}
          >
            <ArrowLeft className="h-4 w-4" />
            이전
          </button>
          <button
            onClick={goNext}
            className="flex items-center gap-1 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover transition-colors"
          >
            {step === 4 ? '추천받기' : '다음'}
            {step === 4 ? <Sparkles className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
          </button>
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

function ResultCard({ tool, rank }: { tool: Tool; rank: number }) {
  const pricingVariant = tool.pricing_type === 'Free' ? 'free' : tool.pricing_type === 'Freemium' ? 'freemium' : 'paid';

  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="flex items-start gap-4 rounded-xl border border-border bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <span className={cn(
        'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white shrink-0',
        rank === 1 ? 'bg-yellow-400' : rank === 2 ? 'bg-gray-300' : rank === 3 ? 'bg-amber-600' : 'bg-gray-200 text-gray-600'
      )}>
        {rank}
      </span>
      <div className="flex-1 min-w-0">
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
        <p className="mt-1 text-xs text-gray-500 line-clamp-1">{tool.description}</p>
        {tool.free_quota_detail && (
          <p className="mt-2 flex items-center gap-1 text-xs text-emerald-700">
            <Zap className="h-3 w-3" />
            {tool.free_quota_detail.slice(0, 60)}...
          </p>
        )}
        <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {formatRating(tool.rating_avg)}
          </span>
          <span>{tool.review_count}개 리뷰</span>
        </div>
      </div>
    </Link>
  );
}
