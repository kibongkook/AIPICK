// ==========================================
// 인기 비교 쌍 정의
// SEO용 사전 생성 + 홈페이지/상세 페이지 링크
// ==========================================

export const POPULAR_PAIRS: [string, string][] = [
  // 만능 AI
  ['chatgpt', 'claude'],
  ['chatgpt', 'gemini'],
  ['claude', 'gemini'],
  ['chatgpt', 'perplexity'],
  ['claude', 'grok'],

  // 이미지 생성
  ['midjourney', 'dall-e-3'],
  ['midjourney', 'stable-diffusion'],
  ['dall-e-3', 'leonardo-ai'],
  ['midjourney', 'ideogram'],
  ['adobe-firefly', 'dall-e-3'],

  // 코딩 도구
  ['cursor', 'github-copilot'],
  ['cursor', 'windsurf'],
  ['github-copilot', 'claude-code'],
  ['v0', 'bolt-new'],
  ['replit', 'cursor'],

  // 영상 편집
  ['runway-ml', 'sora'],
  ['runway-ml', 'pika'],
  ['capcut', 'descript'],
  ['sora', 'kling-ai'],

  // 텍스트 생성
  ['jasper', 'copy-ai'],
  ['grammarly', 'wordtune'],
  ['writesonic', 'rytr'],

  // 번역
  ['deepl', 'google-translate'],
  ['deepl', 'papago'],
  ['google-translate', 'papago'],

  // 음악 생성
  ['suno-ai', 'udio'],

  // 데이터 분석
  ['tableau', 'power-bi'],
  ['julius-ai', 'hex'],
];

/** 비교 페이지 URL 생성 */
export function getCompareUrl(slug1: string, slug2: string): string {
  const sorted = [slug1, slug2].sort();
  return `/compare/${sorted[0]}/${sorted[1]}`;
}

/** 도구의 인기 비교 대상 찾기 */
export function getPopularCompareTargets(slug: string): string[] {
  const targets: string[] = [];
  for (const [a, b] of POPULAR_PAIRS) {
    if (a === slug) targets.push(b);
    else if (b === slug) targets.push(a);
  }
  return targets;
}
