import { Sparkles, MessageSquareQuote, Lightbulb } from 'lucide-react';
import { getToolShowcases } from '@/lib/supabase/queries';
import type { Tool, ShowcaseMediaType } from '@/types';

interface ToolShowcaseStripProps {
  toolSlug: string;
  tool?: Tool;
}

export default async function ToolShowcaseStrip({ toolSlug, tool }: ToolShowcaseStripProps) {
  const showcases = await getToolShowcases(toolSlug);

  // 쇼케이스 데이터가 있으면 기존 렌더링
  if (showcases.length > 0) {
    return (
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">이런 결과를 만들 수 있어요</h3>
        </div>

        <div className="space-y-3">
          {showcases.slice(0, 2).map((item) => {
            const mediaType = item.showcase?.media_type as ShowcaseMediaType | undefined;
            return (
              <div key={item.id} className="rounded-xl border border-border bg-white overflow-hidden">
                {/* 프롬프트 */}
                {item.showcase && (
                  <div className="px-4 py-2.5 border-b border-border bg-gray-50">
                    <div className="flex items-start gap-1.5">
                      <MessageSquareQuote className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                      <p className="text-[11px] text-gray-600 italic">
                        &ldquo;{item.showcase.prompt_ko}&rdquo;
                      </p>
                    </div>
                  </div>
                )}

                {/* 결과 */}
                {mediaType === 'image' && item.result_image_url ? (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={item.result_image_url}
                      alt={item.result_description}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : mediaType === 'code' && item.result_text ? (
                  <pre className="p-3 bg-gray-900 text-[10px] leading-relaxed text-gray-300 whitespace-pre-wrap overflow-x-auto max-h-40">
                    <code>{item.result_text}</code>
                  </pre>
                ) : item.result_text ? (
                  <div className="p-4">
                    <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line line-clamp-5">
                      {item.result_text}
                    </p>
                  </div>
                ) : null}

                {/* 설명 */}
                <div className="px-4 py-2 border-t border-border">
                  <p className="text-[11px] text-gray-400">{item.result_description || ''}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  // 폴백: sample_output이 있으면 예시 결과 표시
  if (!tool?.sample_output) return null;

  const primaryCategory = tool.categories?.find(c => c.is_primary) || tool.categories?.[0];
  const isCode = primaryCategory?.slug === 'coding';

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="h-4 w-4 text-amber-500" />
        <h3 className="text-sm font-bold text-foreground">이런 결과를 만들 수 있어요</h3>
        <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">예시</span>
      </div>

      <div className="rounded-xl border border-border bg-white overflow-hidden">
        {/* 프롬프트 */}
        {tool.sample_output_prompt && (
          <div className="px-4 py-2.5 border-b border-border bg-gray-50">
            <div className="flex items-start gap-1.5">
              <MessageSquareQuote className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-gray-600 italic">
                &ldquo;{tool.sample_output_prompt}&rdquo;
              </p>
            </div>
          </div>
        )}

        {/* 결과 */}
        {isCode ? (
          <pre className="p-3 bg-gray-900 text-[10px] leading-relaxed text-gray-300 whitespace-pre-wrap overflow-x-auto max-h-40">
            <code>{tool.sample_output}</code>
          </pre>
        ) : (
          <div className="p-4">
            <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line line-clamp-8">
              {tool.sample_output}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
