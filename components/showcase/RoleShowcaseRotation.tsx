'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Lightbulb, Zap } from 'lucide-react';
import { cn, getAvatarColor } from '@/lib/utils';
import type { RoleShowcase, RoleUseCaseShowcase, Tool } from '@/types';

interface RoleShowcaseRotationProps {
  jobShowcases: (RoleShowcase & { useCases: (RoleUseCaseShowcase & { tool?: Tool })[] })[];
  eduShowcases: (RoleShowcase & { useCases: (RoleUseCaseShowcase & { tool?: Tool })[] })[];
}

export default function RoleShowcaseRotation({ jobShowcases, eduShowcases }: RoleShowcaseRotationProps) {
  const [activeTab, setActiveTab] = useState<'job' | 'edu'>('job');
  const [jobIdx, setJobIdx] = useState(0);
  const [eduIdx, setEduIdx] = useState(0);

  const items = activeTab === 'job' ? jobShowcases : eduShowcases;
  const currentIdx = activeTab === 'job' ? jobIdx : eduIdx;
  const current = items[currentIdx];

  // Auto-rotate every 8 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      if (activeTab === 'job') {
        setJobIdx((prev) => (prev + 1) % jobShowcases.length);
      } else {
        setEduIdx((prev) => (prev + 1) % eduShowcases.length);
      }
    }, 8000);
    return () => clearInterval(timer);
  }, [activeTab, jobShowcases.length, eduShowcases.length]);

  if (!current || current.useCases.length === 0) return null;

  const detailPath = activeTab === 'job'
    ? `/jobs/${current.target_slug}`
    : `/education/${current.target_slug}`;

  return (
    <section className="mb-10">
      {/* 탭 */}
      <div className="flex items-center gap-3 mb-4">
        <Lightbulb className="h-5 w-5 text-amber-500" />
        <div className="flex gap-1.5">
          <button
            onClick={() => setActiveTab('job')}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-semibold transition-colors',
              activeTab === 'job' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            )}
          >
            직업별 AI 활용
          </button>
          <button
            onClick={() => setActiveTab('edu')}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-semibold transition-colors',
              activeTab === 'edu' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            )}
          >
            교육 AI 활용
          </button>
        </div>
      </div>

      {/* 현재 쇼케이스 */}
      <div className="rounded-xl border border-border bg-white overflow-hidden">
        {/* 헤더 */}
        <div className="px-5 py-4 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">{current.title}</h3>
              <p className="mt-0.5 text-xs text-gray-500">{current.subtitle}</p>
            </div>
            <Link
              href={detailPath}
              className="shrink-0 flex items-center gap-1 rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-primary-hover transition-colors"
            >
              자세히 보기
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* 활용 사례 미리보기 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border">
          {current.useCases.slice(0, 3).map((uc) => (
            <div key={uc.id} className="p-4">
              <div className="flex items-center gap-2 mb-2">
                {uc.tool?.logo_url ? (
                  <img src={uc.tool.logo_url} alt={uc.tool.name} className="h-6 w-6 rounded object-cover" />
                ) : (
                  <div className={cn('flex h-6 w-6 items-center justify-center rounded text-white text-[9px] font-bold', getAvatarColor(uc.tool?.name || uc.tool_slug))}>
                    {(uc.tool?.name || uc.tool_slug).charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-semibold text-foreground">{uc.title}</span>
              </div>
              <p className="text-[11px] text-gray-500 line-clamp-2 mb-2">{uc.description}</p>
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-amber-500" />
                <span className="text-[10px] font-semibold text-amber-700">{uc.outcome}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 로테이션 인디케이터 */}
      <div className="flex justify-center gap-1.5 mt-3">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => activeTab === 'job' ? setJobIdx(i) : setEduIdx(i)}
            className={cn(
              'h-1.5 rounded-full transition-all',
              i === currentIdx ? 'w-6 bg-primary' : 'w-1.5 bg-gray-300 hover:bg-gray-400'
            )}
          />
        ))}
      </div>
    </section>
  );
}
