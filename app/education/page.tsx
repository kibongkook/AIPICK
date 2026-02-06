import Link from 'next/link';
import type { Metadata } from 'next';
import { GraduationCap, ArrowRight } from 'lucide-react';
import { SITE_NAME, SAFETY_LEVELS } from '@/lib/constants';
import { getEduLevels, getEduRecommendations } from '@/lib/supabase/queries';
import DynamicIcon from '@/components/ui/DynamicIcon';

export const metadata: Metadata = {
  title: `학년별 AI 추천 | ${SITE_NAME}`,
  description: '학생 수준에 맞는 안전한 AI 도구를 찾아보세요. 초등학생부터 대학생, 교사까지.',
};

export default function EducationPage() {
  const eduLevels = getEduLevels();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 헤더 */}
      <div className="mb-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <GraduationCap className="h-7 w-7 text-primary" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-foreground sm:text-3xl">
          학생이신가요?
        </h1>
        <p className="mt-2 text-gray-500">
          학년에 맞는 안전한 AI 도구를 추천해드립니다
        </p>
      </div>

      {/* 안전 등급 범례 */}
      <div className="mb-8 flex flex-wrap justify-center gap-4">
        {Object.entries(SAFETY_LEVELS).map(([key, config]) => (
          <div key={key} className="flex items-center gap-2 text-sm">
            <span>{config.emoji}</span>
            <span className="font-medium text-gray-700">{config.label}</span>
            <span className="text-gray-400">- {config.description}</span>
          </div>
        ))}
      </div>

      {/* 학년 카드 그리드 */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {eduLevels.map((level) => {
          const recs = getEduRecommendations(level.slug);
          const safeCount = recs.filter((r) => r.safety_level === 'safe').length;
          const toolNames = recs.slice(0, 3).map((r) => r.tool?.name).filter(Boolean);

          return (
            <Link
              key={level.slug}
              href={`/education/${level.slug}`}
              className="group rounded-xl border border-border bg-white p-6 shadow-sm card-hover"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <DynamicIcon name={level.icon || 'GraduationCap'} className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                    {level.name}
                  </h3>
                  {level.age_range && (
                    <p className="text-xs text-gray-400">{level.age_range}</p>
                  )}
                </div>
              </div>

              <p className="mt-3 text-sm text-gray-500">{level.description}</p>

              {toolNames.length > 0 && (
                <p className="mt-3 text-xs text-gray-400">
                  추천 AI: {toolNames.join(', ')} 외
                </p>
              )}

              <div className="mt-4 flex items-center justify-between">
                {safeCount > 0 && (
                  <span className="text-xs text-emerald-600 font-medium">
                    🟢 안전 AI {safeCount}개
                  </span>
                )}
                <div className="flex items-center gap-1 text-xs text-gray-400 group-hover:text-primary transition-colors ml-auto">
                  자세히 보기
                  <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
