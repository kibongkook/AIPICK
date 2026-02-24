'use client';

import { useState } from 'react';
import { Lightbulb, BookOpen, ArrowUp } from 'lucide-react';
import RecipeOptionCard from './RecipeOptionCard';
import RecipeStepCard from './RecipeStepCard';
import RecipeComparisonTable from './RecipeComparisonTable';
import RecipeGrowthPath from './RecipeGrowthPath';
import type { RecipeOption } from '@/types';

interface RecipeOptionSelectorProps {
  options: RecipeOption[];
  color: string;
}

export default function RecipeOptionSelector({ options, color }: RecipeOptionSelectorProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const selected = options[selectedIdx];

  // 단일 옵션(v1 변환 레시피)이면 기존 방식으로 표시
  if (options.length === 1 && !options[0].pros.length) {
    return (
      <div>
        <h2 className="text-lg font-extrabold text-foreground mb-6 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          단계별 가이드
        </h2>
        <div>
          {selected.steps.map((step, i) => (
            <RecipeStepCard
              key={step.step}
              step={step}
              isLast={i === selected.steps.length - 1}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* 옵션 선택 영역 */}
      <div className="mb-8">
        <h2 className="text-lg font-extrabold text-foreground mb-2 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          나에게 맞는 방법 선택하기
        </h2>
        <p className="text-xs text-gray-400 mb-4">
          같은 결과물을 만드는 {options.length}가지 방법 — 쉬운 것부터 시작해서 점점 업그레이드해보세요
        </p>

        {/* 옵션 카드 아코디언 리스트 */}
        <div className="flex flex-col gap-3">
          {options.map((option, idx) => (
            <div key={option.option_id}>
              <RecipeOptionCard
                option={option}
                index={idx}
                isSelected={idx === selectedIdx}
                onSelect={() => setSelectedIdx(idx === selectedIdx ? -1 : idx)}
                color={color}
              />

              {/* 다음 옵션 유도 (확장된 카드 바로 아래) */}
              {idx === selectedIdx && idx < options.length - 1 && (
                <button
                  onClick={() => setSelectedIdx(idx + 1)}
                  className="flex items-center gap-2 w-full mt-2 rounded-lg bg-primary/5 border border-primary/20 p-3 text-xs text-primary font-medium hover:bg-primary/10 transition-colors"
                >
                  <ArrowUp className="h-4 w-4 rotate-180" />
                  다음 단계로 성장하기: 옵션 {idx + 2} &quot;{options[idx + 1].title}&quot;에 도전해보세요!
                </button>
              )}
            </div>
          ))}
        </div>

        {/* 초보 추천 안내 */}
        {selectedIdx === 0 && options.length > 1 && (
          <div className="flex items-start gap-2 mt-3 rounded-lg bg-blue-50 border border-blue-100 p-3">
            <Lightbulb className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 leading-relaxed">
              AI가 처음이라면 <strong>옵션 1</strong>로 시작하세요! 성공하면 다음 옵션으로 업그레이드해보세요.
            </p>
          </div>
        )}
      </div>

      {/* 비교표 */}
      {options.length > 1 && (
        <RecipeComparisonTable options={options} color={color} />
      )}

      {/* 성장 경로 */}
      {options.length > 1 && (
        <RecipeGrowthPath options={options} color={color} />
      )}
    </div>
  );
}
