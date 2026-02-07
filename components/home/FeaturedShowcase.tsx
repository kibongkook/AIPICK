import Link from 'next/link';
import { Eye, ArrowRight } from 'lucide-react';
import type { Tool, CategoryShowcase, ToolShowcase } from '@/types';

interface FeaturedShowcaseProps {
  showcase: CategoryShowcase;
  items: (ToolShowcase & { tool?: Tool })[];
}

export default function FeaturedShowcase({ showcase, items }: FeaturedShowcaseProps) {
  if (!showcase || items.length === 0) return null;

  const featured = items[0];
  const runners = items.slice(1, 4);

  return (
    <section className="mt-8">
      <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* 좌: 프롬프트 + 맥락 */}
          <div className="p-6 sm:p-8 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="h-4 w-4 text-primary" />
              <span className="text-xs text-primary font-bold uppercase tracking-wider">AI 결과 미리보기</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">
              같은 요청,<br />다른 결과
            </h2>
            <div className="mt-4 rounded-lg bg-white/10 px-4 py-3 border-l-2 border-primary">
              <p className="text-sm text-gray-200 italic">
                &ldquo;{showcase.prompt_ko}&rdquo;
              </p>
            </div>

            {/* 러너업 도구들 */}
            {runners.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {runners.map((item) => item.tool && (
                  <Link
                    key={item.id}
                    href={`/tools/${item.tool.slug}`}
                    className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs text-gray-300 hover:bg-white/20 transition-colors"
                  >
                    {item.tool.logo_url && (
                      <img src={item.tool.logo_url} alt="" className="h-4 w-4 rounded object-cover" />
                    )}
                    <span>{item.tool.name}</span>
                  </Link>
                ))}
              </div>
            )}

            <Link
              href={`/category/${showcase.category_slug}`}
              className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hover transition-colors"
            >
              더 많은 AI 결과 보기
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* 우: 대표 결과물 */}
          <div className="relative">
            {showcase.media_type === 'image' && featured.result_image_url ? (
              <div className="aspect-[4/3] lg:aspect-auto lg:h-full overflow-hidden">
                <img
                  src={featured.result_image_url}
                  alt={featured.result_description}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
            ) : featured.result_text ? (
              <div className="p-6 lg:p-8 flex items-center h-full">
                <div className="rounded-xl bg-white/10 p-5 w-full">
                  <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-line line-clamp-8">
                    {featured.result_text}
                  </p>
                </div>
              </div>
            ) : null}

            {/* 도구 뱃지 */}
            {featured.tool && (
              <Link
                href={`/tools/${featured.tool.slug}`}
                className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-black/60 backdrop-blur-sm px-3 py-1.5 hover:bg-black/80 transition-colors"
              >
                {featured.tool.logo_url && (
                  <img src={featured.tool.logo_url} alt="" className="h-5 w-5 rounded object-cover" />
                )}
                <span className="text-xs font-semibold text-white">{featured.tool.name}</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
