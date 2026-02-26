import { useRef, useEffect } from 'react';
import { Clock, Wrench, ChevronDown } from 'lucide-react';
import DifficultyBadge from '@/components/ui/DifficultyBadge';
import RatingBar from '@/components/ui/RatingBar';
import RecipeProsCons from './RecipeProsCons';
import RecipeStepCard from './RecipeStepCard';
import type { ExecutionStatusLocal } from './RecipePlayground';
import type { RecipeOption } from '@/types';

interface RecipeOptionCardProps {
  option: RecipeOption;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  color: string;
  recipeSlug?: string;
  recipeCategory?: string;
  stepResults?: Record<string, string>;
  onStepResult?: (optionIdx: number, stepNum: number, result: string) => void;
  parentExecStatus?: ExecutionStatusLocal;
  onDecrement?: () => void;
}

export default function RecipeOptionCard({
  option,
  index,
  isSelected,
  onSelect,
  color,
  recipeSlug,
  recipeCategory,
  stepResults,
  onStepResult,
  parentExecStatus,
  onDecrement,
}: RecipeOptionCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // 옵션 선택 시 카드 상단으로 스크롤 (헤더 높이 56px + 여백 8px 보정)
  useEffect(() => {
    if (isSelected && cardRef.current) {
      const HEADER_OFFSET = 64;
      const top = cardRef.current.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
      window.scrollTo({ top, behavior: 'instant' });
    }
  }, [isSelected]);

  return (
    <div
      ref={cardRef}
      className={`rounded-xl border-2 transition-all w-full overflow-hidden ${
        isSelected
          ? 'border-primary shadow-md'
          : 'border-border bg-white hover:border-primary/40 hover:shadow-sm'
      }`}
    >
      {/* 클릭 가능한 헤더 행 */}
      <button
        onClick={onSelect}
        className={`flex items-stretch text-left w-full transition-colors ${
          isSelected ? 'bg-primary/5' : 'bg-white hover:bg-gray-50'
        }`}
      >
        {/* 왼쪽: 번호 스트라이프 */}
        <div className={`flex flex-col items-center justify-center px-3 bg-gradient-to-b ${color} text-white shrink-0`}>
          <span className="text-lg font-extrabold">{index + 1}</span>
        </div>

        {/* 가운데: 제목 + 메타 정보 */}
        <div className="flex-1 min-w-0 p-4">
          <h3 className="text-sm font-bold text-foreground leading-tight">{option.title}</h3>
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{option.subtitle}</p>

          {/* 메타 태그 행 */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <DifficultyBadge difficulty={option.difficulty} showStars />
            <span className="flex items-center gap-0.5 text-xs text-gray-400">
              <Clock className="h-3 w-3" />
              {option.estimated_time}
            </span>
            <span className="flex items-center gap-0.5 text-xs text-gray-400">
              <Wrench className="h-3 w-3" />
              {option.tool_count}개
            </span>
          </div>
        </div>

        {/* 오른쪽: 열기/닫기 아이콘 */}
        <div className="flex items-center pr-4 shrink-0">
          <ChevronDown className={`h-5 w-5 transition-transform ${
            isSelected ? 'rotate-180 text-primary' : 'text-gray-300'
          }`} />
        </div>
      </button>

      {/* 확장 영역: 선택 시 인라인으로 표시 */}
      {isSelected && (
        <div className="border-t border-border/50 bg-white p-5">
          {/* 퀄리티 / 자유도 / 추천 대상 */}
          <div className="flex flex-wrap items-start gap-6 mb-5 pb-4 border-b border-border/50">
            <div className="space-y-1.5">
              <RatingBar value={option.quality_rating} label="퀄리티" />
              <RatingBar value={option.customization_rating} label="자유도" />
            </div>
            {option.best_for && (
              <div className="flex items-start gap-2 rounded-lg bg-gray-50 border border-border/50 p-2.5 flex-1 min-w-48">
                <span className="text-xs font-bold text-gray-500 shrink-0">추천 대상</span>
                <span className="text-xs text-gray-600">{option.best_for}</span>
              </div>
            )}
          </div>

          {/* 장단점 */}
          <div className="mb-5">
            <RecipeProsCons pros={option.pros} cons={option.cons} />
          </div>

          {/* 단계별 가이드 */}
          <h4 className="text-sm font-bold text-foreground mb-4">단계별 가이드</h4>
          <div>
            {option.steps.map((step, i) => {
              const prevStep = i > 0 ? option.steps[i - 1] : null;
              const previousResult = prevStep
                ? stepResults?.[`${index}-${prevStep.step}`]
                : undefined;

              return (
                <RecipeStepCard
                  key={step.step}
                  step={step}
                  isLast={i === option.steps.length - 1}
                  recipeSlug={recipeSlug}
                  recipeCategory={recipeCategory}
                  previousResult={previousResult}
                  onResult={(result) => onStepResult?.(index, step.step, result)}
                  hasNextStep={i < option.steps.length - 1}
                  onUseNext={(value) => onStepResult?.(index, step.step, value)}
                  parentExecStatus={parentExecStatus}
                  onDecrement={onDecrement}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
