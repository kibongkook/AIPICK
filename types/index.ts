// ==========================================
// AIPICK 타입 정의 v3.0
// 2단계 분류: 목적(Purpose) + 사용자 타입(UserType)
// ==========================================

export type PricingType = 'Free' | 'Freemium' | 'Paid';
export type RecommendationLevel = 'essential' | 'recommended' | 'optional';
export type SafetyLevel = 'safe' | 'guided' | 'advanced';
export type NewsCategory = 'update' | 'launch' | 'industry' | 'pricing' | 'general';
export type GuideCategory = 'job' | 'education' | 'tip' | 'tutorial';
export type CommentTargetType = 'tool' | 'news' | 'guide';
export type CommunityPostType = 'discussion' | 'tip' | 'question';
export type CommunityTargetType = 'tool' | 'news' | 'guide' | 'general';
export type MediaType = 'image' | 'video';
export type TrendDirection = 'up' | 'down' | 'stable' | 'new';
export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'none';
export type ToolUpdateType = 'feature' | 'model' | 'pricing' | 'improvement' | 'api' | 'other';
export type UpdateImpact = 'major' | 'minor';

// ==========================================
// 통일 카테고리 (12개) — seed.json categories와 동일
// ==========================================
export type PurposeSlug =
  | 'chat' | 'writing' | 'design' | 'video' | 'music' | 'coding'
  | 'automation' | 'translation' | 'data' | 'presentation' | 'marketing' | 'building';

export type CategorySlug = PurposeSlug;

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description?: string;
  color?: string;
  sort_order: number;
  created_at: string;
}

// ==========================================
// 2단계: 사용자 타입 (UserType)
// ==========================================
export type UserTypeSlug =
  | 'beginner' | 'intermediate' | 'daily-user' | 'expert'
  | 'student' | 'teacher' | 'parent' | 'freelancer' | 'team';

export type UserTypeGroup = 'skill' | 'role';

export interface UserType {
  id: string;
  name: string;
  slug: UserTypeSlug;
  description: string | null;
  icon: string | null;
  group: UserTypeGroup;
  sort_order: number;
  created_at: string;
}

// ==========================================
// 목적×사용자타입 → 도구 추천 매핑
// ==========================================
export interface PurposeToolRecommendation {
  id: string;
  purpose_slug: PurposeSlug;
  user_type_slug: UserTypeSlug;
  tool_id: string;
  recommendation_level: RecommendationLevel;
  reason: string | null;
  sort_order: number;
  is_killer_pick?: boolean;
  tool?: Tool;
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
  // category_id: string; // DEPRECATED: 다중 카테고리 지원으로 제거됨
  url: string;
  logo_url: string | null;
  pricing_type: PricingType;
  free_quota_detail: string | null;
  monthly_price: number | null;
  rating_avg: number;
  review_count: number;
  visit_count: number;
  upvote_count: number;
  /** UI 노출에서는 미사용. 내부 정렬/폴백용으로 유지 */
  ranking_score: number;
  weekly_visit_delta: number;
  prev_ranking: number | null;
  tags: string[];
  is_editor_pick: boolean;
  supports_korean: boolean;
  pros: string[];
  cons: string[];
  usage_tips: string[];
  /** @deprecated 2축 평가 시스템 전환으로 미사용. DB 컬럼은 유지 */
  hybrid_score: number;
  /** @deprecated 2축 평가 시스템 전환으로 미사용 */
  external_score: number;
  /** @deprecated 2축 평가 시스템 전환으로 미사용 */
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
  // 외부 식별자 (평점 수집용)
  app_store_id: string | null;
  play_store_id: string | null;
  trustpilot_domain: string | null;
  g2_slug: string | null;
  // 신뢰도 시스템
  confidence_level: ConfidenceLevel;
  confidence_source_count: number;
  rating_sources: string[];
  created_at: string;
  updated_at: string;
  // 다중 카테고리 지원
  categories?: CategoryWithPrimary[];
  primary_category_id?: string;
}

export interface CategoryWithPrimary extends Category {
  is_primary?: boolean;
}

export interface ToolCategory {
  tool_id: string;
  category_id: string;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
}

export interface ToolWithCategory extends Tool {
  category: Category;  // 레거시 호환: primary category를 반환
  categories: CategoryWithPrimary[];
}

// ==========================================
// AI 서비스 제안
// ==========================================
export interface ToolSuggestion {
  id: string;
  user_id: string;
  user_name: string;
  tool_name: string;
  tool_url: string;
  tool_description: string;
  category_slug: string;
  reason: string;
  vote_count: number;
  status: 'pending' | 'approved' | 'rejected' | 'merged';
  merged_tool_id: string | null;
  merged_at: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;

  // 클라이언트 전용
  has_voted?: boolean;
}

// ==========================================
// 레거시 호환: 직군 카테고리 → UserType으로 대체
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
// 레거시 호환: 교육 단계 → UserType으로 대체
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
// 레거시 호환: 직군-툴 추천 매핑
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
// 레거시 호환: 학년-툴 추천 매핑
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
// AI 서비스 변경 이력 (Tool Updates)
// ==========================================
export interface ToolUpdate {
  id: string;
  tool_id: string;
  update_type: ToolUpdateType;
  title: string;
  description: string | null;
  source_url: string | null;
  image_url: string | null;
  version: string | null;
  impact: UpdateImpact;
  announced_at: string;
  created_at: string;
  updated_at: string;
  // 조인 시 포함
  tool?: Pick<Tool, 'name' | 'slug' | 'logo_url'>;
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


export interface CommunityPost {
  id: string;
  target_type: CommunityTargetType;
  target_id: string;
  user_id: string;
  user_name: string | null;
  post_type: CommunityPostType;
  title: string;                      // V2: 제목
  content: string;
  rating: number | null;
  parent_id: string | null;
  media: MediaAttachment[];
  like_count: number;
  comment_count: number;              // V2: reply_count → comment_count
  bookmark_count: number;             // V2: 저장 수
  view_count: number;                 // V2: 조회수
  popularity_score: number;           // V2: 인기 점수
  quality_score: number;              // V2: 품질 점수
  is_reported: boolean;
  is_pinned: boolean;
  is_hidden: boolean;                 // V2: 숨김
  created_at: string;
  updated_at: string;

  // Q&A 시스템
  accepted_answer_id?: string | null;  // 채택된 답변 ID
  answer_count?: number;               // 답변 수
  is_answer?: boolean;                 // 답변 여부
  mentioned_tool_ids?: string[];       // @멘션된 도구 ID

  // 클라이언트 전용
  tags?: CommunityTag[];              // V2: 태그 목록
  has_liked?: boolean;
  has_bookmarked?: boolean;
}

// ==========================================
// 커뮤니티 V2: 태그 시스템
// ==========================================
export type TagType = 'GOAL' | 'AI_TOOL' | 'FEATURE' | 'KEYWORD';

export interface CommunityTag {
  id: string;
  tag_type: TagType;
  tag_value: string;                  // 'writing', 'chatgpt', 'text', '프롬프트'
  tag_display: string;                // '글쓰기', 'ChatGPT', '텍스트', '프롬프트'
  tag_normalized: string;             // 소문자, 검색용
  tag_color: string | null;           // UI 색상
  tag_icon: string | null;            // Lucide 아이콘
  related_tool_id: string | null;     // AI_TOOL인 경우
  related_category_slug: string | null; // GOAL인 경우
  usage_count: number;
  created_at: string;
}

export interface CommunityPostTag {
  id: string;
  post_id: string;
  tag_id: string;
  is_auto_generated: boolean;
  confidence_score: number | null;
  created_at: string;
  tag?: CommunityTag;                 // 조인 시
}

export interface CommunityBookmark {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
}

// 태그 추출 결과
export interface ExtractedTag {
  type: TagType;
  value: string;
  display: string;
  confidence: number;
  related_tool_id?: string;
  related_category_slug?: string;
}

// 커뮤니티 필터
export interface CommunityFilters {
  goal?: string;
  ai?: string;
  keyword?: string;
  sort?: 'latest' | 'popular' | 'saved';
  target_type?: string;
  target_id?: string;
  post_type?: CommunityPostType;
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
  question_count: number;
  answer_count: number;
  accepted_answer_count: number;
  user_type_slug: UserTypeSlug | null;
  preferred_purposes: PurposeSlug[];
  // 레거시 호환
  job_category_slug: string | null;
  edu_level_slug: string | null;
  created_at: string;
  updated_at: string;
}

// ==========================================
// 알림 시스템
// ==========================================
export type NotificationType = 'answer_received' | 'answer_accepted' | 'like_received' | 'mention';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  related_post_id: string | null;
  actor_id: string | null;
  actor_name: string | null;
  is_read: boolean;
  created_at: string;
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
// Daily Picks (매일 자동 선정)
// ==========================================
export type DailyPickType = 'trending' | 'new' | 'hidden_gem' | 'price_drop';

export interface DailyPick {
  id: string;
  pick_date: string;
  tool_id: string;
  pick_type: DailyPickType;
  reason: string;
  sort_order: number;
  created_at: string;
  tool?: Tool;
}

// ==========================================
// AI 레시피 (워크플로우 가이드)
// ==========================================

/** v1 난이도 (하위 호환) */
export type RecipeDifficulty = 'easy' | 'medium' | 'hard';

/** v2 난이도 — 5단계 */
export type RecipeDifficultyV2 =
  | 'very-easy'   // 아주 쉬움 — 클릭 몇 번으로 완성
  | 'easy'        // 쉬움 — 기본 프롬프트 입력 수준
  | 'medium'      // 보통 — 여러 도구 조합
  | 'hard'        // 어려움 — 세밀한 설정 + 반복 작업
  | 'expert';     // 전문가 — 외부 도구 연동 + 고급 기법

export type RecipeCategory =
  | 'music' | 'video' | 'image' | 'marketing' | 'presentation'
  | 'blog' | 'social' | 'education' | 'ecommerce' | 'podcast'
  | 'brand' | 'comic' | '3d'
  | 'writing' | 'design' | 'audio' | 'coding' | 'business' | 'data' | 'personal';

/** v1 단계 (하위 호환) */
export interface RecipeStep {
  step: number;
  title: string;
  tool_slug: string;        // AIPICK 도구 slug (링크 연결)
  tool_name: string;         // 표시용 도구명
  alt_tools?: string[];      // 대안 도구 slug 목록
  action: string;            // 이 단계에서 하는 일
  prompt_example?: string;   // 프롬프트 예시
  tip?: string;              // 핵심 팁
}

/** v2 단계 — 소요시간 + 선택적 단계 추가 */
export interface RecipeStepV2 {
  step: number;
  title: string;
  tool_slug: string;
  tool_name: string;
  alt_tools?: string[];      // 대안 도구 slug 목록 (v1 호환)
  action: string;
  prompt_example?: string;
  tip?: string;
  estimated_time?: string;   // 이 단계의 예상 소요 시간
  optional?: boolean;        // 건너뛰어도 되는 선택적 단계

  // 플레이그라운드 관련 (신규)
  execution_type?: ExecutionType;  // 실행 유형 (없으면 EXECUTABLE_TOOLS에서 자동 결정)
  system_prompt?: string;          // AI 시스템 프롬프트 (없으면 카테고리 기본값 사용)
  result_format?: string;          // 기대 결과 형식 설명
  use_previous?: boolean;          // 이전 단계 결과를 입력에 포함할지
}

/** 멀티옵션 레시피의 하나의 경로 */
export interface RecipeOption {
  option_id: string;           // "direct", "gpt-suno" 등
  title: string;               // "Suno에서 바로 만들기"
  subtitle: string;            // "프롬프트 한 줄이면 3분 안에 노래 완성"
  difficulty: RecipeDifficultyV2;
  estimated_time: string;
  tool_count: number;
  steps: RecipeStepV2[];
  pros: string[];              // 장점 목록 (최소 2개)
  cons: string[];              // 단점 목록 (최소 1개)
  best_for: string;            // 추천 대상
  quality_rating: 1 | 2 | 3 | 4 | 5;
  customization_rating: 1 | 2 | 3 | 4 | 5;
}

/** v1 레시피 (하위 호환) */
export interface AIRecipe {
  slug: string;
  title: string;
  subtitle: string;
  category: RecipeCategory;
  difficulty: RecipeDifficulty;
  estimated_time: string;    // "30분", "1~2시간" 등
  tool_count: number;
  steps: RecipeStep[];
  result_description: string;
  tags: string[];
  icon: string;              // Lucide icon name
  color: string;             // gradient class
}

/** v2 멀티옵션 레시피 */
export interface AIRecipeV2 {
  slug: string;
  title: string;
  subtitle: string;
  category: RecipeCategory;
  difficulty_range: {
    min: RecipeDifficultyV2;
    max: RecipeDifficultyV2;
  };
  result_description: string;
  tags: string[];
  icon: string;
  color: string;
  options: RecipeOption[];   // 쉬운 순 → 어려운 순 정렬
}

/** v1 또는 v2 레시피 유니온 타입 */
export type AnyRecipe = AIRecipe | AIRecipeV2;

/** v2 레시피인지 타입 가드 */
export function isRecipeV2(recipe: AnyRecipe): recipe is AIRecipeV2 {
  return 'options' in recipe && Array.isArray((recipe as AIRecipeV2).options);
}

// ==========================================
// 추천 알고리즘
// ==========================================
export interface MatchDetails {
  purposeMatch: number;    // 0-30 (목적 일치도)
  userTypeMatch: number;   // 0-25 (사용자 타입 일치도)
  budgetMatch: number;     // 0-15
  koreanMatch: number;     // 0-10
  qualitySignal: number;   // 0-20
  // 레거시 호환 별칭
  categoryMatch?: number;
  personaMatch?: number;
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

// ==========================================
// 도발 시스템
// ==========================================
export type ProvocationCategory = 'feature' | 'design' | 'bug' | 'performance' | 'mobile' | 'other';
export type ProvocationStatus = 'submitted' | 'voting' | 'accepted' | 'in_development' | 'completed' | 'rejected';
export type VoteType = 'up' | 'down';

export interface Provocation {
  id: string;
  user_id: string;
  user_name: string;

  title: string;
  category: ProvocationCategory;
  description: string;
  expected_effect: string | null;
  reference_url: string | null;
  images: string[];

  status: ProvocationStatus;
  vote_up_count: number;
  vote_down_count: number;
  comment_count: number;

  voting_round_id: number | null;
  voting_start_date: string | null;
  voting_end_date: string | null;

  rejection_reason: string | null;

  created_at: string;
  updated_at: string;

  // 클라이언트 전용 필드
  user_vote?: VoteType | null;
  vote_ratio?: number;
}

export interface ProvocationVote {
  id: string;
  provocation_id: string;
  user_id: string;
  vote_type: VoteType;
  created_at: string;
}

export interface VotingRound {
  id: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed';
  winner_ids: string[];
  created_at: string;
}

export interface ProvocationFilters {
  status?: ProvocationStatus;
  category?: ProvocationCategory;
  keyword?: string;
  sort?: 'latest' | 'popular' | 'votes';
}

// ==========================================
// 레시피 플레이그라운드
// ==========================================
export type ExecutionType = 'text' | 'image' | 'code';
export type ExecutionStatus = 'success' | 'error' | 'cancelled';
export type PaymentStatus = 'pending' | 'confirmed' | 'cancelled' | 'refunded';
export type PaymentMethod = 'card' | 'kakaopay' | 'naverpay' | 'tosspay';

export interface UserExecution {
  user_id: string;
  daily_free_used: number;
  daily_reset_date: string;
  total_free_used: number;
  total_paid_used: number;
  total_paid_amount: number;
  updated_at: string;
}

export interface RecipeExecution {
  id: string;
  user_id: string;
  recipe_slug: string;
  option_id: string | null;
  step_number: number;
  tool_slug: string;
  execution_type: ExecutionType;
  provider: string;
  model: string;
  is_free: boolean;
  paid_amount: number;
  payment_id: string | null;
  input_tokens: number | null;
  output_tokens: number | null;
  status: ExecutionStatus;
  error_message: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  payment_key: string | null;
  order_id: string;
  amount: number;
  status: PaymentStatus;
  execution_id: string | null;
  method: PaymentMethod | null;
  receipt_url: string | null;
  created_at: string;
  confirmed_at: string | null;
  cancelled_at: string | null;
}

export interface ExecutionConfig {
  type: ExecutionType;
  provider: string;
  model: string;
  fallback?: {
    provider: string;
    model: string;
  };
}
