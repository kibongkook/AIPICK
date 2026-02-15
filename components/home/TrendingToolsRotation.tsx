'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, Star } from 'lucide-react';
import type { Tool } from '@/types';

const ROTATION_INTERVAL_MS = 11_000;

function getTrendingReason(tool: Tool): string {
  const parts: string[] = [];

  if (tool.visit_count > 100_000_000) {
    parts.push(`월 ${Math.round(tool.visit_count / 1_000_000)}M 사용자`);
  } else if (tool.visit_count > 10_000_000) {
    parts.push(`월 ${Math.round(tool.visit_count / 1_000_000)}M+ 방문`);
  } else if (tool.visit_count > 1_000_000) {
    parts.push(`월 ${(tool.visit_count / 1_000_000).toFixed(1)}M 방문`);
  }

  if (tool.trend_magnitude >= 5) {
    parts.push('사용량 급증');
  } else {
    parts.push('꾸준한 성장세');
  }

  if (tool.rating_avg >= 4.5) {
    parts.push(`평점 ${tool.rating_avg.toFixed(1)}점`);
  }

  if (tool.supports_korean) {
    parts.push('한국어 지원');
  }

  return parts.slice(0, 2).join(' · ') || '최근 사용자가 빠르게 증가 중';
}

interface TrendingToolsRotationProps {
  tools: Tool[];
}

export default function TrendingToolsRotation({ tools }: TrendingToolsRotationProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (tools.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % tools.length);
    }, ROTATION_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [tools.length]);

  if (tools.length === 0) return null;

  const tool = tools[currentIndex];
  const reason = getTrendingReason(tool);

  return (
    <section className="flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-extrabold text-foreground flex items-center">
          급상승
          <TrendingUp className="ml-1 h-3.5 w-3.5 text-red-500" />
        </h2>
        {tools.length > 1 && (
          <div className="flex items-center gap-1">
            {tools.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentIndex ? 'w-3 bg-red-500' : 'w-1.5 bg-gray-200'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <Link
        href={`/tools/${tool.slug}`}
        className="group flex flex-col flex-1 rounded-xl border border-red-200 bg-gradient-to-b from-red-50/50 to-white p-4 hover:border-red-400 hover:shadow-lg transition-all"
      >
        <div className="flex items-center gap-3 mb-2">
          {tool.logo_url ? (
            <img src={tool.logo_url} alt={tool.name} className="h-10 w-10 rounded-lg object-cover shadow-sm" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500 text-white text-sm font-bold shadow-sm">
              {tool.name.charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-foreground truncate">{tool.name}</h3>
              <span className="text-xs font-bold px-1.5 py-0.5 rounded-full shrink-0 bg-red-100 text-red-700">
                ▲ 급상승
              </span>
            </div>
            {tool.rating_avg > 0 && (
              <div className="flex items-center gap-0.5">
                <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-gray-400">{tool.rating_avg.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>

        <p className="text-xs text-gray-600 line-clamp-2 mb-2 flex-1">{tool.description}</p>

        <p className="text-xs font-semibold text-red-600 flex items-center gap-1">
          <TrendingUp className="h-3 w-3 text-red-500 shrink-0" />
          <span className="line-clamp-1">{reason}</span>
        </p>
      </Link>
    </section>
  );
}
