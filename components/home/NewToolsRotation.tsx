'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Star } from 'lucide-react';
import type { Tool } from '@/types';

const ROTATION_INTERVAL_MS = 9_000;

interface NewToolsRotationProps {
  tools: Tool[];
}

export default function NewToolsRotation({ tools }: NewToolsRotationProps) {
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

  return (
    <section className="flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-extrabold text-foreground flex items-center">
          NEW
          <span className="ml-1.5 inline-flex items-center rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
            신규
          </span>
        </h2>
        {tools.length > 1 && (
          <div className="flex items-center gap-1">
            {tools.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentIndex ? 'w-3 bg-emerald-500' : 'w-1.5 bg-gray-200'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <Link
        href={`/tools/${tool.slug}`}
        className="group flex flex-col flex-1 rounded-xl border border-emerald-200 bg-gradient-to-b from-emerald-50/50 to-white p-4 hover:border-emerald-400 hover:shadow-lg transition-all"
      >
        <div className="flex items-center gap-3 mb-2">
          {tool.logo_url ? (
            <img src={tool.logo_url} alt={tool.name} className="h-10 w-10 rounded-lg object-cover shadow-sm" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500 text-white text-sm font-bold shadow-sm">
              {tool.name.charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-foreground truncate">{tool.name}</h3>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                tool.pricing_type === 'Free'
                  ? 'bg-emerald-100 text-emerald-700'
                  : tool.pricing_type === 'Freemium'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {tool.pricing_type === 'Free' ? '무료' : tool.pricing_type === 'Freemium' ? '부분무료' : '유료'}
              </span>
            </div>
            {tool.rating_avg > 0 && (
              <div className="flex items-center gap-0.5">
                <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                <span className="text-[10px] text-gray-400">{tool.rating_avg.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>

        <p className="text-xs text-gray-600 line-clamp-2 mb-2 flex-1">{tool.description}</p>

        <p className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-emerald-500 shrink-0" />
          <span className="line-clamp-1">
            {tool.supports_korean ? '한국어 지원 · ' : ''}
            {tool.pricing_type === 'Free' ? '완전 무료' : tool.free_quota_detail ? `무료: ${tool.free_quota_detail.slice(0, 25)}` : '새로 등장한 AI'}
          </span>
        </p>
      </Link>
    </section>
  );
}
