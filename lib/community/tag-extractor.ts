/**
 * 커뮤니티 V2 태그 자동 추출 로직
 * - 영어→한글 매핑 + 조사 제거 전처리
 * - 출현 횟수 카운트 기반 confidence
 * - GOAL/FEATURE/KEYWORD 확장 매칭
 */

import type { ExtractedTag } from '@/types';
import {
  AI_TOOL_ALIASES,
  GOAL_KEYWORDS,
  FEATURE_KEYWORDS,
  STOP_WORDS,
  EN_KO_WORD_MAP,
  KOREAN_PARTICLES,
  KOREAN_VERB_ENDINGS,
  normalizeText,
  getAIToolDisplay,
  getGoalDisplay,
  getFeatureDisplay,
} from './tag-dictionaries';

// ==========================================
// 전처리: 영어→한글 변환 + 단어 분리
// ==========================================

/**
 * 텍스트 전처리: 영어→한글 변환 + 한글 조사/어미 제거 → 의미 단어 배열
 */
export function preprocessText(text: string): string[] {
  const words: string[] = [];

  // 1) 영어 단어 추출 → 한글로 변환하여 추가
  const englishWords = text.toLowerCase().match(/[a-z][a-z0-9.-]*/gi) || [];
  for (const ew of englishWords) {
    const lower = ew.toLowerCase();
    const mapped = EN_KO_WORD_MAP[lower];
    if (mapped) {
      words.push(mapped);
    }
    // 영어 원문도 보존 (AI 도구 매칭용)
    words.push(lower);
  }

  // 2) 한글 단어 추출 → 조사/어미 제거
  const koreanTokens = text.match(/[가-힣]+/g) || [];
  for (const token of koreanTokens) {
    // 원본 토큰 추가
    words.push(token);

    // 조사/어미 제거한 어간 추출
    let stem = token;

    // 동사/형용사 어미 제거 (긴 것부터)
    for (const ending of KOREAN_VERB_ENDINGS) {
      if (stem.length > ending.length && stem.endsWith(ending)) {
        stem = stem.slice(0, -ending.length);
        break;
      }
    }

    // 조사 제거 (긴 것부터)
    for (const particle of KOREAN_PARTICLES) {
      if (stem.length > particle.length && stem.endsWith(particle)) {
        stem = stem.slice(0, -particle.length);
        break;
      }
    }

    // 어간이 1글자 이상이고 원본과 다르면 추가
    if (stem.length >= 2 && stem !== token) {
      words.push(stem);
    }

    // 복합어 분리: GOAL/FEATURE 키워드 사전 기반
    if (token.length >= 4) {
      const subWords = splitCompoundWord(token);
      words.push(...subWords);
    }
  }

  return words;
}

/**
 * 복합어를 사전 기반으로 분리
 * 예: "동영상생성" → ["동영상", "생성"], "이미지편집" → ["이미지", "편집"]
 */
function splitCompoundWord(word: string): string[] {
  const allKeywords = new Set<string>();

  // GOAL + FEATURE 키워드를 모두 수집
  for (const keywords of Object.values(GOAL_KEYWORDS)) {
    for (const kw of keywords) {
      if (/^[가-힣]+$/.test(kw) && kw.length >= 2) {
        allKeywords.add(kw);
      }
    }
  }
  for (const keywords of Object.values(FEATURE_KEYWORDS)) {
    for (const kw of keywords) {
      if (/^[가-힣]+$/.test(kw) && kw.length >= 2) {
        allKeywords.add(kw);
      }
    }
  }

  const parts: string[] = [];

  // 앞에서부터 가장 긴 키워드 매칭 (greedy)
  let pos = 0;
  while (pos < word.length) {
    let matched = false;
    // 긴 것부터 시도 (최대 6글자)
    for (let len = Math.min(6, word.length - pos); len >= 2; len--) {
      const sub = word.slice(pos, pos + len);
      if (allKeywords.has(sub)) {
        parts.push(sub);
        pos += len;
        matched = true;
        break;
      }
    }
    if (!matched) {
      pos++;
    }
  }

  // 2개 이상 분리된 경우만 반환
  return parts.length >= 2 ? parts : [];
}

// ==========================================
// 메인 추출 함수
// ==========================================

export interface ExtractTagsOptions {
  minConfidence?: number;
  maxTags?: number;
}

/**
 * 제목 + 본문에서 태그 자동 추출
 */
export async function extractTags(
  title: string,
  content: string,
  options: ExtractTagsOptions = {}
): Promise<ExtractedTag[]> {
  const { minConfidence = 0.2, maxTags = 10 } = options;
  const fullText = `${title} ${content}`;
  const preprocessed = preprocessText(fullText);
  const tags: ExtractedTag[] = [];

  // 1. AI 서비스 추출 (원문 기반)
  const aiTags = extractAITools(fullText);
  tags.push(...aiTags);

  // 2. 목적 추출 (전처리 단어 기반)
  const goalTags = extractGoals(fullText, preprocessed);
  tags.push(...goalTags);

  // 3. 기능 유형 추출 (전처리 단어 기반)
  const featureTags = extractFeatures(fullText, preprocessed);
  tags.push(...featureTags);

  // 4. 키워드 추출 (전처리 단어 기반)
  const keywordTags = extractKeywords(preprocessed);
  tags.push(...keywordTags);

  // 신뢰도 필터링 + 중복 제거 + 상위 N개
  const uniqueTags = deduplicateTags(tags);
  const filtered = uniqueTags.filter(tag => tag.confidence >= minConfidence);
  const sorted = filtered.sort((a, b) => b.confidence - a.confidence);

  return sorted.slice(0, maxTags);
}

// ==========================================
// 1. AI 서비스 추출 (원문 기반 — 변경 없음)
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
// 2. 목적 추출 (출현 횟수 카운트)
// ==========================================

export function extractGoals(text: string, preprocessed: string[]): ExtractedTag[] {
  const normalized = normalizeText(text);
  const scores: Record<string, number> = {};

  for (const [goalSlug, keywords] of Object.entries(GOAL_KEYWORDS)) {
    let matchCount = 0;

    for (const keyword of keywords) {
      // 원문 substring 매칭
      const normalizedKeyword = normalizeText(keyword);
      if (normalized.includes(normalizedKeyword)) {
        matchCount++;
      }

      // 전처리 단어 배열에서 추가 매칭 (출현 횟수 카운트)
      const kwLower = keyword.toLowerCase();
      for (const word of preprocessed) {
        if (word === kwLower || word === keyword) {
          matchCount++;
        }
      }
    }

    if (matchCount > 0) {
      scores[goalSlug] = matchCount;
    }
  }

  // 가장 높은 점수 3개 선택 (2→3으로 확대)
  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([goalSlug, score]) => ({
      type: 'GOAL',
      value: goalSlug,
      display: getGoalDisplay(goalSlug),
      confidence: Math.min(0.9, score * 0.15),
      related_category_slug: goalSlug,
    }));
}

// ==========================================
// 3. 기능 유형 추출 (출현 횟수 카운트)
// ==========================================

export function extractFeatures(text: string, preprocessed: string[]): ExtractedTag[] {
  const normalized = normalizeText(text);
  const scores: Record<string, number> = {};

  for (const [featureSlug, keywords] of Object.entries(FEATURE_KEYWORDS)) {
    let matchCount = 0;

    for (const keyword of keywords) {
      const normalizedKeyword = normalizeText(keyword);
      if (normalized.includes(normalizedKeyword)) {
        matchCount++;
      }

      const kwLower = keyword.toLowerCase();
      for (const word of preprocessed) {
        if (word === kwLower || word === keyword) {
          matchCount++;
        }
      }
    }

    if (matchCount > 0) {
      scores[featureSlug] = matchCount;
    }
  }

  // 가장 높은 점수 2개 선택 (1→2로 확대)
  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([featureSlug, score]) => ({
      type: 'FEATURE',
      value: featureSlug,
      display: getFeatureDisplay(featureSlug),
      confidence: Math.min(0.8, score * 0.15),
    }));
}

// ==========================================
// 4. 키워드 추출 (전처리 단어 기반)
// ==========================================

export function extractKeywords(preprocessed: string[]): ExtractedTag[] {
  const freq: Record<string, number> = {};

  for (const word of preprocessed) {
    // 한글 2~6글자 (범위 확대)
    if (!/^[가-힣]{2,6}$/.test(word)) continue;

    // 불용어 제거
    if (STOP_WORDS.has(word)) continue;

    freq[word] = (freq[word] || 0) + 1;
  }

  // 빈도수 상위 7개 (5→7로 확대)
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([word, count]) => ({
      type: 'KEYWORD',
      value: word,
      display: word,
      confidence: Math.min(0.7, count * 0.12),
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
