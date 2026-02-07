import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRightLeft, ArrowLeft } from 'lucide-react';
import { SITE_NAME } from '@/lib/constants';
import { getToolBySlug, getTools, getToolBenchmarks, getToolShowcases } from '@/lib/supabase/queries';
import { POPULAR_PAIRS, getPopularCompareTargets, getCompareUrl } from '@/lib/compare/popular-pairs';
import type { Tool, ToolBenchmarkScore } from '@/types';
import ComparisonView from '@/components/compare/ComparisonView';
import CompareSelector from '@/components/compare/CompareSelector';
import PickRecommendation from '@/components/compare/PickRecommendation';
import ShowcaseCompare from '@/components/showcase/ShowcaseCompare';

interface Props {
  params: Promise<{ slugs: string[] }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slugs } = await params;
  if (!slugs || slugs.length < 2) return { title: 'AI 도구 비교' };

  const tools = await Promise.all(slugs.slice(0, 3).map((slug) => getToolBySlug(slug)));
  const validTools = tools.filter(Boolean) as Tool[];
  if (validTools.length < 2) return { title: 'AI 도구 비교' };

  const names = validTools.map((t) => t.name).join(' vs ');
  return {
    title: `${names} - AI 도구 비교 | ${SITE_NAME}`,
    description: `${names} 비교: 가격, 무료 사용량, 기능, 벤치마크를 한눈에 비교하세요.`,
    openGraph: {
      title: `${names} 비교 | ${SITE_NAME}`,
      description: `${names}의 가격, 무료 사용량, 장단점을 비교합니다.`,
    },
  };
}

export async function generateStaticParams() {
  return POPULAR_PAIRS.map(([a, b]) => ({
    slugs: [a, b].sort(),
  }));
}

export default async function ComparePage({ params }: Props) {
  const { slugs } = await params;
  if (!slugs || slugs.length < 2) notFound();

  const toolSlugs = slugs.slice(0, 3);
  const tools = await Promise.all(toolSlugs.map((slug) => getToolBySlug(slug)));
  const validTools = tools.filter(Boolean) as Tool[];

  if (validTools.length < 2) notFound();

  // 벤치마크 데이터 로드
  const benchmarkEntries = await Promise.all(
    validTools.map(async (tool) => {
      const benchmarks = await getToolBenchmarks(tool.id);
      return [tool.id, benchmarks] as const;
    })
  );
  const benchmarks: Record<string, ToolBenchmarkScore[]> = Object.fromEntries(benchmarkEntries);

  // 쇼케이스 데이터 로드
  const toolShowcasesEntries = await Promise.all(
    validTools.map(async (tool) => {
      const showcases = await getToolShowcases(tool.slug);
      return [tool.slug, showcases] as const;
    })
  );
  const toolShowcasesMap = new Map(toolShowcasesEntries);

  // 도구 선택기용 전체 도구 목록
  const allTools = await getTools();

  const names = validTools.map((t) => t.name);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 뒤로가기 */}
      <Link
        href="/rankings"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        랭킹으로 돌아가기
      </Link>

      {/* 페이지 헤더 */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <ArrowRightLeft className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-extrabold text-foreground sm:text-2xl">
            {names.join(' vs ')}
          </h1>
        </div>
        <p className="text-sm text-gray-500">
          가격, 무료 사용량, 기능, 벤치마크를 한눈에 비교
        </p>
      </div>

      {/* 도구 변경/추가 선택기 */}
      <div className="mb-8">
        <CompareSelector tools={allTools} currentSlugs={toolSlugs} />
      </div>

      {/* "어떤 걸 고를까?" 요약 */}
      <div className="mb-8">
        <PickRecommendation tools={validTools} />
      </div>

      {/* 같은 프롬프트 결과 비교 */}
      <ShowcaseCompare tools={validTools} toolShowcases={toolShowcasesMap} />

      {/* 메인 비교 뷰 */}
      <ComparisonView tools={validTools} benchmarks={benchmarks} />

      {/* 관련 비교 링크 */}
      <RelatedComparisons tools={validTools} allTools={allTools} />
    </div>
  );
}

function RelatedComparisons({ tools, allTools }: { tools: Tool[]; allTools: Tool[] }) {
  const relatedSlugs = new Set<string>();
  for (const tool of tools) {
    for (const target of getPopularCompareTargets(tool.slug)) {
      if (!tools.some((t) => t.slug === target)) {
        relatedSlugs.add(target);
      }
    }
  }

  const relatedPairs: { slug1: string; slug2: string; name1: string; name2: string }[] = [];
  for (const slug of relatedSlugs) {
    const target = allTools.find((t) => t.slug === slug);
    if (!target) continue;
    for (const tool of tools) {
      relatedPairs.push({
        slug1: tool.slug,
        slug2: slug,
        name1: tool.name,
        name2: target.name,
      });
    }
  }

  if (relatedPairs.length === 0) return null;

  return (
    <div className="mt-12 pt-8 border-t border-border">
      <h3 className="text-sm font-bold text-gray-800 mb-4">다른 비교도 확인해보세요</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {relatedPairs.slice(0, 6).map(({ slug1, slug2, name1, name2 }) => (
          <Link
            key={`${slug1}-${slug2}`}
            href={getCompareUrl(slug1, slug2)}
            className="flex items-center gap-2 rounded-lg border border-border px-4 py-3 text-sm hover:border-primary hover:shadow-sm transition-all"
          >
            <ArrowRightLeft className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="font-medium">{name1}</span>
            <span className="text-gray-400">vs</span>
            <span className="font-medium">{name2}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
