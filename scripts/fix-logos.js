/**
 * Logo Audit and Fix Script
 *
 * 문제:
 * - Clearbit Logo API는 많은 도메인에서 로고를 제공하지 않음
 * - 일부 직접 링크는 깨져있을 수 있음
 *
 * 해결:
 * - Dashboard Icons CDN 우선 사용 (알려진 서비스)
 * - Clearbit → DuckDuckGo Favicon으로 전환
 * - Google Favicon API 활용
 */

const fs = require('fs');
const path = require('path');

const SEED_PATH = path.join(__dirname, '../data/seed.json');
const OUTPUT_PATH = path.join(__dirname, '../data/seed-fixed-logos.json');

// Dashboard Icons CDN 매핑 (logo-resolver.ts와 동일)
const DASHBOARD_ICONS_MAP = {
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
  // 한국 서비스 추가
  'wrtn': 'wrtn',
  'vrew': 'vrew',
  '뤼튼': 'wrtn',
};

const DASHBOARD_ICONS_CDN = 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png';

// Dashboard Icons 매핑 찾기
function findDashboardIcon(name) {
  const lower = name.toLowerCase().trim();

  // 정확한 매칭
  if (DASHBOARD_ICONS_MAP[lower]) {
    return DASHBOARD_ICONS_MAP[lower];
  }

  // 부분 매칭
  for (const [key, icon] of Object.entries(DASHBOARD_ICONS_MAP)) {
    if (lower.includes(key) || key.includes(lower)) {
      return icon;
    }
  }

  return null;
}

// URL에서 도메인 추출
function extractDomain(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

// 최적의 로고 URL 반환
function resolveLogoUrl(name, url) {
  // 1. Dashboard Icons CDN
  const dashboardIcon = findDashboardIcon(name);
  if (dashboardIcon) {
    return `${DASHBOARD_ICONS_CDN}/${dashboardIcon}.png`;
  }

  // 2. DuckDuckGo Favicon (Clearbit보다 안정적)
  const domain = extractDomain(url);
  if (domain) {
    return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
  }

  // 3. Google Favicon (fallback)
  if (domain) {
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  }

  return '';
}

// 메인 실행
function main() {
  console.log('🔍 Logo Audit and Fix Script\n');

  // 1. seed.json 읽기
  const data = JSON.parse(fs.readFileSync(SEED_PATH, 'utf-8'));

  const stats = {
    total: data.tools.length,
    clearbit: 0,
    google: 0,
    direct: 0,
    missing: 0,
    fixed: 0,
  };

  const report = [];

  // 2. 각 도구 분석 및 수정
  data.tools.forEach((tool) => {
    const oldLogo = tool.logo_url || '';
    let newLogo = oldLogo;
    let status = 'OK';
    let reason = '';

    // 현재 로고 타입 분류
    if (!oldLogo) {
      stats.missing++;
      status = 'MISSING';
      reason = 'No logo URL';
    } else if (oldLogo.includes('logo.clearbit.com')) {
      stats.clearbit++;
      status = 'FIX';
      reason = 'Clearbit API (unreliable)';
    } else if (oldLogo.includes('google.com/s2/favicons')) {
      stats.google++;
      status = 'UPGRADE';
      reason = 'Google Favicon (can be improved)';
    } else {
      stats.direct++;
      status = 'KEEP';
      reason = 'Direct URL';
    }

    // 수정이 필요한 경우
    if (status === 'FIX' || status === 'MISSING' || status === 'UPGRADE') {
      newLogo = resolveLogoUrl(tool.name, tool.url);
      if (newLogo && newLogo !== oldLogo) {
        tool.logo_url = newLogo;
        stats.fixed++;
        status = 'FIXED';
      }
    }

    report.push({
      name: tool.name,
      slug: tool.slug,
      status,
      reason,
      oldLogo: oldLogo || 'NONE',
      newLogo: newLogo || 'NONE',
      changed: newLogo !== oldLogo,
    });
  });

  // 3. 통계 출력
  console.log('📊 Statistics:');
  console.log(`   Total tools: ${stats.total}`);
  console.log(`   Using Clearbit: ${stats.clearbit} (unreliable)`);
  console.log(`   Using Google Favicon: ${stats.google}`);
  console.log(`   Using Direct URLs: ${stats.direct}`);
  console.log(`   Missing logos: ${stats.missing}`);
  console.log(`   Fixed: ${stats.fixed}\n`);

  // 4. 수정된 도구 목록
  const fixed = report.filter(r => r.changed);
  if (fixed.length > 0) {
    console.log('✅ Fixed logos:');
    fixed.forEach((r, i) => {
      console.log(`   ${i + 1}. ${r.name} (${r.slug})`);
      console.log(`      OLD: ${r.oldLogo.slice(0, 60)}...`);
      console.log(`      NEW: ${r.newLogo.slice(0, 60)}...`);
    });
    console.log('');
  }

  // 5. 문제가 있는 도구 목록 (여전히 로고 없음)
  const stillBroken = report.filter(r => !r.newLogo || r.newLogo === 'NONE');
  if (stillBroken.length > 0) {
    console.log('⚠️  Still missing logos:');
    stillBroken.forEach((r, i) => {
      console.log(`   ${i + 1}. ${r.name} (${r.slug})`);
    });
    console.log('');
  }

  // 6. 수정된 seed.json 저장
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`💾 Saved fixed seed to: ${OUTPUT_PATH}`);

  // 7. 전체 리포트 저장
  const reportPath = path.join(__dirname, '../data/logo-audit-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`📄 Saved full report to: ${reportPath}`);

  console.log('\n✨ Done! Review the changes and replace seed.json if satisfied.');
}

main();
