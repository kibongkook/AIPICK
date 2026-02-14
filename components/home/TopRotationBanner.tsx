'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  TrendingUp, Users, ArrowRight,
  Briefcase, Palette, GraduationCap, Code
} from 'lucide-react';
import type { Tool } from '@/types';
import { PERSONA_CARDS } from '@/lib/constants';

interface TopRotationBannerProps {
  dailyPicks: any[];
  trendingTools: Tool[];
  allTools: Tool[];
}

const ICON_MAP = {
  Briefcase, Palette, GraduationCap, Code,
} as const;

const PERSONA_STYLES = {
  professional: { bg: 'bg-blue-50/50', border: 'border-blue-200', iconBg: 'bg-blue-100', iconColor: 'text-blue-600', badge: 'bg-blue-100 text-blue-700', indicatorActive: 'bg-blue-500', accentColor: 'text-blue-600' },
  creator: { bg: 'bg-purple-50/50', border: 'border-purple-200', iconBg: 'bg-purple-100', iconColor: 'text-purple-600', badge: 'bg-purple-100 text-purple-700', indicatorActive: 'bg-purple-500', accentColor: 'text-purple-600' },
  student: { bg: 'bg-emerald-50/50', border: 'border-emerald-200', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700', indicatorActive: 'bg-emerald-500', accentColor: 'text-emerald-600' },
  developer: { bg: 'bg-orange-50/50', border: 'border-orange-200', iconBg: 'bg-orange-100', iconColor: 'text-orange-600', badge: 'bg-orange-100 text-orange-700', indicatorActive: 'bg-orange-500', accentColor: 'text-orange-600' },
} as const;

const DRAG_THRESHOLD = 50;

/** 드래그로 넘기기 공통 훅 — 클릭/드래그 확실히 분리 */
function useSwipe(length: number, setIndex: React.Dispatch<React.SetStateAction<number>>) {
  const isDragging = useRef(false);
  const startX = useRef(0);
  const hasDragged = useRef(false);

  const onStart = useCallback((clientX: number) => {
    isDragging.current = true;
    startX.current = clientX;
    hasDragged.current = false;
  }, []);

  const onMove = useCallback((clientX: number) => {
    if (!isDragging.current) return;
    if (Math.abs(clientX - startX.current) > 10) {
      hasDragged.current = true;
    }
  }, []);

  const onEnd = useCallback((clientX: number) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const offset = clientX - startX.current;
    if (hasDragged.current && Math.abs(offset) > DRAG_THRESHOLD) {
      if (offset < 0) {
        setIndex(prev => (prev + 1) % length);
      } else {
        setIndex(prev => (prev - 1 + length) % length);
      }
    }
    // hasDragged를 약간 지연 후 리셋 (클릭 이벤트가 먼저 처리되도록)
    setTimeout(() => { hasDragged.current = false; }, 100);
  }, [length, setIndex]);

  const handlers = {
    onMouseDown: (e: React.MouseEvent) => { e.preventDefault(); onStart(e.clientX); },
    onMouseMove: (e: React.MouseEvent) => { if (isDragging.current) e.preventDefault(); onMove(e.clientX); },
    onMouseUp: (e: React.MouseEvent) => onEnd(e.clientX),
    onMouseLeave: (e: React.MouseEvent) => { if (isDragging.current) onEnd(e.clientX); },
    onTouchStart: (e: React.TouchEvent) => onStart(e.touches[0].clientX),
    onTouchMove: (e: React.TouchEvent) => onMove(e.touches[0].clientX),
    onTouchEnd: (e: React.TouchEvent) => onEnd(e.changedTouches[0].clientX),
    // 캡처 단계에서 드래그 후 클릭 차단 (Link 이벤트보다 먼저 실행)
    onClickCapture: (e: React.MouseEvent) => {
      if (hasDragged.current) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
  };

  return handlers;
}

function getTrendingReason(tool: Tool): string {
  const parts: string[] = [];
  if (tool.visit_count > 100_000_000) parts.push(`월 ${Math.round(tool.visit_count / 1_000_000)}M 사용자`);
  else if (tool.visit_count > 10_000_000) parts.push(`월 ${Math.round(tool.visit_count / 1_000_000)}M+ 방문`);
  else if (tool.visit_count > 1_000_000) parts.push(`월 ${(tool.visit_count / 1_000_000).toFixed(1)}M 방문`);
  if (tool.trend_magnitude >= 5) parts.push('사용량 급증');
  else parts.push('꾸준한 성장세');
  if (tool.rating_avg >= 4.5) parts.push(`평점 ${tool.rating_avg.toFixed(1)}점`);
  if (tool.supports_korean) parts.push('한국어 지원');
  return parts.slice(0, 2).join(' · ') || '최근 사용자가 빠르게 증가 중';
}

export default function TopRotationBanner({ trendingTools, allTools }: TopRotationBannerProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 좌측: 급상승 */}
      <TrendingSection tools={trendingTools} />

      {/* 우측: 당신에게 맞는 AI */}
      <PersonalizedSection allTools={allTools} />
    </div>
  );
}

function TrendingSection({ tools }: { tools: Tool[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const swipeHandlers = useSwipe(tools.length, setCurrentIndex);

  useEffect(() => {
    if (tools.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % tools.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [tools.length]);

  if (tools.length === 0) return null;

  const tool = tools[currentIndex];
  const reason = getTrendingReason(tool);

  return (
    <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-red-600" />
          <h2 className="text-base font-bold text-foreground">급상승</h2>
        </div>

        {/* 인디케이터 */}
        {tools.length > 1 && (
          <div className="flex items-center gap-1.5">
            {tools.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentIndex ? 'bg-red-500 w-4' : 'bg-gray-200 w-1.5'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* 도구 카드 - 드래그 가능 */}
      <div
        {...swipeHandlers}
        className="select-none cursor-grab active:cursor-grabbing"
      >
        <Link
          href={`/tools/${tool.slug}`}
          className="block rounded-lg border border-red-200 bg-gradient-to-r from-red-50/50 to-white p-4 group hover:border-red-400 hover:shadow-md transition-all"
          draggable={false}
        >
          <div className="flex items-center gap-3 mb-3">
            {tool.logo_url ? (
              <img src={tool.logo_url} alt={tool.name} className="h-12 w-12 rounded-lg object-cover shadow-sm pointer-events-none" draggable={false} />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-500 text-white text-xl font-bold shadow-sm">
                {tool.name.charAt(0)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-bold text-foreground group-hover:text-red-600 transition-colors truncate">
                  {tool.name}
                </h3>
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 shrink-0">
                  ▲ HOT
                </span>
              </div>
              {tool.rating_avg > 0 && (
                <span className="text-xs text-gray-400">⭐ {tool.rating_avg.toFixed(1)}</span>
              )}
            </div>
          </div>

          <p className="text-sm text-gray-600 line-clamp-1 mb-2">{tool.description}</p>

          <p className="text-xs font-semibold text-red-600 flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" />
            {reason}
          </p>
        </Link>
      </div>
    </div>
  );
}

function PersonalizedSection({ allTools }: { allTools: Tool[] }) {
  const [personaIndex, setPersonaIndex] = useState(0);
  const swipeHandlers = useSwipe(PERSONA_CARDS.length, setPersonaIndex);

  useEffect(() => {
    if (PERSONA_CARDS.length <= 1) return;
    const interval = setInterval(() => {
      setPersonaIndex(prev => (prev + 1) % PERSONA_CARDS.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const persona = PERSONA_CARDS[personaIndex];
  const Icon = ICON_MAP[persona.icon as keyof typeof ICON_MAP];
  const style = PERSONA_STYLES[persona.id as keyof typeof PERSONA_STYLES];
  const killerTools = persona.killerSlugs
    .map(slug => allTools.find((t: Tool) => t.slug === slug))
    .filter((t): t is Tool => t !== undefined);

  return (
    <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="text-base font-bold text-foreground">당신에게 맞는 AI</h2>
        </div>

        {/* 인디케이터 */}
        {PERSONA_CARDS.length > 1 && (
          <div className="flex items-center gap-1.5">
            {PERSONA_CARDS.map((p, i) => {
              const s = PERSONA_STYLES[p.id as keyof typeof PERSONA_STYLES];
              return (
                <button
                  key={i}
                  onClick={() => setPersonaIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === personaIndex ? `${s.indicatorActive} w-4` : 'bg-gray-200 w-1.5'
                  }`}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* 페르소나 카드 - 드래그 가능 */}
      <div
        {...swipeHandlers}
        className="select-none cursor-grab active:cursor-grabbing"
      >
        <Link
          href={persona.href}
          className={`block rounded-lg border p-4 group transition-all hover:shadow-md ${style.border} ${style.bg}`}
          draggable={false}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${style.iconBg}`}>
              <Icon className={`w-6 h-6 ${style.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className={`text-base font-bold ${style.accentColor} truncate`}>
                  {persona.title}
                </h3>
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${style.badge} shrink-0`}>
                  추천
                </span>
              </div>
              <p className="text-xs text-gray-600 truncate">{persona.subtitle}</p>
            </div>
          </div>

          {killerTools.length > 0 && (
            <div className="flex gap-2 mb-2 flex-wrap">
              {killerTools.slice(0, 3).map(tool => (
                <div key={tool.id} className="flex items-center gap-1.5 bg-white/80 rounded-md px-2 py-1 border border-gray-100">
                  {tool.logo_url && (
                    <img src={tool.logo_url} alt={tool.name} className="w-4 h-4 rounded object-contain pointer-events-none" draggable={false} />
                  )}
                  <span className="text-xs text-gray-700 font-medium">{tool.name}</span>
                </div>
              ))}
            </div>
          )}

          <div className={`flex items-center justify-between ${style.accentColor} text-sm font-semibold mt-2`}>
            <span>맞춤 AI 보기</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>
    </div>
  );
}
