import Link from 'next/link';
import { Star, ChevronRight } from 'lucide-react';
import type { Tool } from '@/types';
import { cn, getAvatarColor, formatRating, formatVisitCount } from '@/lib/utils';
import TrendBadge from '@/components/ranking/TrendBadge';
import LogoImage from '@/components/ui/LogoImage';

interface ServiceCardProps {
  tool: Tool;
  compact?: boolean;
}

/**
 * Product Hunt 스타일 미니멀 카드
 * 로고 + 이름 + 한줄 태그라인 + 핵심 메트릭 1개
 */
export default function ServiceCard({ tool, compact = false }: ServiceCardProps) {
  const trendDirection = tool.trend_direction || (tool.weekly_visit_delta > 5000 ? 'up' as const : 'stable' as const);
  const trendMagnitude = tool.trend_magnitude || 0;

  return (
    <Link href={`/tools/${tool.slug}`}>
      <div className={cn(
        'group flex items-center gap-3 rounded-xl border border-border bg-white card-hover',
        compact ? 'px-3 py-2.5' : 'px-4 py-3.5',
      )}>
        {/* 로고 */}
        {tool.logo_url ? (
          <LogoImage
            src={tool.logo_url}
            alt={tool.name}
            className={cn('rounded-xl object-cover shrink-0', compact ? 'h-10 w-10' : 'h-12 w-12')}
            fallbackClassName={cn(
              'rounded-xl shrink-0',
              compact ? 'h-10 w-10 text-sm' : 'h-12 w-12 text-base',
            )}
          />
        ) : (
          <div
            className={cn(
              'flex items-center justify-center rounded-xl text-white font-bold shrink-0',
              compact ? 'h-10 w-10 text-sm' : 'h-12 w-12 text-base',
              getAvatarColor(tool.name)
            )}
          >
            {tool.name.charAt(0)}
          </div>
        )}

        {/* 이름 + 한줄 설명 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
              {tool.name}
            </h3>
            {trendDirection !== 'stable' && (
              <TrendBadge direction={trendDirection} magnitude={trendMagnitude} size="sm" />
            )}
          </div>
          <p className="text-xs text-gray-400 truncate mt-0.5">
            {tool.free_quota_detail || tool.description}
          </p>
        </div>

        {/* 우측: 핵심 메트릭 */}
        <div className="shrink-0 flex flex-col items-center gap-0.5 min-w-[48px]">
          <div className="flex items-center gap-0.5">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-bold">{formatRating(tool.rating_avg)}</span>
          </div>
          <span className="text-[10px] text-gray-400">{formatVisitCount(tool.visit_count)}</span>
        </div>

        <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-primary shrink-0 transition-colors" />
      </div>
    </Link>
  );
}
