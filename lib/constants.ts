import type { PricingType } from '@/types';

// ==========================================
// 사이트 메타 정보
// ==========================================
export const SITE_NAME = 'AIPICK';
export const SITE_DESCRIPTION = '당신과 같은 전문가들이 매일 확인하는 AI 큐레이션. 직군별 필수 AI와 무료 사용량을 한눈에.';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aipick.kr';

// ==========================================
// 카테고리 정의
// ==========================================
export const CATEGORIES = [
  { name: '만능 AI', slug: 'general-ai', icon: 'Wand2' },
  { name: '텍스트 생성', slug: 'text-generation', icon: 'PenTool' },
  { name: '이미지 생성', slug: 'image-generation', icon: 'Image' },
  { name: '영상 편집', slug: 'video-editing', icon: 'Video' },
  { name: '코딩 도구', slug: 'coding-tools', icon: 'Code' },
  { name: '음악 생성', slug: 'music-generation', icon: 'Music' },
  { name: '데이터 분석', slug: 'data-analysis', icon: 'BarChart3' },
  { name: '번역', slug: 'translation', icon: 'Languages' },
  { name: '기타', slug: 'others', icon: 'Sparkles' },
] as const;

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
// 히어로 퀵 버튼 (메인 페이지)
// ==========================================
export const HERO_QUICK_BUTTONS = [
  { label: '글쓰기', icon: 'PenTool', slug: 'text-generation' },
  { label: '이미지 생성', icon: 'Image', slug: 'image-generation' },
  { label: '영상 편집', icon: 'Video', slug: 'video-editing' },
  { label: '코딩', icon: 'Code', slug: 'coding-tools' },
  { label: '번역', icon: 'Languages', slug: 'translation' },
  { label: '데이터 분석', icon: 'BarChart3', slug: 'data-analysis' },
] as const;

// ==========================================
// 직군별 추천 설정
// ==========================================
export const JOB_CATEGORIES = [
  { name: 'AI 개발자', slug: 'ai-developer', icon: 'Code' },
  { name: 'UI/UX 디자이너', slug: 'uiux-designer', icon: 'Layout' },
  { name: '그래픽 디자이너', slug: 'graphic-designer', icon: 'Palette' },
  { name: '마케터', slug: 'marketer', icon: 'Megaphone' },
  { name: '영상 크리에이터', slug: 'video-creator', icon: 'Video' },
  { name: '작가/블로거', slug: 'writer', icon: 'PenTool' },
  { name: '데이터 분석가', slug: 'data-analyst', icon: 'BarChart3' },
  { name: '사업가/창업자', slug: 'entrepreneur', icon: 'Briefcase' },
  { name: '음악가/작곡가', slug: 'musician', icon: 'Music' },
  { name: 'PM/기획자', slug: 'product-manager', icon: 'Target' },
] as const;

// 메인 페이지에 강조할 상위 직업군 (AI 사용 빈도 기준)
export const FEATURED_JOB_SLUGS = ['marketer', 'ai-developer', 'video-creator'] as const;

// ==========================================
// 교육 단계 설정 (확장: 부모/학원강사/코딩강사 추가)
// ==========================================
export const EDU_LEVELS = [
  { name: '초등 저학년', slug: 'elementary-low', ageRange: '7-9세', icon: 'Baby' },
  { name: '초등 고학년', slug: 'elementary-high', ageRange: '10-12세', icon: 'Smile' },
  { name: '중학생', slug: 'middle-school', ageRange: '13-15세', icon: 'BookOpen' },
  { name: '고등학생', slug: 'high-school', ageRange: '16-18세', icon: 'GraduationCap' },
  { name: '대학생', slug: 'college', ageRange: '19세+', icon: 'School' },
  { name: '교사/교수', slug: 'teacher', ageRange: null, icon: 'Users' },
  { name: '학부모', slug: 'parent', ageRange: null, icon: 'Heart' },
  { name: '학원 강사', slug: 'academy-tutor', ageRange: null, icon: 'BookMarked' },
  { name: '코딩 강사', slug: 'coding-tutor', ageRange: null, icon: 'Terminal' },
] as const;

// 메인에 보여줄 교육 카테고리
export const FEATURED_EDU_SLUGS = ['middle-school', 'high-school', 'college', 'teacher'] as const;

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

// ==========================================
// 페이지네이션 / UI
// ==========================================
export const ITEMS_PER_PAGE = 12;
export const EDITOR_PICKS_COUNT = 6;
export const CATEGORY_PREVIEW_COUNT = 4;
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
  rating: { label: '평가', icon: 'Star', color: 'bg-yellow-100 text-yellow-700' },
  discussion: { label: '자유글', icon: 'MessageSquare', color: 'bg-blue-100 text-blue-700' },
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
// 기능별 평가 기준
// ==========================================
export const FEATURE_RATING_LABELS = {
  ease_of_use: '사용 편의성',
  korean_support: '한국어 지원',
  free_quota: '무료 사용량',
  feature_variety: '기능 다양성',
  value_for_money: '가성비',
} as const;

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
} as const;

// ==========================================
// FOMO / 소셜 프루프 메시지
// ==========================================
export const SOCIAL_PROOF_MESSAGES = {
  hero_headline: '모두가 쓰는 AI,\n당신만 모르고 있었습니다',
  hero_sub: '매주 12,847명이 확인하는 AI 큐레이션',
  hero_stat: '지금 342명 탐색 중',
  job_cta: '필수 AI 확인하기',
  job_fomo: '당신의 경쟁자는 이미 알고 있습니다',
  edu_headline: '우리 아이, 어떤 AI가 안전할까?',
  edu_cta: '안전한 AI 확인하기',
} as const;
