'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, Sparkles, Gem, Tag, Calendar, Star } from 'lucide-react';
import { DAILY_PICK_TYPES } from '@/lib/constants';
import type { DailyPick, Tool } from '@/types';

const ICON_MAP = {
  TrendingUp,
  Sparkles,
  Gem,
  Tag,
} as const;

const ROTATION_INTERVAL_MS = 8_000;

interface TodayUpdateSectionProps {
  picks: (DailyPick & { tool?: Tool })[];
}

export default function TodayUpdateSection({ picks }: TodayUpdateSectionProps) {
  const validPicks = picks.filter((p) => p.tool);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (validPicks.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % validPicks.length);
    }, ROTATION_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [validPicks.length]);

  if (validPicks.length === 0) return null;

  const pick = validPicks[currentIndex];
  const config = DAILY_PICK_TYPES[pick.pick_type];
  const IconComponent = ICON_MAP[config.icon as keyof typeof ICON_MAP] || Sparkles;
  const tool = pick.tool!;

  const today = new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });

  return (
    <section className="flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-extrabold text-foreground flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-primary" />
          오늘의 AIPICK
          <span className="text-xs font-normal text-gray-400">{today}</span>
        </h2>
        {validPicks.length > 1 && (
          <div className="flex items-center gap-1">
            {validPicks.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentIndex ? 'w-3 bg-primary' : 'w-1.5 bg-gray-200'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <Link
        href={`/tools/${tool.slug}`}
        className="group flex flex-col flex-1 rounded-xl border border-border bg-white p-4 hover:border-primary hover:shadow-lg transition-all"
      >
        {/* 로고 + 이름 */}
        <div className="flex items-center gap-3 mb-2">
          {tool.logo_url ? (
            <img src={tool.logo_url} alt={tool.name} className="h-10 w-10 rounded-lg object-cover" />
          ) : (
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${config.color}`}>
              <IconComponent className="h-5 w-5" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-foreground truncate">{tool.name}</h3>
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full shrink-0 ${config.color}`}>
                {config.label}
              </span>
            </div>
            {tool.rating_avg > 0 && (
              <span className="text-xs text-gray-400">평점 {tool.rating_avg.toFixed(1)}</span>
            )}
          </div>
        </div>

        {/* 설명 */}
        <p className="text-xs text-gray-600 line-clamp-2 mb-2 flex-1">{tool.description}</p>

        {/* 추천 이유 */}
        <p className="text-xs text-primary font-medium flex items-center gap-1">
          <Star className="h-3 w-3 fill-primary text-primary shrink-0" />
          <span className="line-clamp-1">{pick.reason}</span>
        </p>
      </Link>
    </section>
  );
}
