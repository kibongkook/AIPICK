import Link from 'next/link';
import { Star, Zap } from 'lucide-react';
import type { Tool } from '@/types';
import { PRICING_CONFIG } from '@/lib/constants';
import { cn, getAvatarColor, formatRating } from '@/lib/utils';
import Badge from '@/components/ui/Badge';

interface ServiceCardProps {
  tool: Tool;
}

export default function ServiceCard({ tool }: ServiceCardProps) {
  const pricingStyle = PRICING_CONFIG[tool.pricing_type];
  const pricingVariant = tool.pricing_type === 'Free' ? 'free' : tool.pricing_type === 'Freemium' ? 'freemium' : 'paid';

  return (
    <Link href={`/tools/${tool.slug}`}>
      <div className="group rounded-xl border border-border bg-white p-5 shadow-sm card-hover">
        {/* 상단: 로고 + 이름 + 설명 */}
        <div className="flex items-start gap-3">
          {/* 로고 또는 아바타 */}
          {tool.logo_url ? (
            <img
              src={tool.logo_url}
              alt={tool.name}
              className="h-10 w-10 rounded-lg object-cover"
            />
          ) : (
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg text-white text-sm font-bold',
                getAvatarColor(tool.name)
              )}
            >
              {tool.name.charAt(0)}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
              {tool.name}
            </h3>
            <p className="mt-0.5 text-xs text-gray-500 line-clamp-2 leading-relaxed">
              {tool.description}
            </p>
          </div>
        </div>

        {/* 무료 사용량 뱃지 (핵심 강조) */}
        {tool.free_quota_detail && (
          <div className="mt-3">
            <Badge variant="quota" className="text-xs">
              <Zap className="mr-1 h-3 w-3" />
              {tool.free_quota_detail}
            </Badge>
          </div>
        )}

        {/* 하단: 평점 + 가격 타입 */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-medium text-gray-700">
              {formatRating(tool.rating_avg)}
            </span>
            {tool.review_count > 0 && (
              <span className="text-xs text-gray-400">({tool.review_count})</span>
            )}
          </div>
          <Badge variant={pricingVariant}>{pricingStyle.label}</Badge>
        </div>

        {/* 태그 */}
        {tool.tags.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1">
            {tool.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="tag" className="text-[10px]">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
