import type { PricingType } from '@/types';

// ==========================================
// 사이트 메타 정보
// ==========================================
export const SITE_NAME = 'AIPICK';
export const SITE_DESCRIPTION = '나에게 맞는 AI를 찾아보세요. 목적별 AI 추천과 무료 사용량 정보를 한눈에.';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aipick.kr';

// ==========================================
// 카테고리 정의
// ==========================================
export const CATEGORIES = [
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

// ==========================================
// 교육 단계 설정
// ==========================================
export const EDU_LEVELS = [
  { name: '초등 저학년', slug: 'elementary-low', ageRange: '7-9세', icon: 'Baby' },
  { name: '초등 고학년', slug: 'elementary-high', ageRange: '10-12세', icon: 'Smile' },
  { name: '중학생', slug: 'middle-school', ageRange: '13-15세', icon: 'BookOpen' },
  { name: '고등학생', slug: 'high-school', ageRange: '16-18세', icon: 'GraduationCap' },
  { name: '대학생', slug: 'college', ageRange: '19세+', icon: 'School' },
  { name: '교사/교수', slug: 'teacher', ageRange: null, icon: 'Users' },
] as const;

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
// 리뷰 설정
// ==========================================
export const MIN_REVIEW_LENGTH = 10;
export const MAX_REVIEW_LENGTH = 500;
export const RATING_MIN = 1;
export const RATING_MAX = 5;

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
