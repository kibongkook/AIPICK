import type { Metadata } from 'next';
import Link from 'next/link';
import { RefreshCw, ExternalLink } from 'lucide-react';

import { SITE_NAME, TOOL_UPDATE_TYPES, TOOL_UPDATE_FILTER_TABS, UPDATE_IMPACT } from '@/lib/constants';
import { getRecentUpdates, getRecentUpdatesByType } from '@/lib/supabase/queries';
import { cn } from '@/lib/utils';
import DynamicIcon from '@/components/ui/DynamicIcon';
import LogoImage from '@/components/ui/LogoImage';

import type { ToolUpdateType, UpdateImpact } from '@/types';

export const metadata: Metadata = {
  title: `AI 서비스 업데이트 | ${SITE_NAME}`,
  description: '등록된 AI 서비스들의 최신 업데이트, 신기능, 모델 변경, 가격 변동 소식을 확인하세요.',
};

interface Props {
  searchParams: Promise<{ type?: string }>;
}

export default async function UpdatesPage({ searchParams }: Props) {
  const { type } = await searchParams;
  const validType = type && type in TOOL_UPDATE_TYPES ? type as ToolUpdateType : undefined;

  const updates = validType
    ? await getRecentUpdatesByType(validType, 50)
    : await getRecentUpdates(50);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="mb-1 flex items-center gap-2">
          <RefreshCw className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">AI 서비스 업데이트</h1>
        </div>
        <p className="text-sm text-gray-500">등록된 AI 서비스들의 최신 변경사항을 확인하세요.</p>
      </div>

      {/* 타입 필터 */}
      <div className="mb-6 flex flex-wrap gap-2">
        {TOOL_UPDATE_FILTER_TABS.map(({ key, label }) => {
          const isActive = key === null ? !validType : validType === key;
          return (
            <a
              key={key ?? 'all'}
              href={key ? `/updates?type=${key}` : '/updates'}
              className={cn(
                'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                isActive ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
              )}
            >
              {label}
            </a>
          );
        })}
      </div>

      {/* 업데이트 리스트 */}
      {updates.length > 0 ? (
        <div className="flex flex-col gap-4">
          {updates.map((update) => {
            const typeConfig = TOOL_UPDATE_TYPES[update.update_type as ToolUpdateType] || TOOL_UPDATE_TYPES.other;
            const impactConfig = UPDATE_IMPACT[update.impact as UpdateImpact] || UPDATE_IMPACT.minor;
            const isMajor = update.impact === 'major';

            return (
              <div
                key={update.id}
                className={cn(
                  'rounded-xl border bg-white p-5 transition-shadow hover:shadow-md',
                  isMajor ? 'border-blue-200' : 'border-border',
                )}
              >
                <div className="flex items-start gap-4">
                  {/* 도구 로고 */}
                  {update.tool && (
                    <Link href={`/tools/${update.tool.slug}`} className="shrink-0">
                      {update.tool.logo_url ? (
                        <LogoImage
                          src={update.tool.logo_url}
                          alt={update.tool.name}
                          className="h-10 w-10 rounded-lg object-cover"
                          fallbackClassName="h-10 w-10 rounded-lg text-sm"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-sm font-bold text-gray-500">
                          {update.tool.name.charAt(0)}
                        </div>
                      )}
                    </Link>
                  )}

                  <div className="flex-1 min-w-0">
                    {/* 상단: 도구명 + 날짜 */}
                    <div className="mb-1 flex items-center gap-2 text-sm">
                      {update.tool && (
                        <Link href={`/tools/${update.tool.slug}`} className="font-semibold text-foreground hover:text-primary transition-colors">
                          {update.tool.name}
                        </Link>
                      )}
                      <time className="text-muted-foreground">{formatDate(update.announced_at)}</time>
                      {isMajor && (
                        <span className={cn('text-xs font-medium', impactConfig.color)}>
                          {impactConfig.label}
                        </span>
                      )}
                    </div>

                    {/* 타입 배지 + 제목 */}
                    <div className="flex items-start gap-2">
                      <span className={cn('inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', typeConfig.color)}>
                        <DynamicIcon name={typeConfig.icon} className="h-3.5 w-3.5" />
                        {typeConfig.label}
                      </span>
                      <h2 className="text-sm font-semibold text-foreground">
                        {update.title}
                      </h2>
                    </div>

                    {/* 설명 */}
                    {update.description && (
                      <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
                        {update.description}
                      </p>
                    )}

                    {/* 버전 + 소스 링크 */}
                    <div className="mt-2 flex items-center gap-3">
                      {update.version && (
                        <span className="text-xs text-muted-foreground">
                          v{update.version}
                        </span>
                      )}
                      {update.source_url && (
                        <a
                          href={update.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          공식 발표 보기
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-white p-12 text-center">
          <RefreshCw className="mx-auto h-12 w-12 text-gray-200" />
          <p className="mt-4 text-sm text-gray-400">해당 타입의 업데이트가 없습니다.</p>
        </div>
      )}
    </div>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}.${month.toString().padStart(2, '0')}.${day.toString().padStart(2, '0')}`;
}
