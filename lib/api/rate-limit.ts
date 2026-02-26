/**
 * In-memory rate limiter (서버 재시작 시 초기화됨)
 * execute / execute-image 공유 사용으로 키 공간 통일
 */
const rateLimitMap = new Map<string, { count: number; reset: number }>();

/**
 * @returns true → 허용, false → 차단
 */
export function checkRateLimit(key: string, max: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || entry.reset < now) {
    rateLimitMap.set(key, { count: 1, reset: now + 60_000 });
    return true;
  }
  if (entry.count >= max) return false;
  entry.count++;
  return true;
}
