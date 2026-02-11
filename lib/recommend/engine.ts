// ==========================================
// AIPICK Recommendation Engine v2
// Uses purpose_tool_recommendations + actual category data
// ==========================================

import type {
  Tool,
  Category,
  RecommendedTool,
  MatchDetails,
  PurposeToolRecommendation,
} from '@/types';
import { PURPOSE_CATEGORIES } from '@/lib/constants';

// ==========================================
// Input Types
// ==========================================

export interface RecommendInput {
  tools: Tool[];
  categories: Category[];
  purposeRecommendations: PurposeToolRecommendation[];
  purposeSlug: string;
  userTypeSlug: string;
  budget: 'free' | 'under10' | 'any';
  korean: 'required' | 'any';
}

// ==========================================
// Purpose → DB Category Slug Mapping
// Maps Wizard purpose slugs to seed category slugs
// ==========================================

const PURPOSE_TO_DB_CATEGORIES: Record<string, string[]> = {
  writing: ['writing', 'chat', 'translation'],
  design: ['design'],
  video: ['video', 'music', 'voice'],
  automation: ['automation'],
  coding: ['coding'],
  research: ['research', 'data-analysis', 'chat'],
  learning: ['chat', 'translation', 'research'],
  presentation: ['chat', 'design', 'automation'],
  marketing: ['chat', 'writing', 'design'],
  building: ['coding', 'automation'],
};

// ==========================================
// Purpose Korean Name Map (for reasons)
// ==========================================

const PURPOSE_NAME_MAP: Record<string, string> = Object.fromEntries(
  PURPOSE_CATEGORIES.map((p) => [p.slug, p.name.split(' · ')[0]])
);

// ==========================================
// User Type Korean Name Map (for reasons)
// ==========================================

const USER_TYPE_NAME_MAP: Record<string, string> = {
  beginner: '초보',
  intermediate: '중급',
  'daily-user': '고급 활용자',
  expert: 'AI 마스터',
  student: '학생',
  teacher: '선생님/강사',
  parent: '학부모',
  freelancer: '프리랜서',
  team: '팀/회사',
};

// ==========================================
// Scoring Constants
// ==========================================

const MAX_RESULTS = 8;

// Purpose recommendation match (0-40)
const PURPOSE_KILLER_ESSENTIAL_SCORE = 40;
const PURPOSE_ESSENTIAL_SCORE = 35;
const PURPOSE_RECOMMENDED_SCORE = 25;
const PURPOSE_OPTIONAL_SCORE = 15;
const PURPOSE_SAME_PURPOSE_OTHER_TYPE_SCORE = 10;

// Category match fallback (0-15)
const CATEGORY_EXACT_SCORE = 15;
const CATEGORY_RELATED_SCORE = 8;

// Budget fit (0-15)
// Korean support (0-10)
// Quality signal (0-20)

const QUALITY_HYBRID_WEIGHT = 10;
const QUALITY_RATING_WEIGHT = 5;
const QUALITY_REVIEW_WEIGHT = 3;
const QUALITY_EDITOR_PICK_BONUS = 2;
const REVIEW_COUNT_NORMALIZE_CAP = 100;
const HIGH_RATING_THRESHOLD = 4.0;

// ==========================================
// Hard Filters
// ==========================================

function passesHardFilters(
  tool: Tool,
  budget: 'free' | 'under10' | 'any',
  korean: 'required' | 'any',
): boolean {
  // Budget hard filter
  if (budget === 'free') {
    if (tool.pricing_type === 'Paid') return false;
    if (tool.pricing_type === 'Freemium' && !tool.free_quota_detail) return false;
  }
  if (budget === 'under10') {
    if (tool.pricing_type === 'Paid' && (tool.monthly_price === null || tool.monthly_price > 10)) {
      return false;
    }
  }

  // Korean hard filter
  if (korean === 'required' && !tool.supports_korean) {
    return false;
  }

  return true;
}

// ==========================================
// Scoring: Purpose Recommendation Match
// ==========================================

function scorePurposeMatch(
  tool: Tool,
  purposeSlug: string,
  userTypeSlug: string,
  purposeRecommendations: PurposeToolRecommendation[],
): { score: number; level: string; reason: string | null } {
  // Exact match: same purpose + same userType
  const exactRec = purposeRecommendations.find(
    (r) => r.purpose_slug === purposeSlug && r.user_type_slug === userTypeSlug && r.tool_id === tool.id,
  );

  if (exactRec) {
    if (exactRec.is_killer_pick && exactRec.recommendation_level === 'essential') {
      return { score: PURPOSE_KILLER_ESSENTIAL_SCORE, level: 'killer_essential', reason: exactRec.reason };
    }
    switch (exactRec.recommendation_level) {
      case 'essential':
        return { score: PURPOSE_ESSENTIAL_SCORE, level: 'essential', reason: exactRec.reason };
      case 'recommended':
        return { score: PURPOSE_RECOMMENDED_SCORE, level: 'recommended', reason: exactRec.reason };
      case 'optional':
        return { score: PURPOSE_OPTIONAL_SCORE, level: 'optional', reason: exactRec.reason };
    }
  }

  // Same purpose, different userType (still relevant)
  const samePurposeRec = purposeRecommendations.find(
    (r) => r.purpose_slug === purposeSlug && r.tool_id === tool.id,
  );

  if (samePurposeRec) {
    return { score: PURPOSE_SAME_PURPOSE_OTHER_TYPE_SCORE, level: 'related', reason: samePurposeRec.reason };
  }

  return { score: 0, level: '', reason: null };
}

// ==========================================
// Scoring: Category Match (fallback)
// ==========================================

function scoreCategoryMatch(
  tool: Tool,
  purposeSlug: string,
  categoryIdMap: Map<string, string>,
): number {
  const dbCategorySlugs = PURPOSE_TO_DB_CATEGORIES[purposeSlug];
  if (!dbCategorySlugs) return 0;

  // Primary categories (first in list = most relevant)
  const primarySlug = dbCategorySlugs[0];
  const primaryId = categoryIdMap.get(primarySlug);
  if (primaryId && tool.category_id === primaryId) {
    return CATEGORY_EXACT_SCORE;
  }

  // Related categories
  for (let i = 1; i < dbCategorySlugs.length; i++) {
    const relatedId = categoryIdMap.get(dbCategorySlugs[i]);
    if (relatedId && tool.category_id === relatedId) {
      return CATEGORY_RELATED_SCORE;
    }
  }

  return 0;
}

// ==========================================
// Scoring: Budget Fit
// ==========================================

function scoreBudgetFit(
  tool: Tool,
  budget: 'free' | 'under10' | 'any',
): number {
  const { pricing_type, free_quota_detail, monthly_price } = tool;

  switch (budget) {
    case 'free': {
      if (pricing_type === 'Free') return 15;
      if (pricing_type === 'Freemium' && free_quota_detail) return 10;
      return 0;
    }
    case 'under10': {
      if (pricing_type === 'Free') return 15;
      if (pricing_type === 'Freemium') return 12;
      if (pricing_type === 'Paid' && monthly_price !== null && monthly_price <= 10) return 8;
      return 0;
    }
    case 'any': {
      if (pricing_type === 'Free') return 10;
      if (pricing_type === 'Freemium') return 10;
      return 8;
    }
    default:
      return 0;
  }
}

// ==========================================
// Scoring: Korean Support
// ==========================================

function scoreKoreanSupport(
  tool: Tool,
  korean: 'required' | 'any',
): number {
  if (korean === 'required') {
    return tool.supports_korean ? 10 : 0;
  }
  return tool.supports_korean ? 7 : 5;
}

// ==========================================
// Scoring: Quality Signal
// ==========================================

function scoreQualitySignal(tool: Tool): number {
  const hybridContribution = (tool.hybrid_score / 100) * QUALITY_HYBRID_WEIGHT;
  const ratingContribution = (tool.rating_avg / 5) * QUALITY_RATING_WEIGHT;
  const reviewContribution =
    Math.min(tool.review_count / REVIEW_COUNT_NORMALIZE_CAP, 1) * QUALITY_REVIEW_WEIGHT;
  const editorPickBonus = tool.is_editor_pick ? QUALITY_EDITOR_PICK_BONUS : 0;

  return Math.min(
    hybridContribution + ratingContribution + reviewContribution + editorPickBonus,
    20,
  );
}

// ==========================================
// Reason Generation
// ==========================================

function generateReasons(
  tool: Tool,
  purposeSlug: string,
  purposeLevel: string,
  purposeReason: string | null,
  categoryScore: number,
  budgetScore: number,
  budget: 'free' | 'under10' | 'any',
  userTypeSlug: string,
): string[] {
  const reasons: string[] = [];

  // Purpose recommendation reason
  if (purposeReason) {
    reasons.push(purposeReason);
  } else if (purposeLevel === 'killer_essential' || purposeLevel === 'essential') {
    const purposeName = PURPOSE_NAME_MAP[purposeSlug] || purposeSlug;
    const typeName = USER_TYPE_NAME_MAP[userTypeSlug] || '';
    reasons.push(`${purposeName}${typeName ? ` ${typeName}` : ''}에게 필수 도구`);
  } else if (purposeLevel === 'recommended') {
    const purposeName = PURPOSE_NAME_MAP[purposeSlug] || purposeSlug;
    reasons.push(`${purposeName} 추천 도구`);
  } else if (categoryScore > 0) {
    const purposeName = PURPOSE_NAME_MAP[purposeSlug] || purposeSlug;
    reasons.push(`${purposeName} 관련 도구`);
  }

  // Budget reason
  if (budget === 'free' && tool.pricing_type === 'Free') {
    reasons.push('완전 무료');
  } else if (budgetScore >= 10 && tool.free_quota_detail) {
    const quotaText = tool.free_quota_detail.slice(0, 50);
    reasons.push(`무료: ${quotaText}`);
  }

  // Korean support reason
  if (tool.supports_korean) {
    reasons.push('한국어 지원');
  }

  // Quality reasons
  if (tool.rating_avg >= HIGH_RATING_THRESHOLD) {
    reasons.push(`평점 ${tool.rating_avg.toFixed(1)}점`);
  }

  if (tool.is_editor_pick) {
    reasons.push('에디터 추천');
  }

  if (tool.trend_direction === 'up') {
    reasons.push('최근 급상승 중');
  }

  return reasons;
}

// ==========================================
// Main Recommendation Function
// ==========================================

export function recommendTools(input: RecommendInput): RecommendedTool[] {
  const {
    tools,
    categories,
    purposeRecommendations,
    purposeSlug,
    userTypeSlug,
    budget,
    korean,
  } = input;

  // Build category slug → UUID map from actual seed data
  const categoryIdMap = new Map<string, string>();
  for (const cat of categories) {
    categoryIdMap.set(cat.slug, cat.id);
  }

  const scored: RecommendedTool[] = [];

  for (const tool of tools) {
    // Hard filters: exclude non-matching tools entirely
    if (!passesHardFilters(tool, budget, korean)) continue;

    // 1. Purpose recommendation match (0-40)
    const { score: purposeMatch, level: purposeLevel, reason: purposeReason } =
      scorePurposeMatch(tool, purposeSlug, userTypeSlug, purposeRecommendations);

    // 2. Category match fallback (0-15) — only if no purpose recommendation
    const categoryMatch = purposeMatch > 0
      ? 0
      : scoreCategoryMatch(tool, purposeSlug, categoryIdMap);

    // Skip tools with no purpose or category relevance
    if (purposeMatch === 0 && categoryMatch === 0) continue;

    // 3. Budget fit (0-15)
    const budgetMatch = scoreBudgetFit(tool, budget);

    // 4. Korean support (0-10)
    const koreanMatch = scoreKoreanSupport(tool, korean);

    // 5. Quality signal (0-20)
    const qualitySignal = scoreQualitySignal(tool);

    const matchScore = purposeMatch + categoryMatch + budgetMatch + koreanMatch + qualitySignal;

    const matchDetails: MatchDetails = {
      purposeMatch: purposeMatch || categoryMatch,
      userTypeMatch: purposeMatch,
      categoryMatch,
      personaMatch: purposeMatch,
      budgetMatch,
      koreanMatch,
      qualitySignal: Math.round(qualitySignal * 100) / 100,
    };

    const reasons = generateReasons(
      tool,
      purposeSlug,
      purposeLevel,
      purposeReason,
      categoryMatch,
      budgetMatch,
      budget,
      userTypeSlug,
    );

    scored.push({
      tool,
      matchScore: Math.round(matchScore * 100) / 100,
      reasons,
      matchDetails,
    });
  }

  // Sort by matchScore descending
  scored.sort((a, b) => b.matchScore - a.matchScore);

  return scored.slice(0, MAX_RESULTS);
}
