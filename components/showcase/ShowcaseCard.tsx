import Link from 'next/link';
import { cn, getAvatarColor } from '@/lib/utils';
import type { Tool, ShowcaseMediaType } from '@/types';

interface ShowcaseCardProps {
  toolSlug: string;
  toolName?: string;
  toolLogoUrl?: string | null;
  mediaType: ShowcaseMediaType;
  resultImageUrl?: string | null;
  resultText?: string | null;
  resultDescription: string;
}

export default function ShowcaseCard({
  toolSlug,
  toolName = toolSlug,
  toolLogoUrl,
  mediaType,
  resultImageUrl,
  resultText,
  resultDescription,
}: ShowcaseCardProps) {
  return (
    <Link
      href={`/tools/${toolSlug}`}
      className="group block rounded-xl border border-border bg-white overflow-hidden hover:border-primary hover:shadow-md transition-all"
    >
      {/* 이미지 타입 */}
      {mediaType === 'image' && resultImageUrl && (
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          <img
            src={resultImageUrl}
            alt={`${toolName} 결과`}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
            <ToolBadge name={toolName} logoUrl={toolLogoUrl} />
          </div>
        </div>
      )}

      {/* 이미지 없는 경우 (이미지 타입이지만 URL 없음) */}
      {mediaType === 'image' && !resultImageUrl && (
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-primary/5 to-primary/15 flex items-center justify-center">
          <p className="text-sm text-gray-400 px-4 text-center">{resultDescription}</p>
          <div className="absolute bottom-2 left-2">
            <ToolBadge name={toolName} logoUrl={toolLogoUrl} />
          </div>
        </div>
      )}

      {/* 텍스트 타입 */}
      {mediaType === 'text' && (
        <div className="p-4">
          <ToolBadge name={toolName} logoUrl={toolLogoUrl} />
          {resultText ? (
            <p className="mt-2.5 text-xs text-gray-700 leading-relaxed line-clamp-5 whitespace-pre-line">
              {resultText}
            </p>
          ) : (
            <p className="mt-2.5 text-xs text-gray-400 italic">{resultDescription}</p>
          )}
        </div>
      )}

      {/* 코드 타입 */}
      {mediaType === 'code' && (
        <div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 border-b border-gray-700">
            <div className="flex gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
            </div>
            <ToolBadge name={toolName} logoUrl={toolLogoUrl} dark />
          </div>
          <pre className="p-3 bg-gray-900 text-xs leading-relaxed text-gray-300 overflow-x-auto max-h-40">
            <code>{resultText}</code>
          </pre>
        </div>
      )}

      {/* 설명 (이미지 타입은 이미 내부에 오버레이) */}
      {mediaType !== 'image' && (
        <div className="px-4 pb-3 pt-2 border-t border-border">
          <p className="text-xs text-gray-400">{resultDescription}</p>
        </div>
      )}

      {/* 이미지 타입 설명 */}
      {mediaType === 'image' && (
        <div className="px-3 py-2.5">
          <p className="text-xs text-gray-500">{resultDescription}</p>
        </div>
      )}
    </Link>
  );
}

function ToolBadge({ name, logoUrl, dark }: { name: string; logoUrl?: string | null; dark?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      {logoUrl ? (
        <img src={logoUrl} alt={name} className="h-4 w-4 rounded object-cover" />
      ) : (
        <div className={cn('flex h-4 w-4 items-center justify-center rounded text-[8px] font-bold text-white', getAvatarColor(name))}>
          {name.charAt(0)}
        </div>
      )}
      <span className={cn('text-xs font-semibold', dark ? 'text-gray-300' : 'text-foreground')}>
        {name}
      </span>
    </div>
  );
}
