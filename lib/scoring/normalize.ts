/**
 * 값을 0-100 범위로 정규화합니다.
 * maxValue가 0이면 0을 반환합니다.
 */
export function normalizeToScale(value: number, maxValue: number): number {
  if (maxValue <= 0) return 0;
  return Math.min((value / maxValue) * 100, 100);
}

/**
 * 가격을 역정규화합니다 (낮을수록 높은 점수).
 * maxPrice가 0이면 100을 반환합니다 (무료 = 최고점).
 */
export function normalizePriceInverse(price: number, maxPrice: number): number {
  if (maxPrice <= 0) return 100;
  if (price <= 0) return 100;
  return Math.max((1 - price / maxPrice) * 100, 0);
}

/**
 * 점수를 소수점 2자리로 반올림합니다.
 */
export function roundScore(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * 0~100 범위로 클램프합니다.
 */
export function clampScore(value: number): number {
  return Math.max(0, Math.min(100, value));
}
