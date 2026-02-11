/**
 * 커뮤니티 V2 태그 자동 추출 로직
 */

import type { ExtractedTag } from '@/types';
import {
  AI_TOOL_ALIASES,
  GOAL_KEYWORDS,
  FEATURE_KEYWORDS,
  STOP_WORDS,
  normalizeText,
  getAIToolDisplay,
  getGoalDisplay,
  getFeatureDisplay,
} from './tag-dictionaries';

// ==========================================
// 메인 추출 함수
// ==========================================

export interface ExtractTagsOptions {
  minConfidence?: number;      // 최소 신뢰도 (기본 0.5)
  maxTags?: number;            // 최대 태그 수 (기본 10)
}

/**
 * 제목 + 본문에서 태그 자동 추출
 */
export async function extractTags(
  title: string,
  content: string,
  options: ExtractTagsOptions = {}
): Promise<ExtractedTag[]> {
  const { minConfidence = 0.5, maxTags = 10 } = options;
  const fullText = `${title} ${content}`;
  const tags: ExtractedTag[] = [];

  // 1. AI 서비스 추출
  const aiTags = extractAITools(fullText);
  tags.push(...aiTags);

  // 2. 목적 추출
  const goalTags = extractGoals(fullText);
  tags.push(...goalTags);

  // 3. 기능 유형 추출
  const featureTags = extractFeatures(fullText);
  tags.push(...featureTags);

  // 4. 키워드 추출
  const keywordTags = extractKeywords(fullText);
  tags.push(...keywordTags);

  // 신뢰도 필터링 + 중복 제거 + 상위 N개
  const uniqueTags = deduplicateTags(tags);
  const filtered = uniqueTags.filter(tag => tag.confidence >= minConfidence);
  const sorted = filtered.sort((a, b) => b.confidence - a.confidence);

  return sorted.slice(0, maxTags);
}

// ==========================================
// 1. AI 서비스 추출
// ==========================================

export function extractAITools(text: string): ExtractedTag[] {
  const normalized = normalizeText(text);
  const found: ExtractedTag[] = [];

  for (const [toolSlug, aliases] of Object.entries(AI_TOOL_ALIASES)) {
    let matchCount = 0;
    let bestAlias = '';

    for (const alias of aliases) {
      const normalizedAlias = normalizeText(alias);
      if (normalized.includes(normalizedAlias)) {
        matchCount++;
        if (alias.length > bestAlias.length) {
          bestAlias = alias;
        }
      }
    }

    if (matchCount > 0) {
      found.push({
        type: 'AI_TOOL',
        value: toolSlug,
        display: getAIToolDisplay(toolSlug),
        confidence: Math.min(0.95, 0.7 + (matchCount * 0.1)),
      });
    }
  }

  return found;
}

// ==========================================
// 2. 목적 추출
// ==========================================

export function extractGoals(text: string): ExtractedTag[] {
  const normalized = normalizeText(text);
  const scores: Record<string, number> = {};

  for (const [goalSlug, keywords] of Object.entries(GOAL_KEYWORDS)) {
    let matchCount = 0;

    for (const keyword of keywords) {
      const normalizedKeyword = normalizeText(keyword);
      if (normalized.includes(normalizedKeyword)) {
        matchCount++;
      }
    }

    if (matchCount > 0) {
      scores[goalSlug] = matchCount;
    }
  }

  // 가장 높은 점수 2개만 선택
  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([goalSlug, score]) => ({
      type: 'GOAL',
      value: goalSlug,
      display: getGoalDisplay(goalSlug),
      confidence: Math.min(0.9, score * 0.25),
      related_category_slug: goalSlug,
    }));
}

// ==========================================
// 3. 기능 유형 추출
// ==========================================

export function extractFeatures(text: string): ExtractedTag[] {
  const normalized = normalizeText(text);
  const scores: Record<string, number> = {};

  for (const [featureSlug, keywords] of Object.entries(FEATURE_KEYWORDS)) {
    let matchCount = 0;

    for (const keyword of keywords) {
      const normalizedKeyword = normalizeText(keyword);
      if (normalized.includes(normalizedKeyword)) {
        matchCount++;
      }
    }

    if (matchCount > 0) {
      scores[featureSlug] = matchCount;
    }
  }

  // 가장 높은 점수 1개만 선택
  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 1)
    .map(([featureSlug, score]) => ({
      type: 'FEATURE',
      value: featureSlug,
      display: getFeatureDisplay(featureSlug),
      confidence: Math.min(0.8, score * 0.3),
    }));
}

// ==========================================
// 4. 키워드 추출
// ==========================================

export function extractKeywords(text: string): ExtractedTag[] {
  // 한글 2-4글자 단어 추출
  const words = text.match(/[가-힣]{2,4}/g) || [];
  const freq: Record<string, number> = {};

  words.forEach(word => {
    // 불용어 제거
    if (STOP_WORDS.has(word)) return;

    // 빈도 카운트
    freq[word] = (freq[word] || 0) + 1;
  });

  // 빈도수 상위 5개
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word, count]) => ({
      type: 'KEYWORD',
      value: word,
      display: word,
      confidence: Math.min(0.7, count * 0.15),
    }));
}

// ==========================================
// 유틸리티
// ==========================================

/**
 * 중복 태그 제거 (같은 type + value)
 */
function deduplicateTags(tags: ExtractedTag[]): ExtractedTag[] {
  const seen = new Set<string>();
  const unique: ExtractedTag[] = [];

  for (const tag of tags) {
    const key = `${tag.type}:${tag.value}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(tag);
    }
  }

  return unique;
}

/**
 * AI 서비스명이 tools 테이블에 있는지 확인하고 related_tool_id 설정
 * (Supabase 연동 시 사용)
 */
export async function enrichAIToolTags(
  tags: ExtractedTag[],
  getToolBySlug: (slug: string) => Promise<{ id: string } | null>
): Promise<ExtractedTag[]> {
  const enriched = [...tags];

  for (const tag of enriched) {
    if (tag.type === 'AI_TOOL') {
      const tool = await getToolBySlug(tag.value);
      if (tool) {
        tag.related_tool_id = tool.id;
      }
    }
  }

  return enriched;
}
