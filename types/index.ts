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
export type CommunityPostType = 'rating' | 'discussion' | 'tip' | 'question';
export type CommunityTargetType = 'tool' | 'news' | 'guide';
export type MediaType = 'image' | 'video';
export type TrendDirection = 'up' | 'down' | 'stable' | 'new';

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
  hybrid_score: number;
  external_score: number;
  internal_score: number;
  trend_direction: TrendDirection;
  trend_magnitude: number;
  has_benchmark_data: boolean;
  github_stars: number | null;
  github_forks: number | null;
  product_hunt_upvotes: number | null;
  model_identifiers: string[];
  sample_output: string | null;
  sample_output_prompt: string | null;
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
  is_killer_pick?: boolean;
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
  is_killer_pick?: boolean;
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

// ==========================================
// 커뮤니티 게시물
// ==========================================
export interface MediaAttachment {
  url: string;
  type: MediaType;
  thumbnail_url?: string;
  size?: number;
  filename?: string;
}

export interface FeatureRatings {
  ease_of_use: number;
  korean_support: number;
  free_quota: number;
  feature_variety: number;
  value_for_money: number;
}

export interface CommunityPost {
  id: string;
  target_type: CommunityTargetType;
  target_id: string;
  user_id: string;
  user_name: string | null;
  post_type: CommunityPostType;
  content: string;
  rating: number | null;
  feature_ratings: FeatureRatings | null;
  parent_id: string | null;
  media: MediaAttachment[];
  like_count: number;
  reply_count: number;
  is_reported: boolean;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

// ==========================================
// 사용자 등급 / 신뢰도 시스템
// ==========================================
export type UserLevel = 'newcomer' | 'active' | 'expert' | 'master';

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  level: UserLevel;
  experience_points: number;
  review_count: number;
  comment_count: number;
  helpful_count: number;
  job_category_slug: string | null;
  edu_level_slug: string | null;
  created_at: string;
  updated_at: string;
}

// ==========================================
// 외부 데이터 파이프라인
// ==========================================
export interface ExternalDataSource {
  id: string;
  source_key: string;
  display_name: string;
  source_url: string | null;
  fetch_frequency: string;
  last_fetched_at: string | null;
  last_status: string;
  last_error: string | null;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface ToolExternalScore {
  id: string;
  tool_id: string;
  source_key: string;
  normalized_score: number;
  raw_data: Record<string, unknown>;
  fetched_at: string;
  created_at: string;
  updated_at: string;
}

export interface ToolBenchmarkScore {
  id: string;
  tool_id: string;
  benchmark_source: string;
  overall_score: number | null;
  mmlu: number | null;
  hellaswag: number | null;
  arc_challenge: number | null;
  truthfulqa: number | null;
  winogrande: number | null;
  gsm8k: number | null;
  humaneval: number | null;
  elo_rating: number | null;
  elo_rank: number | null;
  quality_index: number | null;
  speed_index: number | null;
  speed_ttft_ms: number | null;
  speed_tps: number | null;
  extra_scores: Record<string, unknown>;
  fetched_at: string;
  created_at: string;
  updated_at: string;
}

export interface ToolPricingData {
  id: string;
  tool_id: string;
  source: string;
  input_price_per_1m_tokens: number | null;
  output_price_per_1m_tokens: number | null;
  context_window: number | null;
  max_output_tokens: number | null;
  free_tier_details: string | null;
  pro_monthly_price: number | null;
  enterprise_monthly_price: number | null;
  value_score: number | null;
  fetched_at: string;
  updated_at: string;
}

export interface ScoringWeight {
  id: string;
  weight_key: string;
  weight_value: number;
  description: string | null;
  category: string;
  updated_at: string;
}

export interface TrendSnapshot {
  id: string;
  tool_id: string;
  snapshot_date: string;
  ranking_position: number;
  ranking_score: number;
  visit_count: number;
  review_count: number;
  bookmark_count: number;
  upvote_count: number;
  external_score: number;
  created_at: string;
}

export interface CategoryPopularity {
  id: string;
  category_slug: string;
  period: string;
  total_visits: number;
  total_reviews: number;
  total_bookmarks: number;
  tool_count: number;
  avg_ranking_score: number;
  popularity_score: number;
  computed_at: string;
}

// ==========================================
// 추천 알고리즘
// ==========================================
export interface MatchDetails {
  categoryMatch: number;   // 0-30
  personaMatch: number;    // 0-25
  budgetMatch: number;     // 0-15
  koreanMatch: number;     // 0-10
  qualitySignal: number;   // 0-20
}

export interface RecommendedTool {
  tool: Tool;
  matchScore: number;       // 0-100
  reasons: string[];
  matchDetails: MatchDetails;
}

// ==========================================
// AI 쇼케이스 (카테고리별 프롬프트→결과 비교)
// ==========================================
export type ShowcaseMediaType = 'image' | 'text' | 'code';

export interface CategoryShowcase {
  id: string;
  category_slug: string;
  prompt: string;           // 영문 원본
  prompt_ko: string;        // 한국어 표시용
  description: string;
  media_type: ShowcaseMediaType;
  sort_order: number;
}

export interface ToolShowcase {
  id: string;
  tool_slug: string;
  showcase_id: string;
  result_image_url: string | null;
  result_text: string | null;
  result_description: string;
  sort_order: number;
  tool?: Tool;
  showcase?: CategoryShowcase;
}

// ==========================================
// 직업/역할별 AI 활용 쇼케이스
// ==========================================
export interface RoleShowcase {
  id: string;
  target_type: 'job' | 'education';
  target_slug: string;          // 'marketing', 'student' 등
  title: string;                // "마케팅에서 AI를 잘 활용하면?"
  subtitle: string;
  hero_image_url: string | null;
  sort_order: number;
}

export interface RoleUseCaseShowcase {
  id: string;
  role_showcase_id: string;
  tool_slug: string;
  title: string;                // "SNS 광고 카피 자동 생성"
  description: string;
  prompt_example: string | null;
  result_image_url: string | null;
  result_text: string | null;
  result_video_url: string | null;
  outcome: string;              // "클릭률 30% 향상"
  sort_order: number;
  tool?: Tool;
  role_showcase?: RoleShowcase;
}
