import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Star, ExternalLink, Zap, ThumbsUp, ArrowLeft, Check, X, Info, Lightbulb } from 'lucide-react';
import { SITE_NAME, SITE_URL, PRICING_CONFIG } from '@/lib/constants';
import { getToolBySlug, getCategoryBySlug, getSimilarTools, getCategories, getTools, getToolBenchmarks, getToolExternalScores } from '@/lib/supabase/queries';
import { getPopularCompareTargets, getCompareUrl } from '@/lib/compare/popular-pairs';
import { cn, getAvatarColor, formatRating, formatVisitCount } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import ServiceCard from '@/components/service/ServiceCard';
import { BookmarkButton, UpvoteButton } from '@/components/service/ToolInteractions';
import CommunitySection from '@/components/community/CommunitySection';
import TrendBadge from '@/components/ranking/TrendBadge';
import ScoreBreakdown from '@/components/ranking/ScoreBreakdown';
import ToolShowcaseStrip from '@/components/showcase/ToolShowcaseStrip';
import BenchmarkScores from '@/components/ranking/BenchmarkScores';
import { SoftwareApplicationJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import LogoImage from '@/components/ui/LogoImage';
import MobileStickyBar from '@/components/service/MobileStickyBar';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = await getToolBySlug(slug);
  if (!tool) return { title: '서비스를 찾을 수 없습니다' };

  return {
    title: `${tool.name} - 무료 사용량 및 상세 정보`,
    description: `${tool.name}: ${tool.description}. 무료 사용량: ${tool.free_quota_detail || '정보 없음'}`,
    openGraph: {
      title: `${tool.name} | ${SITE_NAME}`,
      description: tool.description,
    },
  };
}

export async function generateStaticParams() {
  const tools = await getTools();
  return tools.map((tool) => ({ slug: tool.slug }));
}

export default async function ToolDetailPage({ params }: Props) {
  const { slug } = await params;
  const tool = await getToolBySlug(slug);
  if (!tool) notFound();

  const categories = await getCategories();
  const category = categories.find((c) => c.id === tool.category_id);
  const [similarTools, benchmarks] = await Promise.all([
    getSimilarTools(tool, 3),
    tool.has_benchmark_data ? getToolBenchmarks(tool.id) : Promise.resolve([]),
  ]);
  const pricingStyle = PRICING_CONFIG[tool.pricing_type];
  const pricingVariant = tool.pricing_type === 'Free' ? 'free' : tool.pricing_type === 'Freemium' ? 'freemium' : 'paid';

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <SoftwareApplicationJsonLd tool={tool} />
      <BreadcrumbJsonLd
        items={[
          { name: '홈', url: SITE_URL },
          ...(category ? [{ name: category.name, url: `${SITE_URL}/category/${category.slug}` }] : []),
          { name: tool.name, url: `${SITE_URL}/tools/${tool.slug}` },
        ]}
      />
      {/* 뒤로가기 */}
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        돌아가기
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* 메인 콘텐츠 (2/3) */}
        <div className="lg:col-span-2 space-y-8">
          {/* 서비스 헤더 */}
          <div className="flex items-start gap-4">
            {tool.logo_url ? (
              <LogoImage
                src={tool.logo_url}
                alt={tool.name}
                className="h-16 w-16 rounded-xl object-cover"
                fallbackClassName="h-16 w-16 rounded-xl text-xl"
              />
            ) : (
              <div
                className={cn(
                  'flex h-16 w-16 items-center justify-center rounded-xl text-white text-xl font-bold',
                  getAvatarColor(tool.name)
                )}
              >
                {tool.name.charAt(0)}
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-foreground">{tool.name}</h1>
                <Badge variant={pricingVariant}>{pricingStyle.label}</Badge>
              </div>
              <p className="mt-1 text-gray-500">{tool.description}</p>
              <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                {category && (
                  <Link href={`/category/${category.slug}`} className="hover:text-primary transition-colors">
                    {category.name}
                  </Link>
                )}
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium text-gray-700">{formatRating(tool.rating_avg)}</span>
                  <span>({tool.review_count}개 평가)</span>
                </div>
                <span>{formatVisitCount(tool.visit_count)} 방문</span>
              </div>
            </div>
          </div>

          {/* 서비스 바로가기 + 액션 버튼 */}
          <div className="flex items-center gap-3 flex-wrap">
            <a
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-hover transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              {tool.name} 바로가기
            </a>
            <BookmarkButton toolId={tool.id} />
            <UpvoteButton toolId={tool.id} initialCount={tool.upvote_count} />
          </div>

          {/* 이런 결과를 만들 수 있어요 */}
          <ToolShowcaseStrip toolSlug={slug} tool={tool} />

          {/* 서비스 소개 */}
          {tool.long_description && (
            <section className="rounded-xl border border-border bg-white p-6">
              <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                <Info className="h-5 w-5 text-primary" />
                서비스 소개
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-700">
                {tool.long_description}
              </p>
            </section>
          )}

          {/* 무료로 어디까지? */}
          {tool.free_quota_detail && (
            <section className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-6">
              <h2 className="flex items-center gap-2 text-lg font-bold text-emerald-800">
                <Zap className="h-5 w-5" />
                무료로 어디까지?
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-emerald-700">
                {tool.free_quota_detail}
              </p>
              {tool.monthly_price && (
                <p className="mt-3 text-xs text-emerald-600">
                  유료 플랜: 월 ${tool.monthly_price}부터
                </p>
              )}
            </section>
          )}

          {/* 장점 / 단점 */}
          <section className="grid gap-4 sm:grid-cols-2">
            {tool.pros.length > 0 && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5">
                <h3 className="flex items-center gap-2 font-semibold text-emerald-700">
                  <ThumbsUp className="h-4 w-4" />
                  장점
                </h3>
                <ul className="mt-3 space-y-2">
                  {tool.pros.map((pro, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {tool.cons.length > 0 && (
              <div className="rounded-xl border border-red-200 bg-red-50/50 p-5">
                <h3 className="flex items-center gap-2 font-semibold text-red-700">
                  <X className="h-4 w-4" />
                  단점
                </h3>
                <ul className="mt-3 space-y-2">
                  {tool.cons.map((con, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* 활용 팁 */}
          {tool.usage_tips && tool.usage_tips.length > 0 && (
            <section className="rounded-xl border-2 border-amber-200 bg-amber-50 p-6">
              <h2 className="flex items-center gap-2 text-lg font-bold text-amber-800">
                <Lightbulb className="h-5 w-5" />
                활용 팁
              </h2>
              <ol className="mt-3 space-y-2">
                {tool.usage_tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-amber-900">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-200 text-xs font-bold text-amber-800">
                      {i + 1}
                    </span>
                    {tip}
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* 커뮤니티 (평가 + 자유글 + 팁 + 질문) */}
          <section className="rounded-xl border border-border bg-white p-6">
            <CommunitySection targetType="tool" targetId={tool.id} />
          </section>
        </div>

        {/* 사이드바 (1/3) */}
        <div className="space-y-6">
          {/* 서비스 정보 요약 */}
          <div className="rounded-xl border border-border bg-white p-5">
            <h3 className="font-semibold text-foreground">서비스 정보</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">가격 유형</dt>
                <dd><Badge variant={pricingVariant}>{pricingStyle.label}</Badge></dd>
              </div>
              {tool.monthly_price && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">월 가격</dt>
                  <dd className="font-medium">${tool.monthly_price}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-gray-500">한국어 지원</dt>
                <dd className="font-medium">{tool.supports_korean ? '지원' : '미지원'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">평점</dt>
                <dd className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{formatRating(tool.rating_avg)}</span>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">평가 수</dt>
                <dd className="font-medium">{tool.review_count.toLocaleString()}개</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">방문 수</dt>
                <dd className="font-medium">{formatVisitCount(tool.visit_count)}</dd>
              </div>
            </dl>
          </div>

          {/* 트렌드 + 점수 구성 */}
          {(tool.hybrid_score > 0 || tool.trend_direction !== 'stable') && (
            <div className="space-y-4">
              {tool.trend_direction && tool.trend_direction !== 'stable' && (
                <div className="rounded-xl border border-border bg-white p-5 flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">주간 트렌드</span>
                  <TrendBadge direction={tool.trend_direction} magnitude={tool.trend_magnitude || 0} size="md" />
                </div>
              )}
              {tool.hybrid_score > 0 && (
                <ScoreBreakdown
                  hybridScore={tool.hybrid_score}
                  internalScore={tool.internal_score || tool.hybrid_score}
                  externalScore={tool.external_score || 0}
                />
              )}
            </div>
          )}

          {/* 벤치마크 점수 */}
          {benchmarks.length > 0 && (
            <BenchmarkScores benchmarks={benchmarks} />
          )}

          {/* 태그 */}
          {tool.tags.length > 0 && (
            <div className="rounded-xl border border-border bg-white p-5">
              <h3 className="font-semibold text-foreground">태그</h3>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {tool.tags.map((tag) => (
                  <Badge key={tag} variant="tag">#{tag}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* 비교하기 */}
          {(() => {
            const compareTargets = getPopularCompareTargets(tool.slug);
            if (compareTargets.length === 0) return null;
            return (
              <div className="rounded-xl border border-border bg-white p-5">
                <h3 className="font-semibold text-foreground">다른 도구와 비교</h3>
                <div className="mt-3 space-y-2">
                  {compareTargets.slice(0, 3).map((targetSlug) => (
                    <Link
                      key={targetSlug}
                      href={getCompareUrl(tool.slug, targetSlug)}
                      className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:border-primary hover:bg-primary/5 transition-all"
                    >
                      <ArrowLeft className="h-3.5 w-3.5 text-primary rotate-180" />
                      <span className="font-medium">{tool.name}</span>
                      <span className="text-gray-400">vs</span>
                      <span className="font-medium capitalize">{targetSlug.replace(/-/g, ' ')}</span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* 유사 서비스 */}
          {similarTools.length > 0 && (
            <div className="rounded-xl border border-border bg-white p-5">
              <h3 className="font-semibold text-foreground">유사한 서비스</h3>
              <div className="mt-3 space-y-3">
                {similarTools.map((st) => (
                  <ServiceCard key={st.id} tool={st} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 모바일 하단 CTA */}
      <MobileStickyBar toolName={tool.name} toolUrl={tool.url} />
    </div>
  );
}
