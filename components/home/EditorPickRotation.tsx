'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Star, Zap } from 'lucide-react';
import type { Tool } from '@/types';

const ROTATION_INTERVAL_MS = 10_000;

function getEditorReason(tool: Tool): string {
  const reasons: string[] = [];

  if (tool.pricing_type === 'Free') {
    reasons.push('완전 무료로 제한 없이 사용 가능');
  } else if (tool.pricing_type === 'Freemium' && tool.free_quota_detail) {
    reasons.push(`무료 사용량이 넉넉: ${tool.free_quota_detail.slice(0, 25)}`);
  }

  if (tool.rating_avg >= 4.7) {
    reasons.push(`평점 ${tool.rating_avg.toFixed(1)}점의 압도적 만족도`);
  } else if (tool.rating_avg >= 4.5) {
    reasons.push(`사용자 평점 ${tool.rating_avg.toFixed(1)}점으로 검증된 품질`);
  }

  if (tool.visit_count > 100000000) {
    reasons.push(`월 ${Math.round(tool.visit_count / 1000000)}M 사용자가 선택`);
  } else if (tool.visit_count > 10000000) {
    reasons.push(`월 ${Math.round(tool.visit_count / 1000000)}M+ 사용자 보유`);
  }

  if (tool.trend_direction === 'up') {
    reasons.push('최근 사용자가 급증하는 주목할 AI');
  }

  if (tool.supports_korean) {
    reasons.push('한국어 완벽 지원');
  }

  return reasons[0] || '에디터가 직접 검증한 추천 AI';
}

interface EditorPickRotationProps {
  tools: Tool[];
}

export default function EditorPickRotation({ tools }: EditorPickRotationProps) {
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
  const reason = getEditorReason(tool);

  return (
    <section className="flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-extrabold text-foreground flex items-center">
          에디터 추천
          <Sparkles className="ml-1 h-3.5 w-3.5 text-primary" />
        </h2>
        {tools.length > 1 && (
          <div className="flex items-center gap-1">
            {tools.map((_, i) => (
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
        className="group flex flex-col flex-1 rounded-xl border-2 border-primary/20 bg-gradient-to-b from-primary/5 to-white p-4 hover:border-primary hover:shadow-lg transition-all"
      >
        {/* 로고 + 이름 */}
        <div className="flex items-center gap-3 mb-2">
          {tool.logo_url ? (
            <img src={tool.logo_url} alt={tool.name} className="h-10 w-10 rounded-lg object-cover shadow-sm" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white text-sm font-bold shadow-sm">
              {tool.name.charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-foreground truncate">{tool.name}</h3>
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
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
                <span className="text-xs text-gray-400">{tool.rating_avg.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>

        {/* 설명 */}
        <p className="text-xs text-gray-600 line-clamp-2 mb-2 flex-1">{tool.description}</p>

        {/* 에디터 추천 이유 */}
        <p className="text-xs font-semibold text-primary flex items-center gap-1">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 shrink-0" />
          <span className="line-clamp-1">{reason}</span>
        </p>
      </Link>
    </section>
  );
}
