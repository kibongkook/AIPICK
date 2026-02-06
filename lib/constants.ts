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
// 페이지네이션 / UI
// ==========================================
export const ITEMS_PER_PAGE = 12;
export const EDITOR_PICKS_COUNT = 6;
export const CATEGORY_PREVIEW_COUNT = 4;
export const SIMILAR_TOOLS_COUNT = 3;

// ==========================================
// 리뷰 설정
// ==========================================
export const MIN_REVIEW_LENGTH = 10;
export const MAX_REVIEW_LENGTH = 500;
export const RATING_MIN = 1;
export const RATING_MAX = 5;
