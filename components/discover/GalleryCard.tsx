'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';
import LogoImage from '@/components/ui/LogoImage';
import type { PricingType } from '@/types';

const CATEGORY_EMOJI: Record<string, string> = {
  chat: '💡',
  writing: '✍️',
  design: '🎨',
  video: '🎬',
  music: '🎵',
  coding: '💻',
  automation: '⚡',
  translation: '🌍',
  data: '📊',
  presentation: '📑',
  marketing: '📢',
  building: '🚀',
};

const CATEGORY_BG: Record<string, string> = {
  chat: 'bg-blue-50 border-blue-100',
  writing: 'bg-indigo-50 border-indigo-100',
  design: 'bg-purple-50 border-purple-100',
  video: 'bg-red-50 border-red-100',
  music: 'bg-pink-50 border-pink-100',
  coding: 'bg-emerald-50 border-emerald-100',
  automation: 'bg-amber-50 border-amber-100',
  translation: 'bg-cyan-50 border-cyan-100',
  data: 'bg-teal-50 border-teal-100',
  presentation: 'bg-rose-50 border-rose-100',
  marketing: 'bg-orange-50 border-orange-100',
  building: 'bg-violet-50 border-violet-100',
};

const PRICING_BADGE: Record<PricingType, { label: string; cls: string }> = {
  Free: { label: '무료', cls: 'bg-emerald-100 text-emerald-700' },
  Freemium: { label: '부분무료', cls: 'bg-blue-100 text-blue-700' },
  Paid: { label: '유료', cls: 'bg-gray-100 text-gray-600' },
};

export interface OutputCase {
  prompt: string | null;
  output: string;
}

export interface GalleryItem {
  slug: string;
  name: string;
  logoUrl: string | null;
  pricingType: PricingType;
  freeQuotaDetail: string | null;
  categorySlug: string;
  categoryName: string;
  cases: OutputCase[];
  ratingAvg: number;
}

interface Props {
  item: GalleryItem;
}

const OUTPUT_PREVIEW_LEN = 500;

export default function GalleryCard({ item }: Props) {
  const [caseIdx, setCaseIdx] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const emoji = CATEGORY_EMOJI[item.categorySlug] ?? '✨';
  const bg = CATEGORY_BG[item.categorySlug] ?? 'bg-gray-50 border-gray-100';
  const badge = PRICING_BADGE[item.pricingType];
  const isCode = item.categorySlug === 'coding' || item.categorySlug === 'data';

  const totalCases = item.cases.length;
  const currentCase = item.cases[caseIdx] ?? item.cases[0];
  const isLong = currentCase.output.length > OUTPUT_PREVIEW_LEN;

  const prevCase = () => { setCaseIdx((i) => (i - 1 + totalCases) % totalCases); setExpanded(false); };
  const nextCase = () => { setCaseIdx((i) => (i + 1) % totalCases); setExpanded(false); };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">

      {/* ── AI 헤더 ── */}
      <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
        {item.logoUrl ? (
          <LogoImage
            src={item.logoUrl}
            alt={item.name}
            className="h-12 w-12 shrink-0 rounded-xl object-contain"
          />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-lg font-bold text-white">
            {item.name[0]}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold text-foreground">{item.name}</h3>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge.cls}`}>
              {badge.label}
            </span>
            {item.freeQuotaDetail && (
              <span className="max-w-[200px] truncate text-xs text-gray-400">
                {item.freeQuotaDetail}
              </span>
            )}
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-sm text-gray-400">
            <span>{emoji}</span>
            <span>{item.categoryName}</span>
            {item.ratingAvg > 0 && (
              <>
                <span>·</span>
                <span>★ {item.ratingAvg.toFixed(1)}</span>
              </>
            )}
          </div>
        </div>

        {/* ── 케이스 네비게이터 ── */}
        <div className="flex shrink-0 items-center gap-1">
          {totalCases > 1 && (
            <button
              onClick={prevCase}
              className="rounded-lg p-1 transition-colors hover:bg-gray-100"
              aria-label="이전 사례"
            >
              <ChevronLeft className="h-4 w-4 text-gray-400" />
            </button>
          )}
          <span className="min-w-[48px] text-center text-xs text-gray-300">
            사례 {caseIdx + 1}/{totalCases}
          </span>
          {totalCases > 1 && (
            <button
              onClick={nextCase}
              className="rounded-lg p-1 transition-colors hover:bg-gray-100"
              aria-label="다음 사례"
            >
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2 p-5">
        {/* ── 프롬프트 ── */}
        {currentCase.prompt ? (
          <div className="flex items-start gap-3 rounded-xl border border-primary/10 bg-primary/5 px-4 py-3">
            <div className="mt-0.5 shrink-0 rounded-full bg-primary/10 p-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">
                사용한 프롬프트
              </p>
              <p className="text-sm leading-relaxed italic text-gray-700">
                &ldquo;{currentCase.prompt}&rdquo;
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 py-3">
            <Sparkles className="h-3.5 w-3.5 text-gray-300" />
            <span className="text-xs text-gray-300">프롬프트 정보 없음</span>
          </div>
        )}

        {/* ── 화살표 ── */}
        <div className="flex justify-center py-0">
          <ArrowDown className="h-4 w-4 text-gray-200" />
        </div>

        {/* ── AI 결과물 ── */}
        <div className={`rounded-xl border p-4 ${bg}`}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            AI 결과물
          </p>
          <p
            className={`whitespace-pre-wrap leading-relaxed text-gray-800 ${
              isCode ? 'font-mono text-xs' : 'text-sm'
            }`}
          >
            {isLong && !expanded
              ? currentCase.output.slice(0, OUTPUT_PREVIEW_LEN) + '…'
              : currentCase.output}
          </p>
          {isLong && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="mt-3 text-xs font-medium text-primary hover:underline"
            >
              {expanded ? '접기 ↑' : '전체 보기 ↓'}
            </button>
          )}
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="flex gap-2 px-5 pb-5">
        <Link
          href={`/tools/${item.slug}`}
          className="flex-1 rounded-xl border border-gray-200 py-2.5 text-center text-sm font-semibold text-foreground transition-colors hover:bg-gray-50"
        >
          AI 상세 보기
        </Link>
        <Link
          href={`/recipes?ai=${item.slug}`}
          className="flex-1 rounded-xl bg-primary py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-primary/90"
        >
          관련 레시피 →
        </Link>
      </div>
    </div>
  );
}
