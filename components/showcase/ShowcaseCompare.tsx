import { Sparkles, MessageSquareQuote } from 'lucide-react';
import { cn, getAvatarColor } from '@/lib/utils';
import type { Tool, ToolShowcase, CategoryShowcase } from '@/types';

interface ShowcaseCompareProps {
  tools: Tool[];
  toolShowcases: Map<string, (ToolShowcase & { showcase?: CategoryShowcase })[]>;
}

export default function ShowcaseCompare({ tools, toolShowcases }: ShowcaseCompareProps) {
  if (tools.length < 2) return null;

  // 두 도구가 공통으로 가진 showcase_id 찾기
  const slugA = tools[0].slug;
  const slugB = tools[1].slug;
  const showcasesA = toolShowcases.get(slugA) || [];
  const showcasesB = toolShowcases.get(slugB) || [];

  const commonShowcaseIds = showcasesA
    .map((s) => s.showcase_id)
    .filter((id) => showcasesB.some((s) => s.showcase_id === id));

  if (commonShowcaseIds.length === 0) return null;

  const showcaseId = commonShowcaseIds[0];
  const itemA = showcasesA.find((s) => s.showcase_id === showcaseId);
  const itemB = showcasesB.find((s) => s.showcase_id === showcaseId);
  const showcase = itemA?.showcase || itemB?.showcase;

  if (!itemA || !itemB || !showcase) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-bold text-foreground">같은 프롬프트, 다른 결과</h3>
      </div>

      {/* 프롬프트 */}
      <div className="rounded-xl bg-gray-50 p-4 border-l-4 border-primary mb-4">
        <div className="flex items-start gap-2">
          <MessageSquareQuote className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-foreground">&ldquo;{showcase.prompt_ko}&rdquo;</p>
            <p className="mt-1 text-xs text-gray-400 italic">{showcase.prompt}</p>
          </div>
        </div>
      </div>

      {/* 좌우 비교 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[{ tool: tools[0], item: itemA }, { tool: tools[1], item: itemB }].map(({ tool, item }) => (
          <div key={tool.slug} className="rounded-xl border border-border bg-white overflow-hidden">
            {/* 도구 헤더 */}
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border bg-gray-50">
              {tool.logo_url ? (
                <img src={tool.logo_url} alt={tool.name} className="h-5 w-5 rounded object-cover" />
              ) : (
                <div className={cn('flex h-5 w-5 items-center justify-center rounded text-white text-xs font-bold', getAvatarColor(tool.name))}>
                  {tool.name.charAt(0)}
                </div>
              )}
              <span className="text-xs font-semibold text-foreground">{tool.name}</span>
            </div>

            {/* 결과 */}
            {showcase.media_type === 'image' && item.result_image_url ? (
              <div className="aspect-[4/3] overflow-hidden">
                <img src={item.result_image_url} alt={`${tool.name} 결과`} className="h-full w-full object-cover" />
              </div>
            ) : showcase.media_type === 'code' && item.result_text ? (
              <pre className="p-3 bg-gray-900 text-xs leading-relaxed text-gray-300 whitespace-pre-wrap overflow-x-auto max-h-48">
                <code>{item.result_text}</code>
              </pre>
            ) : item.result_text ? (
              <div className="p-3">
                <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line line-clamp-8">
                  {item.result_text}
                </p>
              </div>
            ) : (
              <div className="p-3 text-center text-xs text-gray-400">결과 없음</div>
            )}

            {/* 설명 */}
            <div className="px-3 py-2 border-t border-border">
              <p className="text-xs text-gray-400">{item.result_description || ''}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
