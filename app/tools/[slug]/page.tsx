import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Star, ExternalLink, Zap, ThumbsUp, ArrowLeft, Check, X } from 'lucide-react';
import { SITE_NAME, PRICING_CONFIG, FEATURE_RATING_LABELS } from '@/lib/constants';
import { getToolBySlug, getCategoryBySlug, getSimilarTools, getCategories } from '@/lib/supabase/queries';
import { cn, getAvatarColor, formatRating, formatVisitCount } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import ServiceCard from '@/components/service/ServiceCard';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
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

export function generateStaticParams() {
  const categories = getCategories();
  const { getTools } = require('@/lib/supabase/queries');
  const tools = getTools();
  return tools.map((tool: { slug: string }) => ({ slug: tool.slug }));
}

export default async function ToolDetailPage({ params }: Props) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();

  const categories = getCategories();
  const category = categories.find((c) => c.id === tool.category_id);
  const similarTools = getSimilarTools(tool, 3);
  const pricingStyle = PRICING_CONFIG[tool.pricing_type];
  const pricingVariant = tool.pricing_type === 'Free' ? 'free' : tool.pricing_type === 'Freemium' ? 'freemium' : 'paid';

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
              <img src={tool.logo_url} alt={tool.name} className="h-16 w-16 rounded-xl object-cover" />
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
                  <span>({tool.review_count}개 리뷰)</span>
                </div>
                <span>{formatVisitCount(tool.visit_count)} 방문</span>
              </div>
            </div>
          </div>

          {/* 서비스 바로가기 */}
          <a
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-white hover:bg-primary-hover transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            {tool.name} 바로가기
          </a>

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

          {/* 기능별 평균 점수 (Phase 4에서 실제 데이터 연동) */}
          <section className="rounded-xl border border-border bg-white p-6">
            <h2 className="text-lg font-bold text-foreground">기능별 평가</h2>
            <p className="mt-1 text-xs text-gray-400">사용자 리뷰 기반 (Phase 4에서 연동)</p>
            <div className="mt-4 space-y-3">
              {Object.entries(FEATURE_RATING_LABELS).map(([key, label]) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="w-24 text-sm text-gray-600">{label}</span>
                  <div className="flex-1 h-2 rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(tool.rating_avg / 5) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-sm font-medium text-gray-700">
                    {formatRating(tool.rating_avg)}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* 리뷰 영역 (Phase 4에서 인터랙션 추가) */}
          <section className="rounded-xl border border-border bg-white p-6">
            <h2 className="text-lg font-bold text-foreground">리뷰</h2>
            <p className="mt-2 text-sm text-gray-400">
              아직 리뷰가 없습니다. Phase 4에서 리뷰 작성 기능이 추가됩니다.
            </p>
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
                <dt className="text-gray-500">리뷰 수</dt>
                <dd className="font-medium">{tool.review_count.toLocaleString()}개</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">방문 수</dt>
                <dd className="font-medium">{formatVisitCount(tool.visit_count)}</dd>
              </div>
            </dl>
          </div>

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
    </div>
  );
}
