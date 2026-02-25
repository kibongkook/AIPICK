'use client';

import { useState } from 'react';
import { ExternalLink } from 'lucide-react';

import { cn } from '@/lib/utils';
import { TOOL_UPDATE_TYPES, UPDATE_IMPACT, TOOL_UPDATES_PREVIEW_COUNT } from '@/lib/constants';
import DynamicIcon from '@/components/ui/DynamicIcon';

import type { ToolUpdate, ToolUpdateType, UpdateImpact } from '@/types';

interface ToolUpdateTimelineProps {
  updates: ToolUpdate[];
}

export default function ToolUpdateTimeline({ updates }: ToolUpdateTimelineProps) {
  const [expanded, setExpanded] = useState(false);

  if (updates.length === 0) return null;

  const visibleUpdates = expanded ? updates : updates.slice(0, TOOL_UPDATES_PREVIEW_COUNT);

  return (
    <section className="mt-10">
      <h2 className="mb-6 text-xl font-bold text-foreground">업데이트 이력</h2>

      <div className="relative">
        {/* 세로 타임라인 선 */}
        <div className="absolute left-3 top-2 bottom-2 w-px bg-border" />

        <div className="space-y-6">
          {visibleUpdates.map((update) => {
            const typeConfig = TOOL_UPDATE_TYPES[update.update_type as ToolUpdateType] || TOOL_UPDATE_TYPES.other;
            const impactConfig = UPDATE_IMPACT[update.impact as UpdateImpact] || UPDATE_IMPACT.minor;
            const isMajor = update.impact === 'major';

            return (
              <div key={update.id} className="relative pl-9">
                {/* 타임라인 도트 */}
                <div
                  className={cn(
                    'absolute top-1.5 rounded-full border-2 border-white',
                    isMajor ? 'h-6 w-6 bg-blue-500' : 'h-4 w-4 bg-gray-300',
                  )}
                  style={{ left: isMajor ? '-1px' : '4px' }}
                />

                {/* 날짜 + impact 배지 */}
                <div className="mb-1 flex items-center gap-2">
                  <time className="text-sm text-muted-foreground">
                    {formatDate(update.announced_at)}
                  </time>
                  {isMajor && (
                    <span className={cn('text-xs font-medium', impactConfig.color)}>
                      {impactConfig.label}
                    </span>
                  )}
                </div>

                {/* 타입 아이콘 + 제목 */}
                <div className="flex items-start gap-2">
                  <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', typeConfig.color)}>
                    <DynamicIcon name={typeConfig.icon} className="h-3.5 w-3.5" />
                    {typeConfig.label}
                  </span>
                  <h3 className={cn('text-sm font-semibold text-foreground', isMajor && 'text-base')}>
                    {update.title}
                  </h3>
                </div>

                {/* 설명 */}
                {update.description && (
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {update.description}
                  </p>
                )}

                {/* 버전 + 소스 링크 */}
                <div className="mt-1.5 flex items-center gap-3">
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
            );
          })}
        </div>
      </div>

      {/* 더 보기 / 접기 */}
      {updates.length > TOOL_UPDATES_PREVIEW_COUNT && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 text-sm font-medium text-primary hover:underline"
        >
          {expanded ? '접기' : `더 보기 (${updates.length - TOOL_UPDATES_PREVIEW_COUNT}개)`}
        </button>
      )}
    </section>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}.${month.toString().padStart(2, '0')}.${day.toString().padStart(2, '0')}`;
}
