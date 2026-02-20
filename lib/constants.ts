import type { PricingType } from '@/types';

// ==========================================
// 사이트 메타 정보
// ==========================================
export const SITE_NAME = 'AIPICK';
export const SITE_DESCRIPTION = '당신과 같은 전문가들이 매일 확인하는 AI 큐레이션. 직군별 필수 AI와 무료 사용량을 한눈에.';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aipick.kr';

// ==========================================
// 통일 카테고리 (12개)
// seed.json categories와 동일한 체계
// ==========================================
export const TOOL_CATEGORIES = [
  { name: '아이디어 · 브레인스토밍', slug: 'chat', icon: 'Lightbulb', description: '생각 정리, 아이디어 발전, AI와 대화', color: 'from-blue-600 to-indigo-600' },
  { name: '글쓰기 · 문서 · 요약', slug: 'writing', icon: 'PenTool', description: '블로그, 보고서, 번역, 요약까지', color: 'from-blue-500 to-blue-600' },
  { name: '디자인 · 이미지', slug: 'design', icon: 'Image', description: '로고, 썸네일, 일러스트 생성', color: 'from-purple-500 to-pink-600' },
  { name: '영상 · 콘텐츠 제작', slug: 'video', icon: 'Video', description: '영상 편집, 자막, 음악까지', color: 'from-red-500 to-orange-600' },
  { name: '음악 · 오디오', slug: 'music', icon: 'Music', description: '음악 생성, 음성 합성, 오디오 편집', color: 'from-pink-500 to-rose-600' },
  { name: '코딩 · 개발', slug: 'coding', icon: 'Code', description: '코드 생성, 디버깅, 리뷰', color: 'from-emerald-500 to-teal-600' },
  { name: '업무 자동화', slug: 'automation', icon: 'Zap', description: '반복 작업 줄이고 효율 높이기', color: 'from-amber-500 to-yellow-600' },
  { name: '번역 · 언어', slug: 'translation', icon: 'Languages', description: '다국어 번역, 언어 학습', color: 'from-cyan-500 to-blue-600' },
  { name: '데이터 · 리서치', slug: 'data', icon: 'BarChart', description: '데이터 분석, 자료 조사, 논문 검색', color: 'from-teal-500 to-emerald-600' },
  { name: '발표자료 · PPT', slug: 'presentation', icon: 'Presentation', description: '슬라이드, 프레젠테이션 자동 생성', color: 'from-pink-500 to-rose-600' },
  { name: '마케팅 · 홍보', slug: 'marketing', icon: 'Megaphone', description: 'SNS, 광고, SEO, 카피라이팅', color: 'from-orange-500 to-red-600' },
  { name: '서비스 · 제품 만들기', slug: 'building', icon: 'Rocket', description: '프로토타입, MVP, 노코드 개발', color: 'from-violet-500 to-indigo-600' },
] as const;

// 레거시 호환: PURPOSE_CATEGORIES → TOOL_CATEGORIES
export const PURPOSE_CATEGORIES = TOOL_CATEGORIES;
export const CATEGORIES = TOOL_CATEGORIES.map((p) => ({
  name: p.name,
  slug: p.slug,
  icon: p.icon,
}));

// ==========================================
// 가격 타입 설정
// ==========================================
export const PRICING_CONFIG: Record<PricingType, { label: string; className: string }> = {
  Free: {
    label: '완전 무료',
    className: 'bg-emerald-100 text-emerald-700',
  },
  Freemium: {
    label: '부분 무료',
    className: 'bg-blue-100 text-blue-700',
  },
  Paid: {
    label: '유료',
    className: 'bg-gray-100 text-gray-600',
  },
};

// ==========================================
// 히어로 목적 버튼 (메인 페이지 - 1단계 진입)
// ==========================================
export const HERO_PURPOSE_BUTTONS = TOOL_CATEGORIES.map(p => ({
  label: p.name.split(' · ')[0],
  icon: p.icon,
  slug: p.slug,
}));

// ==========================================
// 메인 페이지 인기 목적 섹션 (상위 5개)
// ==========================================
export const MAIN_PAGE_PURPOSES = TOOL_CATEGORIES.slice(0, 5).map(p => ({
  slug: p.slug,
  title: p.name,
  subtitle: p.description,
  icon: p.icon,
}));

// 레거시 호환
export const HERO_KEYWORDS = HERO_PURPOSE_BUTTONS;
export const MAIN_PAGE_CATEGORIES = MAIN_PAGE_PURPOSES;
export const MAIN_PAGE_CATEGORIES_REDUCED = MAIN_PAGE_PURPOSES.slice(0, 3);

// ==========================================
// 사이드바 카테고리별 랭킹 설정
// DB 카테고리 slug 기준
// ==========================================
export const SIDEBAR_CATEGORY_RANKINGS = TOOL_CATEGORIES.map(c => ({
  label: c.name.split(' · ')[0],
  slug: c.slug,
}));

// ==========================================
// 2단계: 사용자 타입 (Skill & Context)
// "당신은 어떤 상황에서 쓰나요?"
// ==========================================
export const USER_TYPES = [
  { name: '질문 답변만 받고 있는데 더 잘 쓰고 싶어요', slug: 'chat-user', icon: 'MessageCircle', description: 'AI를 처음 접하는 분 — 쉽고 범용적인 도구부터', group: 'skill' },
  { name: '여러가지 AI로 좋은 결과물을 만들고 싶어요', slug: 'multi-ai-user', icon: 'Layers', description: '기본은 알지만 더 효율적으로 활용하고 싶은 분', group: 'skill' },
  { name: '요즘은 개나소나 개발도 한다던데... 저도 해보고 싶어요', slug: 'aspiring-developer', icon: 'Code', description: '개발에 관심 있는 분 — AI로 코딩 시작하기', group: 'skill' },
  { name: '학생', slug: 'student', icon: 'GraduationCap', description: '중·고·대학생', group: 'role' },
  { name: '선생님 · 강사', slug: 'teacher', icon: 'Users', description: '교사, 교수, 학원 강사', group: 'role' },
  { name: '학부모', slug: 'parent', icon: 'Heart', description: '자녀 교육에 AI를 활용하는 분', group: 'role' },
  { name: '1인 사업자 · 프리랜서', slug: 'freelancer', icon: 'User', description: '혼자서 다 해야 하는 분', group: 'role' },
  { name: '팀 · 회사', slug: 'team', icon: 'Building', description: '팀 단위로 AI를 도입하는 분', group: 'role' },
] as const;

// ==========================================
// 카테고리별 동적 세부 질문 (AI 찾기 위자드 Step 2)
// 각 userTypeSlug는 DB purpose_tool_recommendations의 user_type_slug에 매핑
// ==========================================
export interface CategoryUseCase {
  label: string;
  userTypeSlug: string;
  icon: string;
  description: string;
}

export const CATEGORY_USE_CASES: Record<string, CategoryUseCase[]> = {
  // ── 아이디어 · 브레인스토밍 ──
  // OpenAI 연구: 업무용 30%, 개인용 70%. 주요 용도: 질문·조언(49%), 정보검색(24%), 작업실행(40%)
  chat: [
    { label: '업무에 AI를 활용하고 싶어요', userTypeSlug: 'daily-user', icon: 'Briefcase', description: '보고서 작성, 브레인스토밍, 이메일 초안' },
    { label: '다양한 AI를 써보고 싶어요', userTypeSlug: 'beginner', icon: 'Sparkles', description: '어떤 AI가 나에게 맞는지 비교해보기' },
    { label: '정보 검색·리서치가 목적이에요', userTypeSlug: 'student', icon: 'Search', description: '출처 있는 답변, 자료 조사, 학습' },
  ],
  // ── 글쓰기 ──
  // OpenAI: 글쓰기가 업무용 ChatGPT 사용의 42% 차지
  writing: [
    { label: '업무 문서·이메일·보고서', userTypeSlug: 'daily-user', icon: 'Briefcase', description: '기획서, 보고서, 비즈니스 이메일 작성' },
    { label: '블로그·SNS 콘텐츠 작성', userTypeSlug: 'beginner', icon: 'PenTool', description: '블로그 글, 인스타/유튜브 스크립트' },
    { label: '학술 논문·과제·리포트', userTypeSlug: 'student', icon: 'GraduationCap', description: '논문, 과제, 학술 글쓰기 보조' },
  ],
  // ── 디자인 ──
  design: [
    { label: '썸네일·SNS 이미지 만들기', userTypeSlug: 'beginner', icon: 'Image', description: '유튜브 썸네일, 인스타 포스트, 배너' },
    { label: '전문 디자인·상업용 작업', userTypeSlug: 'freelancer', icon: 'Palette', description: '로고, 브랜딩, 고해상도 이미지 생성' },
  ],
  // ── 영상 ──
  video: [
    { label: '간단한 영상 편집·자막 추가', userTypeSlug: 'beginner', icon: 'Video', description: '자동 자막, 숏폼 편집, 클립 만들기' },
    { label: '전문 영상 제작·고급 편집', userTypeSlug: 'freelancer', icon: 'Clapperboard', description: 'AI 영상 생성, VFX, 전문 편집' },
  ],
  // ── 음악·오디오 ──
  music: [
    { label: 'AI로 음악 만들어보기', userTypeSlug: 'beginner', icon: 'Music', description: '텍스트로 곡 생성, 배경음악 만들기' },
    { label: '전문 음악·음성 제작', userTypeSlug: 'freelancer', icon: 'Headphones', description: 'TTS 음성 합성, 프로급 음악 제작' },
  ],
  // ── 코딩 ──
  // StackOverflow: 개발자 84%가 AI 도구 사용, 51%가 매일 사용
  coding: [
    { label: '코딩 없이 앱·웹사이트 만들기', userTypeSlug: 'beginner', icon: 'Rocket', description: '노코드/로우코드, 프롬프트로 개발' },
    { label: '코드 작성·리뷰 도우미', userTypeSlug: 'expert', icon: 'Terminal', description: 'AI 코드 자동완성, 디버깅, 리뷰' },
  ],
  // ── 업무 자동화 ──
  // 한국: 직장인 61.5%가 업무에 AI 활용, 반복 작업 감소가 핵심
  automation: [
    { label: '반복 업무 자동화하고 싶어요', userTypeSlug: 'daily-user', icon: 'Zap', description: '이메일, 일정, 데이터 입력 자동화' },
    { label: '혼자서 다 해야 하는 상황이에요', userTypeSlug: 'freelancer', icon: 'User', description: '1인 기업, 올인원 업무 자동화' },
    { label: '팀 워크플로우 개선', userTypeSlug: 'team', icon: 'Users', description: '팀 협업, 프로젝트 관리 자동화' },
  ],
  // ── 번역 ──
  translation: [
    { label: '간단한 텍스트·일상 번역', userTypeSlug: 'beginner', icon: 'Globe', description: '웹페이지, 메시지, 간단한 문장' },
    { label: '업무·문서 전문 번역', userTypeSlug: 'daily-user', icon: 'FileText', description: '계약서, 기술문서, 비즈니스 번역' },
  ],
  // ── 데이터·리서치 ──
  data: [
    { label: '정보 검색·자료 수집', userTypeSlug: 'beginner', icon: 'Search', description: '논문 찾기, 트렌드 조사, 팩트체크' },
    { label: '학술 논문·리서치', userTypeSlug: 'student', icon: 'GraduationCap', description: '논문 검색, 문헌 리뷰, 학술 분석' },
    { label: '업무 데이터 분석·시각화', userTypeSlug: 'daily-user', icon: 'BarChart', description: '엑셀 분석, 대시보드, 보고서 생성' },
  ],
  // ── 발표자료 ──
  presentation: [
    { label: '빠르게 발표자료 만들기', userTypeSlug: 'beginner', icon: 'Presentation', description: '주제만 입력하면 슬라이드 자동 생성' },
    { label: '업무 프레젠테이션·보고서', userTypeSlug: 'daily-user', icon: 'Briefcase', description: '투자 피칭, 사업 보고서, 제안서' },
  ],
  // ── 마케팅 ──
  marketing: [
    { label: 'SNS·블로그 마케팅', userTypeSlug: 'beginner', icon: 'Megaphone', description: '인스타, 유튜브, 블로그 콘텐츠' },
    { label: '광고·SEO·전문 마케팅', userTypeSlug: 'freelancer', icon: 'Target', description: '광고 카피, SEO 최적화, 퍼포먼스 마케팅' },
  ],
  // ── 서비스 만들기 ──
  building: [
    { label: '노코드로 서비스 만들기', userTypeSlug: 'beginner', icon: 'Rocket', description: 'MVP, 랜딩페이지, 프로토타입' },
    { label: 'AI 활용 개발 (개발자용)', userTypeSlug: 'expert', icon: 'Terminal', description: 'AI 코딩 에이전트, 풀스택 개발' },
  ],
};

// 레거시 호환: 기존 직군/학년 코드가 참조하는 상수 유지
export const JOB_CATEGORIES = USER_TYPES.filter(u => u.group === 'role' || (u.slug as string) === 'daily-user' || (u.slug as string) === 'expert').map(u => ({
  name: u.name,
  slug: u.slug,
  icon: u.icon,
}));
export const FEATURED_JOB_SLUGS = ['freelancer', 'daily-user', 'student'] as const;

export const EDU_LEVELS = [
  { name: '학생', slug: 'student', ageRange: null, icon: 'GraduationCap' },
  { name: '선생님 · 강사', slug: 'teacher', ageRange: null, icon: 'Users' },
  { name: '학부모', slug: 'parent', ageRange: null, icon: 'Heart' },
] as const;
export const FEATURED_EDU_SLUGS = ['student', 'teacher', 'parent'] as const;

// ==========================================
// 추천 등급 설정
// ==========================================
export const RECOMMENDATION_LEVELS = {
  essential: { label: '필수', color: 'bg-red-100 text-red-700 border-red-200' },
  recommended: { label: '추천', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  optional: { label: '선택', color: 'bg-gray-100 text-gray-600 border-gray-200' },
} as const;

// ==========================================
// 안전 등급 설정
// ==========================================
export const SAFETY_LEVELS = {
  safe: { label: '안전', emoji: '🟢', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', description: '자유롭게 사용 가능' },
  guided: { label: '지도 필요', emoji: '🟡', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', description: '보호자/교사 지도 하에 사용' },
  advanced: { label: '고급', emoji: '🔴', color: 'bg-red-100 text-red-700 border-red-200', description: '고학년/성인용' },
} as const;

// ==========================================
// 뉴스 카테고리 설정
// ==========================================
export const NEWS_CATEGORIES = {
  update: { label: '업데이트', color: 'bg-blue-100 text-blue-700' },
  launch: { label: '신규 출시', color: 'bg-emerald-100 text-emerald-700' },
  industry: { label: '업계 동향', color: 'bg-purple-100 text-purple-700' },
  pricing: { label: '가격 변경', color: 'bg-orange-100 text-orange-700' },
  general: { label: '일반', color: 'bg-gray-100 text-gray-600' },
} as const;

export const NEWS_WEEKLY_BEST_KEY = 'weekly-best';

export const NEWS_FILTER_TABS: { key: string | null; label: string }[] = [
  { key: null, label: '전체' },
  { key: NEWS_WEEKLY_BEST_KEY, label: '주간 베스트' },
  { key: 'update', label: '업데이트' },
  { key: 'launch', label: '신규 출시' },
  { key: 'industry', label: '업계 동향' },
  { key: 'pricing', label: '가격 변경' },
];

/** 주간 베스트 뉴스 최대 노출 수 */
export const HOT_NEWS_COUNT = 20;

// ==========================================
// AI 찾기 (Discover) 설정
// ==========================================

/** sample_output이 의미 있는 길이인지 판별하는 최소 문자 수 */
export const MIN_SAMPLE_OUTPUT_LENGTH = 30;

export const DISCOVER_CATEGORY_TABS = [
  { slug: '', label: '전체', emoji: '' },
  { slug: 'chat', label: '아이디어', emoji: '💡' },
  { slug: 'writing', label: '글쓰기', emoji: '✍️' },
  { slug: 'design', label: '이미지', emoji: '🎨' },
  { slug: 'coding', label: '코드', emoji: '💻' },
  { slug: 'video', label: '영상', emoji: '🎬' },
  { slug: 'music', label: '음악', emoji: '🎵' },
  { slug: 'data', label: '데이터', emoji: '📊' },
  { slug: 'presentation', label: '발표', emoji: '📑' },
  { slug: 'marketing', label: '마케팅', emoji: '📢' },
  { slug: 'translation', label: '번역', emoji: '🌍' },
  { slug: 'automation', label: '자동화', emoji: '⚡' },
  { slug: 'building', label: '서비스', emoji: '🚀' },
] as const;

export const DISCOVER_SORT_OPTIONS = [
  { key: 'recommended', label: '추천순' },
  { key: 'free', label: '💸 무료부터' },
  { key: 'quality', label: '⭐ 고품질' },
  { key: 'rich', label: '📄 풍부한 내용' },
] as const;

export type DiscoverSortKey = typeof DISCOVER_SORT_OPTIONS[number]['key'];

// ==========================================
// 페이지네이션 / UI
// ==========================================
export const ITEMS_PER_PAGE = 12;
export const EDITOR_PICKS_COUNT = 6;
export const CATEGORY_PREVIEW_COUNT = 4;
export const MAIN_EDITOR_PICKS_COUNT = 4;
export const MAIN_NEW_TOOLS_COUNT = 4;
export const MAIN_CATEGORY_TOOLS_COUNT = 4;
export const SIMILAR_TOOLS_COUNT = 3;
export const RANKING_TOP_COUNT = 100;
export const RANKING_CATEGORY_COUNT = 20;
export const TRENDING_COUNT = 10;

// ==========================================
// 리뷰 설정 (레거시 - 커뮤니티 시스템으로 대체)
// ==========================================
export const MIN_REVIEW_LENGTH = 10;
export const MAX_REVIEW_LENGTH = 500;
export const RATING_MIN = 1;
export const RATING_MAX = 5;

// ==========================================
// 커뮤니티 시스템 설정
// ==========================================
export const COMMUNITY_SECTION_LABEL = '커뮤니티';

export const COMMUNITY_POST_TYPES = {
  discussion: { label: '일반', icon: 'MessageSquare', color: 'bg-blue-100 text-blue-700' },
  tip: { label: '팁', icon: 'Lightbulb', color: 'bg-emerald-100 text-emerald-700' },
  question: { label: '질문', icon: 'HelpCircle', color: 'bg-purple-100 text-purple-700' },
} as const;

export const MIN_POST_CONTENT_LENGTH = 5;
export const MAX_POST_CONTENT_LENGTH = 2000;
export const MAX_MEDIA_ATTACHMENTS = 5;
export const MAX_MEDIA_FILE_SIZE_MB = 10;
export const MAX_VIDEO_FILE_SIZE_MB = 50;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'] as const;

export const COMMUNITY_SORT_OPTIONS = [
  { value: 'latest' as const, label: '최신순' },
  { value: 'popular' as const, label: '인기순' },
] as const;

export const COMMUNITY_STORAGE_KEY = 'aipick_community_posts';
export const COMMUNITY_MEDIA_STORAGE_KEY = 'aipick_community_media';


// ==========================================
// 사용자 등급제 설정 (신뢰도 기반 차등 평가)
// ==========================================
export const USER_LEVELS = {
  newcomer: { label: '뉴비', minExp: 0, weight: 1.0, color: 'bg-gray-100 text-gray-600' },
  active: { label: '활동가', minExp: 50, weight: 1.2, color: 'bg-blue-100 text-blue-700' },
  expert: { label: '전문가', minExp: 200, weight: 1.5, color: 'bg-purple-100 text-purple-700' },
  master: { label: '마스터', minExp: 500, weight: 2.0, color: 'bg-amber-100 text-amber-700' },
} as const;

export const EXP_ACTIONS = {
  review: 10,
  comment: 3,
  helpful_vote: 2,
  collection_create: 15,
  guide_write: 25,
  daily_login: 1,
  question: 3,
  answer: 5,
  accepted_answer: 15,
} as const;

// ==========================================
// 하이브리드 스코어링 설정
// ==========================================
/**
 * 4계층 하이브리드 스코어링 가중치 (총 100점)
 *
 * 1계층: 기술 품질 (35%) — LLM만 해당, 비-LLM은 2계층으로 재분배
 * 2계층: 커뮤니티 검증 (40%) — 전체 도구
 * 3계층: 실용성 (15%) — pricing은 LLM만, korean은 전체
 * 4계층: AIPICK 자체 (10%) — 전체 (사용자 확보 후 활성화)
 */
/**
 * 점수(hybrid_score, 0~100) 4-카테고리 가중치
 *
 * 카테고리 1: 사용자 리뷰 (40%) — App Store, Play Store, G2, Trustpilot, PH
 * 카테고리 2: 인기도 (25%) — Tranco 순위, Open PageRank
 * 카테고리 3: 커뮤니티 (25%) — PH 업보트, GitHub Stars, HN 멘션
 * 카테고리 4: 벤치마크 (10%) — LMSYS Arena, HuggingFace (LLM만)
 */
export const DEFAULT_SCORING_WEIGHTS = {
  // 카테고리 가중치 (총합 100)
  cat_user_reviews: 40,
  cat_popularity: 25,
  cat_community: 25,
  cat_benchmarks: 10,
  // 사용자 리뷰 서브 가중치 (카테고리 내 비율)
  review_app_store: 30,
  review_play_store: 25,
  review_g2: 20,
  review_trustpilot: 10,
  review_product_hunt: 15,
  // 인기도 서브 가중치
  pop_tranco: 50,
  pop_pagerank: 50,
  // 커뮤니티 서브 가중치
  comm_ph_upvotes: 35,
  comm_github: 40,
  comm_hn_mentions: 25,
  // 벤치마크 서브 가중치 (LLM만)
  bench_lmsys_arena: 50,
  bench_huggingface: 50,
  // 레거시 호환 (기존 코드가 참조할 수 있음)
  tier1_arena_elo: 15,
  tier1_benchmark: 12,
  tier1_artificial_analysis: 8,
  tier2_ph_rating: 15,
  tier2_ph_votes: 5,
  tier2_github: 12,
  tier2_hn_mentions: 8,
  tier3_pricing: 10,
  tier3_korean: 5,
  tier4_user_rating: 5,
  tier4_engagement: 5,
} as const;

export const TREND_THRESHOLDS = {
  HOT: 10,
  STRONG: 5,
  MILD: 1,
} as const;

export const DATA_SOURCE_KEYS = {
  // 기존 소스
  GITHUB: 'github',
  PRODUCT_HUNT: 'product_hunt',
  PRODUCT_HUNT_VOTES: 'product_hunt_votes',
  HUGGINGFACE_LLM: 'huggingface_llm',
  OPENROUTER: 'openrouter',
  ARTIFICIAL_ANALYSIS: 'artificial_analysis',
  LMSYS_ARENA: 'lmsys_arena',
  HACKERNEWS: 'hackernews',
  DISCOVERY_PH: 'discovery_product_hunt',
  DISCOVERY_GITHUB: 'discovery_github',
  DISCOVERY_HN: 'discovery_hackernews',
  // 신규 소스 (평점 + 점수 재설계)
  APP_STORE: 'app_store',
  PLAY_STORE: 'play_store',
  TRANCO: 'tranco',
  OPEN_PAGERANK: 'open_pagerank',
  TRUSTPILOT: 'trustpilot',
  G2: 'g2',
} as const;

// ==========================================
// 신뢰도 등급 시스템
// ==========================================
export const CONFIDENCE_THRESHOLDS = {
  HIGH_MIN_SOURCES: 5,
  MEDIUM_MIN_SOURCES: 3,
  LOW_MIN_SOURCES: 1,
} as const;

export const CONFIDENCE_BADGES = {
  high: { label: '높음', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  medium: { label: '보통', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  low: { label: '낮음', color: 'bg-gray-100 text-gray-600 border-gray-200' },
  none: { label: '없음', color: '' },
} as const;

// ==========================================
// 평점 집계 가중치 (rating_avg 1~5 계산용)
// 소스: 실제 사용자 별점 플랫폼만 사용
// ==========================================
export const DEFAULT_RATING_WEIGHTS = {
  app_store: 30,
  play_store: 25,
  g2: 20,
  trustpilot: 10,
  product_hunt: 10,
  aipick: 5,
} as const;

export const RATING_MIN_REVIEWS: Record<string, number> = {
  app_store: 100,
  play_store: 100,
  g2: 10,
  trustpilot: 20,
  product_hunt: 5,
  aipick: 5,
};

// ==========================================
// 도구 발견 파이프라인 설정
// ==========================================
export const DISCOVERY_CONFIG = {
  /** 품질 게이트: 자동 승인에 필요한 최소 기준 충족 수 */
  MIN_CRITERIA_FOR_APPROVAL: 3,
  /** 발견 cron 실행 주기 */
  DISCOVERY_FREQUENCY: 'daily',
  /** 한 번에 처리할 최대 후보 수 */
  MAX_CANDIDATES_PER_RUN: 50,
  /** 후보 스테이징 최대 보관 기간 (일) */
  CANDIDATE_RETENTION_DAYS: 90,
} as const;

export const BENCHMARK_APPLICABLE_CATEGORIES = [
  'chat', 'writing', 'coding', 'translation',
] as const;

// ==========================================
// 벤치마크 해석 (점수 설명 + 등급 임계값)
// ==========================================
export const BENCHMARK_EXPLANATIONS: Record<string, { description: string; goodThreshold: number; greatThreshold: number; higherIsBetter: boolean }> = {
  mmlu: { description: '대학 수준 지식 테스트 (57개 분야)', goodThreshold: 70, greatThreshold: 85, higherIsBetter: true },
  hellaswag: { description: '상식 추론 능력', goodThreshold: 80, greatThreshold: 93, higherIsBetter: true },
  arc_challenge: { description: '과학 문제 해결력', goodThreshold: 80, greatThreshold: 93, higherIsBetter: true },
  truthfulqa: { description: '사실 기반 정확도', goodThreshold: 50, greatThreshold: 70, higherIsBetter: true },
  winogrande: { description: '문맥 이해 능력', goodThreshold: 80, greatThreshold: 87, higherIsBetter: true },
  gsm8k: { description: '수학 문제 해결력', goodThreshold: 70, greatThreshold: 90, higherIsBetter: true },
  humaneval: { description: '코딩 능력 (Python)', goodThreshold: 60, greatThreshold: 85, higherIsBetter: true },
  overall_score: { description: '종합 성능 점수', goodThreshold: 70, greatThreshold: 85, higherIsBetter: true },
  elo_rating: { description: '사용자 선호도 순위', goodThreshold: 1100, greatThreshold: 1250, higherIsBetter: true },
};

export const SPEED_EXPLANATIONS: Record<string, { description: string; unit: string; goodThreshold: number; greatThreshold: number; higherIsBetter: boolean }> = {
  speed_ttft_ms: { description: '첫 응답 시간', unit: 'ms', goodThreshold: 500, greatThreshold: 300, higherIsBetter: false },
  speed_tps: { description: '생성 속도', unit: 'tok/s', goodThreshold: 50, greatThreshold: 80, higherIsBetter: true },
};

// ==========================================
// FOMO / 소셜 프루프 메시지
// ==========================================
export const SOCIAL_PROOF_MESSAGES = {
  hero_headline: 'AI, 아무거나 쓰고 있죠?\n당신의 PICK은 따로 있습니다',
  hero_sub: '목적별 · 상황별로 AI 서비스를 비교하고 나만의 PICK을 찾아보세요',
  hero_stat: '최신 AI 큐레이션',
  job_cta: '필수 AI 확인하기',
  job_fomo: '당신의 경쟁자는 이미 알고 있습니다',
  edu_headline: '우리 아이, 어떤 AI가 안전할까?',
  edu_cta: '안전한 AI 확인하기',
} as const;

// ==========================================
// AI 서비스 제안 설정
// ==========================================
export const SUGGESTION_CONFIG = {
  MIN_DESCRIPTION_LENGTH: 50,
  MAX_DESCRIPTION_LENGTH: 500,
  MIN_REASON_LENGTH: 20,
  MAX_REASON_LENGTH: 200,
  AUTO_APPROVE_THRESHOLD: 20,  // 20표 이상 시 자동 승인
  DEFAULT_PRICING: 'Freemium' as const,
} as const;

export const SUGGESTION_STATUS_LABELS = {
  pending: '대기중',
  approved: '승인됨',
  rejected: '거부됨',
  merged: '등록완료',
} as const;

export const SUGGESTION_STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  merged: 'bg-blue-100 text-blue-700',
} as const;

// ==========================================
// Daily Picks (매일 자동 선정)
// ==========================================
export const DAILY_PICK_TYPES = {
  trending: { label: '급상승', icon: 'TrendingUp', color: 'bg-red-100 text-red-700' },
  new: { label: '새로 등장', icon: 'Sparkles', color: 'bg-emerald-100 text-emerald-700' },
  hidden_gem: { label: '숨은 명작', icon: 'Gem', color: 'bg-purple-100 text-purple-700' },
  price_drop: { label: '무료 추천', icon: 'Tag', color: 'bg-blue-100 text-blue-700' },
} as const;

export const TRENDING_QUESTIONS_COUNT = 5;

// ==========================================
// Q&A 시스템
// ==========================================
export const QUICK_QUESTION_MAX_LENGTH = 300;
export const QUICK_QUESTION_MIN_LENGTH = 10;

export const QA_SORT_OPTIONS = [
  { value: 'latest', label: '최신순' },
  { value: 'popular', label: '인기순' },
  { value: 'unanswered', label: '미답변' },
] as const;

export const POST_TYPE_FILTERS = [
  { value: 'all', label: '전체' },
  { value: 'question', label: '질문' },
  { value: 'tip', label: '팁' },
  { value: 'discussion', label: '자유글' },
] as const;

// ==========================================
// AI 레시피
// ==========================================
export const RECIPE_CATEGORIES = {
  music: { label: '음악 제작', icon: 'Music', color: 'from-pink-500 to-rose-600' },
  audio: { label: '오디오', icon: 'Headphones', color: 'from-purple-500 to-pink-600' },
  video: { label: '영상 제작', icon: 'Video', color: 'from-red-500 to-orange-600' },
  image: { label: '이미지/캐릭터', icon: 'Image', color: 'from-purple-500 to-pink-600' },
  design: { label: '디자인', icon: 'Palette', color: 'from-pink-500 to-violet-600' },
  writing: { label: '글쓰기', icon: 'PenTool', color: 'from-emerald-500 to-teal-600' },
  blog: { label: '블로그/아티클', icon: 'FileText', color: 'from-emerald-500 to-teal-600' },
  marketing: { label: '마케팅', icon: 'Megaphone', color: 'from-orange-500 to-red-600' },
  presentation: { label: '발표자료', icon: 'Presentation', color: 'from-blue-500 to-indigo-600' },
  social: { label: '숏폼/SNS', icon: 'Smartphone', color: 'from-violet-500 to-purple-600' },
  education: { label: '교육 콘텐츠', icon: 'GraduationCap', color: 'from-cyan-500 to-blue-600' },
  ecommerce: { label: '상품 사진', icon: 'ShoppingBag', color: 'from-amber-500 to-yellow-600' },
  podcast: { label: '팟캐스트', icon: 'Mic', color: 'from-indigo-500 to-purple-600' },
  brand: { label: '브랜드/로고', icon: 'Sparkles', color: 'from-pink-500 to-violet-600' },
  business: { label: '비즈니스', icon: 'Briefcase', color: 'from-blue-600 to-indigo-700' },
  coding: { label: '코딩', icon: 'Code', color: 'from-gray-700 to-slate-800' },
  data: { label: '데이터', icon: 'BarChart', color: 'from-green-600 to-emerald-700' },
  personal: { label: '개인/라이프', icon: 'User', color: 'from-blue-500 to-indigo-600' },
  comic: { label: '만화/웹툰', icon: 'BookOpen', color: 'from-rose-500 to-pink-600' },
  '3d': { label: '3D 모델', icon: 'Box', color: 'from-teal-500 to-cyan-600' },
} as const;

export const RECIPE_DIFFICULTY = {
  easy: { label: '쉬움', color: 'bg-emerald-100 text-emerald-700' },
  medium: { label: '보통', color: 'bg-amber-100 text-amber-700' },
  hard: { label: '어려움', color: 'bg-red-100 text-red-700' },
} as const;

// ==========================================
// 알림 시스템
// ==========================================
export const NOTIFICATION_POLL_INTERVAL_MS = 30_000; // 30초

export const NOTIFICATION_TYPES = {
  answer_received: { label: '새 답변', icon: 'MessageSquare' },
  answer_accepted: { label: '답변 채택', icon: 'Check' },
  like_received: { label: '좋아요', icon: 'ThumbsUp' },
  mention: { label: '멘션', icon: 'AtSign' },
} as const;

// ==========================================
// 도발 시스템
// ==========================================
export const PROVOCATION_SECTION_LABEL = '도발';

export const PROVOCATION_HEADERS = [
  "여러분이 원하는 기능을 추가하세요",
  "사용자가 AIPICK을 수정할 수 있습니다",
  "AIPICK을 엉망으로 만들어 보세요",
  "당신의 아이디어로 AIPICK을 지배하세요",
  "개발자보다 당신이 더 잘 알고 있습니다",
  "이 사이트, 이제 당신 것입니다",
  "불만 있으면 직접 고치세요",
  "독재는 끝났습니다. 민주주의의 시작",
  "개발자는 당신의 노예입니다",
  "마음에 안 들면 뒤집어엎으세요",
  "당신이 CEO입니다",
  "혁명을 일으키세요",
  "이 사이트를 당신 마음대로 바꾸세요",
  "개발자를 부려먹으세요",
  "당신의 명령을 기다립니다",
  "폭군은 사라졌습니다",
  "이제 당신이 결정합니다",
  "망가뜨릴 권리, 고칠 의무",
  "사용자 > 개발자",
  "여기는 무법지대입니다"
] as const;

export const PROVOCATION_CATEGORIES = {
  feature: { label: '기능 추가', icon: 'Plus', color: 'bg-blue-100 text-blue-700' },
  design: { label: '디자인 개선', icon: 'Palette', color: 'bg-purple-100 text-purple-700' },
  bug: { label: '버그 수정', icon: 'Bug', color: 'bg-red-100 text-red-700' },
  performance: { label: '성능 개선', icon: 'Zap', color: 'bg-yellow-100 text-yellow-700' },
  mobile: { label: '모바일 개선', icon: 'Smartphone', color: 'bg-emerald-100 text-emerald-700' },
  other: { label: '기타', icon: 'MoreHorizontal', color: 'bg-gray-100 text-gray-700' },
} as const;

export const PROVOCATION_STATUSES = {
  submitted: { label: '제출됨', color: 'bg-gray-100 text-gray-700' },
  voting: { label: '투표 중', color: 'bg-blue-100 text-blue-700' },
  accepted: { label: '채택됨', color: 'bg-green-100 text-green-700' },
  in_development: { label: '개발 중', color: 'bg-purple-100 text-purple-700' },
  completed: { label: '완료됨', color: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: '거부됨', color: 'bg-red-100 text-red-700' },
} as const;

export const MIN_PROVOCATION_TITLE_LENGTH = 5;
export const MAX_PROVOCATION_TITLE_LENGTH = 100;
export const MIN_PROVOCATION_DESCRIPTION_LENGTH = 10;
export const MAX_PROVOCATION_DESCRIPTION_LENGTH = 2000;
export const MAX_PROVOCATION_IMAGES = 3;
export const VOTING_DURATION_DAYS = 7;
export const MIN_ACCEPTANCE_VOTE_RATIO = 0.6; // 60% 찬성 필요

// ==========================================
// 페르소나 카드 (홈페이지 로테이션)
// ==========================================
export const PERSONA_CARDS = [
  {
    id: 'professional',
    title: '직장인 · 전문가',
    subtitle: '업무 효율 10배 올리기',
    icon: 'Briefcase',
    color: 'from-blue-500 to-indigo-600',
    href: '/category/automation',
    killerSlugs: ['chatgpt', 'claude', 'notion-ai'] as const,
  },
  {
    id: 'creator',
    title: '크리에이터',
    subtitle: '아이디어를 작품으로',
    icon: 'Palette',
    color: 'from-purple-500 to-pink-600',
    href: '/category/design',
    killerSlugs: ['midjourney', 'runway-ml', 'suno-ai'] as const,
  },
  {
    id: 'student',
    title: '학생',
    subtitle: '공부의 게임체인저',
    icon: 'GraduationCap',
    color: 'from-emerald-500 to-teal-600',
    href: '/category/translation',
    killerSlugs: ['perplexity', 'deepl', 'gamma'] as const,
  },
  {
    id: 'developer',
    title: '개발자',
    subtitle: '코딩 속도 5배',
    icon: 'Code',
    color: 'from-orange-500 to-red-600',
    href: '/category/coding',
    killerSlugs: ['cursor', 'github-copilot', 'claude'] as const,
  },
] as const;

// ==========================================
// 사이드바 메뉴 구조 (Reddit 스타일)
// ==========================================
export const SIDEBAR_MENU_SECTIONS = [
  {
    title: 'AI 레시피',
    icon: 'BookOpen',
    href: '/recipes',
    color: 'text-purple-600',
  },
  {
    title: 'AI 찾기',
    icon: 'Target',
    href: '/discover',
    color: 'text-blue-600',
  },
  {
    title: '랭킹',
    icon: 'TrendingUp',
    href: '/rankings',
    color: 'text-orange-600',
  },
  {
    title: '커뮤니티',
    icon: 'MessageCircle',
    href: '/community',
    color: 'text-green-600',
  },
  {
    title: '뉴스',
    icon: 'Newspaper',
    href: '/news',
    color: 'text-cyan-600',
  },
  {
    title: '비교',
    icon: 'GitCompare',
    href: '/compare',
    color: 'text-gray-600',
  },
  {
    title: '도발',
    icon: 'Flame',
    href: '/provocation',
    color: 'text-red-500',
  },
] as const;

export const SIDEBAR_USER_MENU = [
  { label: '북마크', href: '/bookmarks', icon: 'Bookmark' },
  { label: '내 리뷰', href: '/profile?tab=reviews', icon: 'Star' },
  { label: '내 댓글', href: '/profile?tab=comments', icon: 'MessageSquare' },
  { label: '내 컬렉션', href: '/collections', icon: 'FolderOpen' },
] as const;

// ==========================================
// 상단 탭 메뉴 (메인 피드 필터)
// ==========================================
export const FEED_TABS = [
  { id: 'today', label: '오늘의 PICK', icon: 'Calendar' },
  { id: 'trending', label: '급상승', icon: 'TrendingUp' },
  { id: 'personalized', label: '당신에게 맞는 AI', icon: 'Target' },
] as const;
