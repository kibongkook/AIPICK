import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import { SITE_NAME, SAFETY_LEVELS } from '@/lib/constants';
import { getEduLevelBySlug, getEduRecommendations, getEduLevels } from '@/lib/supabase/queries';
import type { SafetyLevel } from '@/types';
import DynamicIcon from '@/components/ui/DynamicIcon';
import Badge from '@/components/ui/Badge';
import ServiceCard from '@/components/service/ServiceCard';

interface Props {
  params: Promise<{ level: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { level } = await params;
  const eduLevel = getEduLevelBySlug(level);
  if (!eduLevel) return { title: '학년을 찾을 수 없습니다' };
  return {
    title: `${eduLevel.name}을 위한 AI 추천 | ${SITE_NAME}`,
    description: `${eduLevel.name}에게 적합한 안전한 AI 도구를 확인하세요. 안전 등급별 AI 서비스 큐레이션.`,
  };
}

export function generateStaticParams() {
  const levels = getEduLevels();
  return levels.map((lvl) => ({ level: lvl.slug }));
}

export default async function EduLevelDetailPage({ params }: Props) {
  const { level } = await params;
  const eduLevel = getEduLevelBySlug(level);
  if (!eduLevel) notFound();

  const recommendations = getEduRecommendations(level);
  const grouped: Record<SafetyLevel, typeof recommendations> = {
    safe: recommendations.filter((r) => r.safety_level === 'safe'),
    guided: recommendations.filter((r) => r.safety_level === 'guided'),
    advanced: recommendations.filter((r) => r.safety_level === 'advanced'),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 뒤로가기 */}
      <Link
        href="/education"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        학년 목록
      </Link>

      {/* 학년 헤더 */}
      <div className="mb-10 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <DynamicIcon name={eduLevel.icon || 'GraduationCap'} className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            {eduLevel.name}을 위한 AI
          </h1>
          <p className="mt-1 text-gray-500">
            {eduLevel.description}
            {eduLevel.age_range && ` (${eduLevel.age_range})`}
          </p>
        </div>
      </div>

      {/* 안전 등급 범례 */}
      <div className="mb-8 rounded-xl border border-border bg-white p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">안전 등급 안내</h3>
        <div className="flex flex-wrap gap-4">
          {Object.entries(SAFETY_LEVELS).map(([key, config]) => (
            <div key={key} className="flex items-center gap-2 text-sm">
              <span>{config.emoji}</span>
              <span className="font-medium text-gray-700">{config.label}</span>
              <span className="text-gray-400">- {config.description}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 안전 등급별 추천 */}
      {(['safe', 'guided', 'advanced'] as const).map((safetyLevel) => {
        const items = grouped[safetyLevel];
        if (items.length === 0) return null;
        const config = SAFETY_LEVELS[safetyLevel];

        return (
          <section key={safetyLevel} className="mb-10">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-lg">{config.emoji}</span>
              <h2 className="text-lg font-bold text-foreground">
                {config.label}
              </h2>
              <span className="text-sm text-gray-400">({items.length}개)</span>
              <span className="text-xs text-gray-400">- {config.description}</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((rec) => (
                <div key={rec.id}>
                  {rec.tool && <ServiceCard tool={rec.tool} />}
                  {rec.use_case && (
                    <p className="mt-2 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">
                      📚 활용: {rec.use_case}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {recommendations.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">아직 추천 데이터가 없습니다.</p>
          <p className="mt-1 text-sm">곧 업데이트될 예정입니다.</p>
        </div>
      )}
    </div>
  );
}
