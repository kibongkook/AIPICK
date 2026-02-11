// ==========================================
// 로고 해결 유틸리티
// Google Favicon 의존 제거, 우선순위 기반 로고 URL 반환
// ==========================================

/**
 * Dashboard Icons CDN에서 제공하는 알려진 서비스 목록
 * key: 서비스명(소문자), value: dashboard-icons 파일명
 */
const DASHBOARD_ICONS_MAP: Record<string, string> = {
  'chatgpt': 'chatgpt',
  'openai': 'openai',
  'claude': 'claude',
  'anthropic': 'anthropic',
  'gemini': 'google-gemini',
  'google gemini': 'google-gemini',
  'github copilot': 'github',
  'copilot': 'microsoft',
  'microsoft copilot': 'microsoft',
  'midjourney': 'midjourney',
  'perplexity': 'perplexity',
  'notion': 'notion',
  'notion ai': 'notion',
  'slack': 'slack',
  'discord': 'discord',
  'figma': 'figma',
  'canva': 'canva',
  'grammarly': 'grammarly',
  'deepl': 'deepl',
  'github': 'github',
  'hugging face': 'huggingface',
  'huggingface': 'huggingface',
  'stability ai': 'stability-ai',
  'stable diffusion': 'stability-ai',
  'cursor': 'cursor',
  'vercel': 'vercel',
  'supabase': 'supabase',
  'firebase': 'firebase',
  'adobe': 'adobe',
  'adobe firefly': 'adobe',
  'jasper': 'jasper',
  'replit': 'replit',
  'suno': 'suno',
  'elevenlabs': 'elevenlabs',
  'runway': 'runway',
  'pika': 'pika',
  'otter.ai': 'otter-ai',
  'zoom': 'zoom',
  'whimsical': 'whimsical',
  'linear': 'linear',
  'coda': 'coda',
  'airtable': 'airtable',
  'zapier': 'zapier',
  'make': 'make',
  'n8n': 'n8n',
};

const DASHBOARD_ICONS_CDN = 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png';

/**
 * 도구 이름과 URL을 기반으로 최적의 로고 URL을 반환합니다.
 *
 * 우선순위:
 * 1. Dashboard Icons CDN (알려진 서비스)
 * 2. Clearbit Logo API (도메인 기반)
 * 3. DuckDuckGo Favicon (안정적 fallback)
 *
 * 런타임 HTTP 검증은 하지 않음 (빌드 시 정적으로 사용)
 */
export function resolveLogoUrl(name: string, url: string): string {
  // 1. Dashboard Icons CDN 매핑 확인
  const dashboardIcon = findDashboardIcon(name);
  if (dashboardIcon) {
    return `${DASHBOARD_ICONS_CDN}/${dashboardIcon}.png`;
  }

  // 2. Clearbit Logo API (도메인 기반)
  const domain = extractDomain(url);
  if (domain) {
    return `https://logo.clearbit.com/${domain}`;
  }

  // 3. DuckDuckGo Favicon fallback
  if (domain) {
    return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
  }

  // 최종 fallback: null (컴포넌트에서 이니셜 아바타 사용)
  return '';
}

/**
 * seed.json의 Google Favicon URL을 개선된 로고 URL로 교체합니다.
 * Google Favicon URL 패턴: google.com/s2/favicons?domain=xxx&sz=128
 */
export function upgradeGoogleFaviconUrl(
  currentLogoUrl: string,
  toolName: string,
  toolUrl: string
): string {
  // Google Favicon이 아닌 경우 그대로 유지
  if (!currentLogoUrl.includes('google.com/s2/favicons')) {
    return currentLogoUrl;
  }

  // 새 로고 URL 반환
  return resolveLogoUrl(toolName, toolUrl);
}

/**
 * Dashboard Icons 매핑에서 서비스를 찾습니다.
 */
function findDashboardIcon(name: string): string | null {
  const lower = name.toLowerCase().trim();

  // 정확한 매칭
  if (DASHBOARD_ICONS_MAP[lower]) {
    return DASHBOARD_ICONS_MAP[lower];
  }

  // 부분 매칭 (이름에 키워드 포함)
  for (const [key, icon] of Object.entries(DASHBOARD_ICONS_MAP)) {
    if (lower.includes(key) || key.includes(lower)) {
      return icon;
    }
  }

  return null;
}

/**
 * URL에서 도메인을 추출합니다.
 */
function extractDomain(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}
