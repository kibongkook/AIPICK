import Link from 'next/link';
import type { Metadata } from 'next';
import { Shield, ArrowRight, Users } from 'lucide-react';
import { SITE_NAME, SAFETY_LEVELS, EDU_LEVELS } from '@/lib/constants';
import { getEduLevels, getEduRecommendations } from '@/lib/supabase/queries';
import DynamicIcon from '@/components/ui/DynamicIcon';

export const metadata: Metadata = {
  title: `학년별 AI 추천 | ${SITE_NAME}`,
  description: '학생 수준에 맞는 안전한 AI 도구를 찾아보세요. 초등학생부터 대학생, 교사, 학부모, 학원강사까지.',
};

export default function EducationPage() {
  const eduLevels = getEduLevels();

  // 학생 그룹과 교육 관련자 그룹 분리
  const studentSlugs = ['elementary-low', 'elementary-high', 'middle-school', 'high-school', 'college'];
  const educatorSlugs = ['teacher', 'parent', 'academy-tutor', 'coding-tutor'];

  const students = EDU_LEVELS.filter(e => studentSlugs.includes(e.slug));
  const educators = EDU_LEVELS.filter(e => educatorSlugs.includes(e.slug));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 헤더 */}
      <div className="mb-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <Shield className="h-7 w-7 text-primary" />
        </div>
        <h1 className="mt-4 text-2xl font-extrabold text-foreground sm:text-3xl">
          우리 아이, 어떤 AI가 안전할까?
        </h1>
        <p className="mt-2 text-gray-500">
          연령별 안전 등급과 함께 검증된 AI만 추천합니다
        </p>
      </div>

      {/* 안전 등급 범례 */}
      <div className="mb-10 flex flex-wrap justify-center gap-4 rounded-xl bg-gray-50 p-4">
        {Object.entries(SAFETY_LEVELS).map(([key, config]) => (
          <div key={key} className="flex items-center gap-2 text-sm">
            <span>{config.emoji}</span>
            <span className="font-medium text-gray-700">{config.label}</span>
            <span className="text-gray-400">- {config.description}</span>
          </div>
        ))}
      </div>

      {/* 학생 그룹 */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-foreground mb-6">학생</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {students.map((level) => {
            const dbLevel = eduLevels.find(e => e.slug === level.slug);
            const recs = getEduRecommendations(level.slug);
            const safeCount = recs.filter((r) => r.safety_level === 'safe').length;
            const toolNames = recs.slice(0, 3).map((r) => r.tool?.name).filter(Boolean);

            return (
              <Link
                key={level.slug}
                href={`/education/${level.slug}`}
                className="group rounded-2xl border border-border bg-white p-6 card-hover"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <DynamicIcon name={level.icon} className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                      {level.name}
                    </h3>
                    {level.ageRange && (
                      <p className="text-xs text-gray-400">{level.ageRange}</p>
                    )}
                  </div>
                </div>

                {dbLevel?.description && (
                  <p className="mt-3 text-sm text-gray-500">{dbLevel.description}</p>
                )}

                {toolNames.length > 0 && (
                  <p className="mt-3 text-xs text-gray-400">
                    추천 AI: {toolNames.join(', ')} 외
                  </p>
                )}

                <div className="mt-4 flex items-center justify-between">
                  {safeCount > 0 && (
                    <span className="text-xs text-emerald-600 font-semibold">
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

      {/* 교육 관련자 그룹 */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-foreground mb-2">교육 관련자</h2>
        <p className="text-sm text-gray-500 mb-6">교사, 학부모, 학원 강사, 코딩 강사를 위한 AI 추천</p>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {educators.map((level) => {
            const dbLevel = eduLevels.find(e => e.slug === level.slug);
            const recs = getEduRecommendations(level.slug);

            return (
              <Link
                key={level.slug}
                href={`/education/${level.slug}`}
                className="group rounded-2xl border border-border bg-white p-5 card-hover"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <DynamicIcon name={level.icon} className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                    {level.name}
                  </h3>
                </div>

                {dbLevel?.description && (
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3">{dbLevel.description}</p>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    <Users className="inline h-3 w-3 mr-0.5" />
                    추천 AI {recs.length}개
                  </span>
                  <span className="text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    확인하기 →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
