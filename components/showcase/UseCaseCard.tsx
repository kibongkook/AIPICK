import Link from 'next/link';
import { ArrowRight, Zap, MessageSquareQuote } from 'lucide-react';
import { cn, getAvatarColor } from '@/lib/utils';
import type { Tool, RoleUseCaseShowcase } from '@/types';

interface UseCaseCardProps {
  useCase: RoleUseCaseShowcase & { tool?: Tool };
}

export default function UseCaseCard({ useCase }: UseCaseCardProps) {
  const tool = useCase.tool;
  const hasImage = !!useCase.result_image_url;
  const hasText = !!useCase.result_text;

  return (
    <div className="rounded-xl border border-border bg-white overflow-hidden hover:shadow-md transition-shadow">
      {/* 상단: 도구 정보 + 제목 */}
      <div className="p-4 pb-3">
        <div className="flex items-center gap-2.5 mb-2.5">
          {tool?.logo_url ? (
            <img src={tool.logo_url} alt={tool.name} className="h-8 w-8 rounded-lg object-cover" />
          ) : (
            <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg text-white text-sm font-bold', getAvatarColor(tool?.name || useCase.tool_slug))}>
              {(tool?.name || useCase.tool_slug).charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h3 className="text-sm font-bold text-foreground">{useCase.title}</h3>
            <p className="text-[11px] text-gray-400">{tool?.name || useCase.tool_slug}</p>
          </div>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed">{useCase.description}</p>
      </div>

      {/* 프롬프트 예시 */}
      {useCase.prompt_example && (
        <div className="mx-4 mb-3 rounded-lg bg-gray-50 px-3 py-2.5 border-l-3 border-primary/30">
          <div className="flex items-start gap-1.5">
            <MessageSquareQuote className="h-3 w-3 text-primary shrink-0 mt-0.5" />
            <p className="text-[11px] text-gray-600 leading-relaxed italic">
              &ldquo;{useCase.prompt_example}&rdquo;
            </p>
          </div>
        </div>
      )}

      {/* 결과 이미지 */}
      {hasImage && (
        <div className="mx-4 mb-3 rounded-lg overflow-hidden">
          <img
            src={useCase.result_image_url!}
            alt={useCase.title}
            className="w-full aspect-video object-cover"
          />
        </div>
      )}

      {/* 결과 텍스트 */}
      {hasText && !hasImage && (
        <div className="mx-4 mb-3 rounded-lg bg-gray-900 p-3">
          <pre className="text-[10px] leading-relaxed text-gray-300 whitespace-pre-wrap overflow-x-auto max-h-32">
            <code>{useCase.result_text}</code>
          </pre>
        </div>
      )}

      {/* 하단: 성과 + 링크 */}
      <div className="px-4 py-3 border-t border-border bg-gray-50/50 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Zap className="h-3.5 w-3.5 text-amber-500 shrink-0" />
          <span className="text-xs font-semibold text-amber-700 truncate">{useCase.outcome}</span>
        </div>
        {tool && (
          <Link
            href={`/tools/${tool.slug}`}
            className="shrink-0 flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
          >
            자세히
            <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>
    </div>
  );
}
