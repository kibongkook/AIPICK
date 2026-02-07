// ==========================================
// AIPICK Recommendation Engine
// Pure scoring function - no API calls or DB access
// ==========================================

import type {
  Tool,
  RecommendedTool,
  MatchDetails,
  JobToolRecommendation,
  EduToolRecommendation,
} from '@/types';

// ==========================================
// Input Types
// ==========================================

export interface RecommendInput {
  tools: Tool[];
  jobRecommendations: JobToolRecommendation[];
  eduRecommendations: EduToolRecommendation[];
  category: string;
  persona: string;
  personaType: 'job' | 'edu' | '';
  budget: 'free' | 'under10' | 'any';
  korean: 'required' | 'any';
}

// ==========================================
// Category Slug -> ID Map
// ==========================================

const CATEGORY_SLUG_TO_ID: Record<string, string> = {
  'general-ai': 'cat-general-ai',
  'text-generation': 'cat-text-gen',
  'image-generation': 'cat-image-gen',
  'video-editing': 'cat-video-edit',
  'coding-tools': 'cat-coding',
  'music-generation': 'cat-music-gen',
  'data-analysis': 'cat-data',
  'translation': 'cat-translation',
  'others': 'cat-others',
};

// ==========================================
// Category Korean Name Map (for reasons)
// ==========================================

const CATEGORY_NAME_MAP: Record<string, string> = {
  'general-ai': '만능 AI',
  'text-generation': '텍스트 생성',
  'image-generation': '이미지 생성',
  'video-editing': '영상 편집',
  'coding-tools': '코딩 도구',
  'music-generation': '음악 생성',
  'data-analysis': '데이터 분석',
  'translation': '번역',
  'others': '기타',
};

// ==========================================
// Related Categories Map
// ==========================================

const RELATED_CATEGORIES: Record<string, string[]> = {
  'general-ai': ['text-generation', 'coding-tools'],
  'text-generation': ['general-ai', 'translation'],
  'image-generation': ['video-editing'],
  'video-editing': ['image-generation', 'music-generation'],
  'coding-tools': ['general-ai', 'data-analysis'],
  'music-generation': ['video-editing'],
  'data-analysis': ['coding-tools'],
  'translation': ['text-generation', 'general-ai'],
};

// ==========================================
// Job Slug -> ID Map
// ==========================================

const JOB_SLUG_TO_ID: Record<string, string> = {
  'ai-developer': 'job-ai-dev',
  'uiux-designer': 'job-uiux',
  'graphic-designer': 'job-graphic',
  'marketer': 'job-marketer',
  'video-creator': 'job-video',
  'writer': 'job-writer',
  'data-analyst': 'job-data',
  'entrepreneur': 'job-biz',
  'musician': 'job-music',
  'product-manager': 'job-pm',
};

// ==========================================
// Job Korean Name Map (for reasons)
// ==========================================

const JOB_NAME_MAP: Record<string, string> = {
  'ai-developer': 'AI 개발자',
  'uiux-designer': 'UI/UX 디자이너',
  'graphic-designer': '그래픽 디자이너',
  'marketer': '마케터',
  'video-creator': '영상 크리에이터',
  'writer': '작가/블로거',
  'data-analyst': '데이터 분석가',
  'entrepreneur': '사업가/창업자',
  'musician': '음악가/작곡가',
  'product-manager': 'PM/기획자',
};

// ==========================================
// Edu Slug -> ID Map
// ==========================================

const EDU_SLUG_TO_ID: Record<string, string> = {
  'elementary-low': 'edu-elementary-low',
  'elementary-high': 'edu-elementary-high',
  'middle-school': 'edu-middle',
  'high-school': 'edu-high',
  'college': 'edu-college',
  'teacher': 'edu-teacher',
  'parent': 'edu-parent',
  'academy-tutor': 'edu-academy',
  'coding-tutor': 'edu-coding',
};

// ==========================================
// Edu Korean Name Map (for reasons)
// ==========================================

const EDU_NAME_MAP: Record<string, string> = {
  'elementary-low': '초등 저학년',
  'elementary-high': '초등 고학년',
  'middle-school': '중학생',
  'high-school': '고등학생',
  'college': '대학생',
  'teacher': '교사/교수',
  'parent': '학부모',
  'academy-tutor': '학원 강사',
  'coding-tutor': '코딩 강사',
};

// ==========================================
// Scoring Constants
// ==========================================

const MAX_RESULTS = 8;

const CATEGORY_EXACT_SCORE = 30;
const CATEGORY_RELATED_SCORE = 15;

const JOB_ESSENTIAL_SCORE = 25;
const JOB_RECOMMENDED_SCORE = 18;
const JOB_OPTIONAL_SCORE = 10;
const PERSONA_CATEGORY_FALLBACK_SCORE = 5;
const PERSONA_NEUTRAL_SCORE = 15;

const EDU_SAFE_SCORE = 25;
const EDU_GUIDED_SCORE = 20;
const EDU_ADVANCED_SCORE = 12;

const QUALITY_HYBRID_WEIGHT = 10;
const QUALITY_RATING_WEIGHT = 5;
const QUALITY_REVIEW_WEIGHT = 3;
const QUALITY_EDITOR_PICK_BONUS = 2;
const REVIEW_COUNT_NORMALIZE_CAP = 100;

const HIGH_RATING_THRESHOLD = 4.0;

// ==========================================
// Scoring Functions
// ==========================================

function scoreCategoryMatch(
  tool: Tool,
  categorySlug: string,
): number {
  const selectedCategoryId = CATEGORY_SLUG_TO_ID[categorySlug];
  if (!selectedCategoryId) return 0;

  if (tool.category_id === selectedCategoryId) {
    return CATEGORY_EXACT_SCORE;
  }

  const relatedSlugs = RELATED_CATEGORIES[categorySlug] || [];
  for (const relatedSlug of relatedSlugs) {
    const relatedId = CATEGORY_SLUG_TO_ID[relatedSlug];
    if (relatedId && tool.category_id === relatedId) {
      return CATEGORY_RELATED_SCORE;
    }
  }

  return 0;
}

function scorePersonaMatch(
  tool: Tool,
  personaSlug: string,
  personaType: 'job' | 'edu' | '',
  jobRecommendations: JobToolRecommendation[],
  eduRecommendations: EduToolRecommendation[],
  categoryScore: number,
): { score: number; level: string } {
  if (!personaType || !personaSlug) {
    return { score: PERSONA_NEUTRAL_SCORE, level: '' };
  }

  const hasCategoryMatch = categoryScore > 0;

  if (personaType === 'job') {
    const jobId = JOB_SLUG_TO_ID[personaSlug];
    if (!jobId) return { score: hasCategoryMatch ? PERSONA_CATEGORY_FALLBACK_SCORE : 0, level: '' };

    const rec = jobRecommendations.find(
      (r) => r.job_category_id === jobId && r.tool_id === tool.id,
    );

    if (rec) {
      switch (rec.recommendation_level) {
        case 'essential':
          return { score: JOB_ESSENTIAL_SCORE, level: 'essential' };
        case 'recommended':
          return { score: JOB_RECOMMENDED_SCORE, level: 'recommended' };
        case 'optional':
          return { score: JOB_OPTIONAL_SCORE, level: 'optional' };
      }
    }

    return { score: hasCategoryMatch ? PERSONA_CATEGORY_FALLBACK_SCORE : 0, level: '' };
  }

  if (personaType === 'edu') {
    const eduId = EDU_SLUG_TO_ID[personaSlug];
    if (!eduId) return { score: hasCategoryMatch ? PERSONA_CATEGORY_FALLBACK_SCORE : 0, level: '' };

    const rec = eduRecommendations.find(
      (r) => r.edu_level_id === eduId && r.tool_id === tool.id,
    );

    if (rec) {
      switch (rec.safety_level) {
        case 'safe':
          return { score: EDU_SAFE_SCORE, level: 'safe' };
        case 'guided':
          return { score: EDU_GUIDED_SCORE, level: 'guided' };
        case 'advanced':
          return { score: EDU_ADVANCED_SCORE, level: 'advanced' };
      }
    }

    return { score: hasCategoryMatch ? PERSONA_CATEGORY_FALLBACK_SCORE : 0, level: '' };
  }

  return { score: 0, level: '' };
}

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

function scoreKoreanSupport(
  tool: Tool,
  korean: 'required' | 'any',
): number {
  if (korean === 'required') {
    return tool.supports_korean ? 10 : 0;
  }

  // korean === 'any'
  return tool.supports_korean ? 7 : 5;
}

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
  categorySlug: string,
  categoryScore: number,
  personaSlug: string,
  personaType: 'job' | 'edu' | '',
  personaLevel: string,
  budgetScore: number,
  budget: 'free' | 'under10' | 'any',
): string[] {
  const reasons: string[] = [];

  // Category match reason
  if (categoryScore === CATEGORY_EXACT_SCORE) {
    const categoryName = CATEGORY_NAME_MAP[categorySlug] || categorySlug;
    reasons.push(`${categoryName} 전문 도구`);
  }

  // Persona match reason
  if (personaType === 'job' && personaLevel) {
    const jobName = JOB_NAME_MAP[personaSlug] || personaSlug;
    if (personaLevel === 'essential') {
      reasons.push(`${jobName}에게 필수적인 도구`);
    } else if (personaLevel === 'recommended') {
      reasons.push(`${jobName}에게 추천되는 도구`);
    }
  } else if (personaType === 'edu' && personaLevel === 'safe') {
    const eduName = EDU_NAME_MAP[personaSlug] || personaSlug;
    reasons.push(`${eduName}에게 안전한 도구`);
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
    reasons.push('한국어 완벽 지원');
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
    jobRecommendations,
    eduRecommendations,
    category,
    persona,
    personaType,
    budget,
    korean,
  } = input;

  const scored: RecommendedTool[] = tools.map((tool) => {
    // 1. Category match (0-30)
    const categoryMatch = scoreCategoryMatch(tool, category);

    // 2. Persona match (0-25)
    const { score: personaMatch, level: personaLevel } = scorePersonaMatch(
      tool,
      persona,
      personaType,
      jobRecommendations,
      eduRecommendations,
      categoryMatch,
    );

    // 3. Budget fit (0-15)
    const budgetMatch = scoreBudgetFit(tool, budget);

    // 4. Korean support (0-10)
    const koreanMatch = scoreKoreanSupport(tool, korean);

    // 5. Quality signal (0-20)
    const qualitySignal = scoreQualitySignal(tool);

    const matchScore = categoryMatch + personaMatch + budgetMatch + koreanMatch + qualitySignal;

    const matchDetails: MatchDetails = {
      categoryMatch,
      personaMatch,
      budgetMatch,
      koreanMatch,
      qualitySignal: Math.round(qualitySignal * 100) / 100,
    };

    const reasons = generateReasons(
      tool,
      category,
      categoryMatch,
      persona,
      personaType,
      personaLevel,
      budgetMatch,
      budget,
    );

    return {
      tool,
      matchScore: Math.round(matchScore * 100) / 100,
      reasons,
      matchDetails,
    };
  });

  // Sort by matchScore descending, return top results
  scored.sort((a, b) => b.matchScore - a.matchScore);

  return scored.slice(0, MAX_RESULTS);
}
