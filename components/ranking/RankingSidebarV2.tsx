'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Trophy, Star } from 'lucide-react';
import { formatRating } from '@/lib/utils';
import type { Tool } from '@/types';

interface RankingSidebarV2Props {
  topRanked: (Tool & { ranking: number })[];
  mostUsed: Tool[];
  recentlyPopular: Tool[];
  topRated: Tool[];
  fastestGrowing: Tool[];
}

export default function RankingSidebarV2({
  topRanked,
  mostUsed,
  recentlyPopular,
  topRated,
  fastestGrowing,
}: RankingSidebarV2Props) {
  const [activeTab, setActiveTab] = useState<'overall' | 'used' | 'popular' | 'rated' | 'growing'>('overall');

  const tabs = [
    { id: 'overall' as const, label: '종합', tools: topRanked },
    { id: 'used' as const, label: '많이 사용', tools: mostUsed.map((t, i) => ({ ...t, ranking: i + 1 })) },
    { id: 'popular' as const, label: '최근 인기', tools: recentlyPopular.map((t, i) => ({ ...t, ranking: i + 1 })) },
    { id: 'rated' as const, label: '높은 평가', tools: topRated.map((t, i) => ({ ...t, ranking: i + 1 })) },
    { id: 'growing' as const, label: '급상승', tools: fastestGrowing.map((t, i) => ({ ...t, ranking: i + 1 })) },
  ];

  const currentTools = tabs.find(t => t.id === activeTab)?.tools || [];

  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Trophy className="h-4 w-4 text-yellow-500" />
          <h3 className="text-sm font-bold text-foreground">TOP 5 랭킹</h3>
        </div>
        <Link href="/rankings" className="text-[11px] text-primary font-medium">전체 →</Link>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold transition-colors ${
              activeTab === tab.id
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 랭킹 목록 */}
      <div className="space-y-1">
        {currentTools.map((tool) => (
          <Link
            key={tool.id}
            href={`/tools/${tool.slug}`}
            className="flex items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-primary-light/40 transition-colors"
          >
            <span className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold text-white shrink-0 ${
              tool.ranking === 1 ? 'bg-yellow-400' :
              tool.ranking === 2 ? 'bg-gray-400' :
              tool.ranking === 3 ? 'bg-amber-600' :
              'bg-gray-200 text-gray-500'
            }`}>
              {tool.ranking}
            </span>
            <span className="text-xs font-semibold text-foreground truncate flex-1">{tool.name}</span>
            <div className="flex items-center gap-0.5 shrink-0">
              <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
              <span className="text-[10px] font-bold text-foreground">{formatRating(tool.rating_avg)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
