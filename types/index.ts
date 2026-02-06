// ==========================================
// AIPICK 타입 정의 v2.0
// DB 스키마와 1:1 매핑
// ==========================================

export type PricingType = 'Free' | 'Freemium' | 'Paid';
export type RecommendationLevel = 'essential' | 'recommended' | 'optional';
export type SafetyLevel = 'safe' | 'guided' | 'advanced';
export type NewsCategory = 'update' | 'launch' | 'industry' | 'pricing' | 'general';
export type GuideCategory = 'job' | 'education' | 'tip' | 'tutorial';
export type CommentTargetType = 'tool' | 'news' | 'guide';

// ==========================================
// 카테고리
// ==========================================
export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description?: string;
  sort_order: number;
  created_at: string;
}

// ==========================================
// AI 서비스
// ==========================================
export interface Tool {
  id: string;
  name: string;
  slug: string;
  description: string;
  long_description: string | null;
  category_id: string;
  url: string;
  logo_url: string | null;
  pricing_type: PricingType;
  free_quota_detail: string | null;
  monthly_price: number | null;
  rating_avg: number;
  review_count: number;
  visit_count: number;
  upvote_count: number;
  ranking_score: number;
  weekly_visit_delta: number;
  prev_ranking: number | null;
  tags: string[];
  is_editor_pick: boolean;
  supports_korean: boolean;
  pros: string[];
  cons: string[];
  created_at: string;
  updated_at: string;
}

export interface ToolWithCategory extends Tool {
  category: Category;
}

// ==========================================
// 직군 카테고리
// ==========================================
export interface JobCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  created_at: string;
}

// ==========================================
// 교육 단계
// ==========================================
export interface EduLevel {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  age_range: string | null;
  icon: string | null;
  sort_order: number;
  created_at: string;
}

// ==========================================
// 직군-툴 추천 매핑
// ==========================================
export interface JobToolRecommendation {
  id: string;
  job_category_id: string;
  tool_id: string;
  recommendation_level: RecommendationLevel;
  reason: string | null;
  sort_order: number;
  tool?: Tool;
}

// ==========================================
// 학년-툴 추천 매핑
// ==========================================
export interface EduToolRecommendation {
  id: string;
  edu_level_id: string;
  tool_id: string;
  safety_level: SafetyLevel;
  use_case: string | null;
  sort_order: number;
  tool?: Tool;
}

// ==========================================
// 리뷰
// ==========================================
export interface Review {
  id: string;
  tool_id: string;
  user_id: string;
  rating: number;
  content: string;
  helpful_count: number;
  created_at: string;
  updated_at: string;
}

// ==========================================
// 기능별 세부 평가
// ==========================================
export interface ToolFeatureRating {
  id: string;
  review_id: string;
  tool_id: string;
  user_id: string;
  ease_of_use: number | null;
  korean_support: number | null;
  free_quota: number | null;
  feature_variety: number | null;
  value_for_money: number | null;
}

// ==========================================
// 북마크
// ==========================================
export interface Bookmark {
  id: string;
  user_id: string;
  tool_id: string;
  created_at: string;
}

// ==========================================
// 업보트
// ==========================================
export interface Upvote {
  id: string;
  user_id: string;
  tool_id: string;
  created_at: string;
}

// ==========================================
// 댓글
// ==========================================
export interface Comment {
  id: string;
  target_type: CommentTargetType;
  target_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  like_count: number;
  is_reported: boolean;
  created_at: string;
  updated_at: string;
}

// ==========================================
// 컬렉션
// ==========================================
export interface Collection {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  is_public: boolean;
  like_count: number;
  created_at: string;
  updated_at: string;
}

export interface CollectionItem {
  id: string;
  collection_id: string;
  tool_id: string;
  sort_order: number;
  tool?: Tool;
}

// ==========================================
// 뉴스
// ==========================================
export interface News {
  id: string;
  title: string;
  summary: string | null;
  content: string | null;
  source_url: string;
  image_url: string | null;
  category: NewsCategory;
  related_tool_id: string | null;
  view_count: number;
  published_at: string;
  created_at: string;
}

// ==========================================
// AI 활용 가이드
// ==========================================
export interface Guide {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: GuideCategory;
  related_job_id: string | null;
  related_edu_id: string | null;
  view_count: number;
  author_id: string | null;
  created_at: string;
  updated_at: string;
}

// ==========================================
// 주간 랭킹 스냅샷
// ==========================================
export interface WeeklyRanking {
  id: string;
  tool_id: string;
  week_start: string;
  ranking: number;
  ranking_score: number;
  visit_count: number;
  tool?: Tool;
}
