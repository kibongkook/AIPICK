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
const SLIDE_DURATION = 350;

/** 슬라이드 애니메이션이 포함된 스와이프 캐러셀 훅 */
function useSlidingSwipe(length: number) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [skipTransition, setSkipTransition] = useState(false);
  const isSliding = useRef(false);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const dragOffsetRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentIndexRef = useRef(0);

  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);

  const slideToDirection = useCallback((direction: 'next' | 'prev') => {
    if (isSliding.current || length <= 1) return;
    isSliding.current = true;
    const cw = containerRef.current?.offsetWidth || 600;
    setDragOffset(direction === 'next' ? -cw : cw);
    setTimeout(() => {
      setSkipTransition(true);
      setCurrentIndex(prev =>
        direction === 'next'
          ? (prev + 1) % length
          : (prev - 1 + length) % length
      );
      setDragOffset(0);
      requestAnimationFrame(() => {
        setSkipTransition(false);
        isSliding.current = false;
      });
    }, SLIDE_DURATION);
  }, [length]);

  const slideToIndex = useCallback((targetIndex: number) => {
    if (isSliding.current || length <= 1 || targetIndex === currentIndexRef.current) return;
    isSliding.current = true;
    const dir = targetIndex > currentIndexRef.current ? -1 : 1;
    const cw = containerRef.current?.offsetWidth || 600;
    setDragOffset(dir * cw);
    setTimeout(() => {
      setSkipTransition(true);
      setCurrentIndex(targetIndex);
      setDragOffset(0);
      requestAnimationFrame(() => {
        setSkipTransition(false);
        isSliding.current = false;
      });
    }, SLIDE_DURATION);
  }, [length]);

  const onStart = (clientX: number) => {
    if (isSliding.current) return;
    isDraggingRef.current = true;
    startXRef.current = clientX;
    hasDraggedRef.current = false;
    dragOffsetRef.current = 0;
    setIsDragging(true);
    setDragOffset(0);
  };

  const onMove = (clientX: number) => {
    if (!isDraggingRef.current) return;
    const offset = clientX - startXRef.current;
    dragOffsetRef.current = offset;
    setDragOffset(offset);
    if (Math.abs(offset) > 10) hasDraggedRef.current = true;
  };

  const onEnd = () => {
    if (!isDraggingRef.current) return;
    const finalOffset = dragOffsetRef.current;
    const shouldNext = hasDraggedRef.current && finalOffset < -DRAG_THRESHOLD;
    const shouldPrev = hasDraggedRef.current && finalOffset > DRAG_THRESHOLD;
    isDraggingRef.current = false;
    setIsDragging(false);
    requestAnimationFrame(() => {
      if (shouldNext) slideToDirection('next');
      else if (shouldPrev) slideToDirection('prev');
      else setDragOffset(0);
    });
    setTimeout(() => { hasDraggedRef.current = false; }, 100);
  };

  const handlers = {
    onMouseDown: (e: React.MouseEvent) => { e.preventDefault(); onStart(e.clientX); },
    onMouseMove: (e: React.MouseEvent) => { if (isDraggingRef.current) e.preventDefault(); onMove(e.clientX); },
    onMouseUp: () => onEnd(),
    onMouseLeave: () => { if (isDraggingRef.current) onEnd(); },
    onTouchStart: (e: React.TouchEvent) => onStart(e.touches[0].clientX),
    onTouchMove: (e: React.TouchEvent) => onMove(e.touches[0].clientX),
    onTouchEnd: () => onEnd(),
    onClickCapture: (e: React.MouseEvent) => {
      if (hasDraggedRef.current) { e.preventDefault(); e.stopPropagation(); }
    },
  };

  const carouselStyle = {
    transform: `translateX(calc(-100% + ${dragOffset}px))`,
    transition: (isDragging || skipTransition) ? 'none' : `transform ${SLIDE_DURATION}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
  };

  return {
    currentIndex, setCurrentIndex,
    prevIndex: (currentIndex - 1 + length) % length,
    nextIndex: (currentIndex + 1) % length,
    isDragging, isSliding, containerRef,
    handlers, carouselStyle,
    slideToDirection, slideToIndex,
  };
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
  const {
    currentIndex, prevIndex, nextIndex,
    isDragging, isSliding, containerRef,
    handlers, carouselStyle, slideToDirection, slideToIndex,
  } = useSlidingSwipe(tools.length);

  useEffect(() => {
    if (tools.length <= 1) return;
    const id = setInterval(() => {
      if (!isSliding.current) slideToDirection('next');
    }, 8000);
    return () => clearInterval(id);
  }, [tools.length, slideToDirection]);

  if (tools.length === 0) return null;

  const renderCard = (tool: Tool) => {
    const reason = getTrendingReason(tool);
    return (
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
    );
  };

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
                onClick={() => slideToIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentIndex ? 'bg-red-500 w-4' : 'bg-gray-200 w-1.5'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* 캐러셀 */}
      <div ref={containerRef} className="overflow-hidden">
        <div
          {...handlers}
          className={`flex select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          style={carouselStyle}
        >
          <div key="prev" className="w-full flex-shrink-0 pointer-events-none opacity-50">
            {renderCard(tools[prevIndex])}
          </div>
          <div key="current" className="w-full flex-shrink-0">
            {renderCard(tools[currentIndex])}
          </div>
          <div key="next" className="w-full flex-shrink-0 pointer-events-none opacity-50">
            {renderCard(tools[nextIndex])}
          </div>
        </div>
      </div>
    </div>
  );
}

function PersonalizedSection({ allTools }: { allTools: Tool[] }) {
  const length = PERSONA_CARDS.length;
  const {
    currentIndex, prevIndex, nextIndex,
    isDragging, isSliding, containerRef,
    handlers, carouselStyle, slideToDirection, slideToIndex,
  } = useSlidingSwipe(length);

  useEffect(() => {
    if (length <= 1) return;
    const id = setInterval(() => {
      if (!isSliding.current) slideToDirection('next');
    }, 10000);
    return () => clearInterval(id);
  }, [length, slideToDirection]);

  const renderPersonaCard = (idx: number) => {
    const persona = PERSONA_CARDS[idx];
    const Icon = ICON_MAP[persona.icon as keyof typeof ICON_MAP];
    const s = PERSONA_STYLES[persona.id as keyof typeof PERSONA_STYLES];
    const killerTools = persona.killerSlugs
      .map(slug => allTools.find((t: Tool) => t.slug === slug))
      .filter((t): t is Tool => t !== undefined);

    return (
      <Link
        href={persona.href}
        className={`block rounded-lg border p-4 group transition-all hover:shadow-md ${s.border} ${s.bg}`}
        draggable={false}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${s.iconBg}`}>
            <Icon className={`w-6 h-6 ${s.iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className={`text-base font-bold ${s.accentColor} truncate`}>
                {persona.title}
              </h3>
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${s.badge} shrink-0`}>
                추천
              </span>
            </div>
            <p className="text-xs text-gray-600 truncate">{persona.subtitle}</p>
          </div>
        </div>

        {killerTools.length > 0 && (
          <div className="flex gap-2 mb-2 flex-wrap">
            {killerTools.slice(0, 3).map(tool => (
              <div key={tool.slug} className="flex items-center gap-1.5 bg-white/80 rounded-md px-2 py-1 border border-gray-100">
                {tool.logo_url && (
                  <img src={tool.logo_url} alt={tool.name} className="w-4 h-4 rounded object-contain pointer-events-none" draggable={false} />
                )}
                <span className="text-xs text-gray-700 font-medium">{tool.name}</span>
              </div>
            ))}
          </div>
        )}

        <div className={`flex items-center justify-between ${s.accentColor} text-sm font-semibold mt-2`}>
          <span>맞춤 AI 보기</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </Link>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="text-base font-bold text-foreground">당신에게 맞는 AI</h2>
        </div>

        {/* 인디케이터 */}
        {length > 1 && (
          <div className="flex items-center gap-1.5">
            {PERSONA_CARDS.map((p, i) => {
              const s = PERSONA_STYLES[p.id as keyof typeof PERSONA_STYLES];
              return (
                <button
                  key={i}
                  onClick={() => slideToIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === currentIndex ? `${s.indicatorActive} w-4` : 'bg-gray-200 w-1.5'
                  }`}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* 캐러셀 */}
      <div ref={containerRef} className="overflow-hidden">
        <div
          {...handlers}
          className={`flex select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          style={carouselStyle}
        >
          <div key="prev" className="w-full flex-shrink-0 pointer-events-none opacity-50">
            {renderPersonaCard(prevIndex)}
          </div>
          <div key="current" className="w-full flex-shrink-0">
            {renderPersonaCard(currentIndex)}
          </div>
          <div key="next" className="w-full flex-shrink-0 pointer-events-none opacity-50">
            {renderPersonaCard(nextIndex)}
          </div>
        </div>
      </div>
    </div>
  );
}
