'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Briefcase, Palette, GraduationCap, Code, ArrowRight, Users } from 'lucide-react';
import { PERSONA_CARDS } from '@/lib/constants';
import type { Tool } from '@/types';

const ICON_MAP = {
  Briefcase,
  Palette,
  GraduationCap,
  Code,
} as const;

// 페르소나별 색상 스타일 (다른 박스들과 톤앤매너 맞춤)
const PERSONA_STYLES = {
  professional: {
    gradient: 'from-blue-50/50 to-white',
    border: 'border-blue-200',
    hoverBorder: 'hover:border-blue-400',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    accentColor: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-700',
    toolBorder: 'border-blue-100',
    indicatorActive: 'bg-blue-500',
  },
  creator: {
    gradient: 'from-purple-50/50 to-white',
    border: 'border-purple-200',
    hoverBorder: 'hover:border-purple-400',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    accentColor: 'text-purple-600',
    badge: 'bg-purple-100 text-purple-700',
    toolBorder: 'border-purple-100',
    indicatorActive: 'bg-purple-500',
  },
  student: {
    gradient: 'from-emerald-50/50 to-white',
    border: 'border-emerald-200',
    hoverBorder: 'hover:border-emerald-400',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    accentColor: 'text-emerald-600',
    badge: 'bg-emerald-100 text-emerald-700',
    toolBorder: 'border-emerald-100',
    indicatorActive: 'bg-emerald-500',
  },
  developer: {
    gradient: 'from-orange-50/50 to-white',
    border: 'border-orange-200',
    hoverBorder: 'hover:border-orange-400',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    accentColor: 'text-orange-600',
    badge: 'bg-orange-100 text-orange-700',
    toolBorder: 'border-orange-100',
    indicatorActive: 'bg-orange-500',
  },
} as const;

const ROTATION_INTERVAL_MS = 8_000;

interface PersonaRotationProps {
  tools: Tool[];
}

export default function PersonaRotation({ tools }: PersonaRotationProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (PERSONA_CARDS.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % PERSONA_CARDS.length);
    }, ROTATION_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  const persona = PERSONA_CARDS[currentIndex];
  const Icon = ICON_MAP[persona.icon as keyof typeof ICON_MAP];
  const style = PERSONA_STYLES[persona.id as keyof typeof PERSONA_STYLES];

  // 킬러 도구 가져오기
  const killerTools = persona.killerSlugs
    .map((slug) => tools.find((t) => t.slug === slug))
    .filter((t): t is Tool => t !== undefined);

  return (
    <section className="flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-extrabold text-foreground flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-primary" />
          당신에게 맞는 AI
        </h2>
        {PERSONA_CARDS.length > 1 && (
          <div className="flex items-center gap-1">
            {PERSONA_CARDS.map((p, i) => {
              const s = PERSONA_STYLES[p.id as keyof typeof PERSONA_STYLES];
              return (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === currentIndex ? `w-3 ${s.indicatorActive}` : 'w-1.5 bg-gray-200'
                  }`}
                />
              );
            })}
          </div>
        )}
      </div>

      <Link
        href={persona.href}
        className={`group flex flex-col flex-1 rounded-xl border bg-gradient-to-b p-4 hover:shadow-lg transition-all ${style.border} ${style.hoverBorder} ${style.gradient}`}
      >
        {/* 아이콘 + 텍스트 */}
        <div className="flex items-start gap-3 mb-3">
          <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${style.iconBg}`}>
            <Icon className={`w-5 h-5 ${style.iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-foreground">
                {persona.title}
              </h3>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${style.badge}`}>
                추천
              </span>
            </div>
            <p className="text-[10px] text-gray-500 mt-0.5">
              {persona.subtitle}
            </p>
          </div>
        </div>

        {/* 킬러 도구 */}
        {killerTools.length > 0 && (
          <div className="mb-2">
            <div className="flex gap-1.5">
              {killerTools.map((tool) => (
                <div
                  key={tool.id}
                  className={`flex-1 flex flex-col items-center gap-1 rounded-lg border p-2 bg-white/50 ${style.toolBorder}`}
                  title={tool.name}
                >
                  {tool.logo_url ? (
                    <img
                      src={tool.logo_url}
                      alt={tool.name}
                      className="w-6 h-6 object-contain rounded"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400">
                      {tool.name.charAt(0)}
                    </div>
                  )}
                  <span className="text-[9px] text-gray-600 font-medium truncate w-full text-center">
                    {tool.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className={`flex items-center justify-between ${style.accentColor} font-semibold`}>
          <span className="text-xs">
            맞춤 AI 보기
          </span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </Link>
    </section>
  );
}
