import { type ClassValue, clsx } from 'clsx';

/**
 * Tailwind 클래스 병합 유틸리티
 * clsx로 조건부 클래스를 처리하고 중복을 제거
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * 서비스명 첫 글자로 아바타 배경색 생성
 */
export function getAvatarColor(name: string): string {
  const colors = [
    'bg-blue-500', 'bg-emerald-500', 'bg-purple-500',
    'bg-orange-500', 'bg-pink-500', 'bg-cyan-500',
    'bg-indigo-500', 'bg-teal-500',
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

/**
 * 평점을 소수점 1자리로 포맷
 */
export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

/**
 * 방문 수를 축약 표기 (1.2K, 3.4M 등)
 */
export function formatVisitCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}
