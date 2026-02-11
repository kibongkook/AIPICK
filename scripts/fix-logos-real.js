/**
 * 실제 작동하는 로고 URL로 교체
 * 각 서비스별로 테스트 완료된 URL만 사용
 */

const fs = require('fs');
const path = require('path');

const SEED_PATH = path.join(__dirname, '../data/seed.json');
const OUTPUT_PATH = path.join(__dirname, '../data/seed.json');

// 테스트 완료된 실제 작동하는 로고 URL들
const WORKING_LOGOS = {
  // SimpleIcons CDN (테스트 완료)
  'claude': 'https://cdn.simpleicons.org/anthropic',
  'elevenlabs': 'https://cdn.simpleicons.org/elevenlabs',
  'github-copilot': 'https://cdn.simpleicons.org/github',
  'gemini': 'https://cdn.simpleicons.org/google',
  'notion-ai': 'https://cdn.simpleicons.org/notion',
  'figma': 'https://cdn.simpleicons.org/figma',
  'grammarly': 'https://cdn.simpleicons.org/grammarly',
  'deepl': 'https://cdn.simpleicons.org/deepl',
  'perplexity': 'https://cdn.simpleicons.org/perplexity',
  'huggingchat': 'https://cdn.simpleicons.org/huggingface',
  'replit': 'https://cdn.simpleicons.org/replit',
  'cursor': 'https://cdn.simpleicons.org/cursor',
  'vercel': 'https://cdn.simpleicons.org/vercel',
  'supabase': 'https://cdn.simpleicons.org/supabase',
  'firebase': 'https://cdn.simpleicons.org/firebase',
  'airtable': 'https://cdn.simpleicons.org/airtable',
  'zapier': 'https://cdn.simpleicons.org/zapier',
  'slack': 'https://cdn.simpleicons.org/slack',
  'discord': 'https://cdn.simpleicons.org/discord',
  'zoom': 'https://cdn.simpleicons.org/zoom',
  'linear': 'https://cdn.simpleicons.org/linear',
  'whimsical-ai': 'https://cdn.simpleicons.org/whimsical',
  'coda-ai': 'https://cdn.simpleicons.org/coda',
  'typeform': 'https://cdn.simpleicons.org/typeform',

  // Logo.dev CDN (무료 tier - 100개월 제한)
  'chatgpt': 'https://img.logo.dev/openai.com?token=pk_X-HrM-xkQ5K2LkKkR5w_3Q',
  'dall-e-3': 'https://img.logo.dev/openai.com?token=pk_X-HrM-xkQ5K2LkKkR5w_3Q',
  'sora': 'https://img.logo.dev/openai.com?token=pk_X-HrM-xkQ5K2LkKkR5w_3Q',
  'midjourney': 'https://img.logo.dev/midjourney.com?token=pk_X-HrM-xkQ5K2LkKkR5w_3Q',
  'canva-ai': 'https://img.logo.dev/canva.com?token=pk_X-HrM-xkQ5K2LkKkR5w_3Q',
  'runway-ml': 'https://img.logo.dev/runwayml.com?token=pk_X-HrM-xkQ5K2LkKkR5w_3Q',
  'stable-diffusion': 'https://img.logo.dev/stability.ai?token=pk_X-HrM-xkQ5K2LkKkR5w_3Q',
  'adobe-firefly': 'https://img.logo.dev/adobe.com?token=pk_X-HrM-xkQ5K2LkKkR5w_3Q',
  'leonardo-ai': 'https://img.logo.dev/leonardo.ai?token=pk_X-HrM-xkQ5K2LkKkR5w_3Q',
  'ideogram': 'https://img.logo.dev/ideogram.ai?token=pk_X-HrM-xkQ5K2LkKkR5w_3Q',
  'flux': 'https://img.logo.dev/flux1.ai?token=pk_X-HrM-xkQ5K2LkKkR5w_3Q',
  'pika': 'https://img.logo.dev/pika.art?token=pk_X-HrM-xkQ5K2LkKkR5w_3Q',
  'luma-dream-machine': 'https://img.logo.dev/lumalabs.ai?token=pk_X-HrM-xkQ5K2LkKkR5w_3Q',
  'kling-ai': 'https://img.logo.dev/klingai.com?token=pk_X-HrM-xkQ5K2LkKkR5w_3Q',
  'synthesia': 'https://img.logo.dev/synthesia.io?token=pk_X-HrM-xkQ5K2LkKkR5w_3Q',
  'd-id': 'https://img.logo.dev/d-id.com?token=pk_X-HrM-xkQ5K2LkKkR5w_3Q',
  'capcut': 'https://img.logo.dev/capcut.com?token=pk_X-HrM-xkQ5K2LkKkR5w_3Q',
  'descript': 'https://img.logo.dev/descript.com?token=pk_X-HrM-xkQ5K2LkKkR5w_3Q',
  'opus-clip': 'https://img.logo.dev/opus.pro?token=pk_X-HrM-xkQ5K2LkKkR5w_3Q',
  'vrew': 'https://img.logo.dev/vrew.voyagerx.com?token=pk_X-HrM-xkQ5K2LkKkR5w_3Q',
  'suno-ai': 'https://img.logo.dev/suno.ai?token=pk_X-HrM-xkQ5K2LkKkR5w_3Q',
  'udio': 'https://img.logo.dev/udio.com?token=pk_X-HrM-xkQ5K2LkKkR5w_3Q',

  // 기타 서비스 (Google Favicon API 폴백)
  'wrtn': 'https://www.google.com/s2/favicons?domain=wrtn.ai&sz=128',
  'poe': 'https://www.google.com/s2/favicons?domain=poe.com&sz=128',
  'you-com': 'https://www.google.com/s2/favicons?domain=you.com&sz=128',
  'coze': 'https://www.google.com/s2/favicons?domain=coze.com&sz=128',
  'kimi': 'https://www.google.com/s2/favicons?domain=kimi.moonshot.cn&sz=128',
  'microsoft-copilot': 'https://www.google.com/s2/favicons?domain=copilot.microsoft.com&sz=128',
  'grok': 'https://www.google.com/s2/favicons?domain=x.com&sz=128',
};

function main() {
  console.log('🔧 실제 작동하는 로고 URL로 교체\n');

  const data = JSON.parse(fs.readFileSync(SEED_PATH, 'utf-8'));
  let fixed = 0;
  let notFound = [];

  data.tools.forEach(tool => {
    if (WORKING_LOGOS[tool.slug]) {
      const oldUrl = tool.logo_url;
      tool.logo_url = WORKING_LOGOS[tool.slug];
      if (oldUrl !== tool.logo_url) {
        console.log(`✅ ${tool.name} (${tool.slug})`);
        console.log(`   OLD: ${oldUrl.substring(0, 60)}...`);
        console.log(`   NEW: ${tool.logo_url}`);
        fixed++;
      }
    } else {
      // 매핑에 없는 경우 Google Favicon으로 폴백
      const domain = extractDomain(tool.url);
      if (domain) {
        const oldUrl = tool.logo_url;
        tool.logo_url = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
        if (oldUrl !== tool.logo_url) {
          console.log(`⚠️  ${tool.name} (${tool.slug}) - Google Favicon 폴백`);
          fixed++;
        }
        notFound.push(tool.slug);
      }
    }
  });

  console.log(`\n📊 결과:`);
  console.log(`   수정됨: ${fixed}`);
  console.log(`   Google Favicon 폴백: ${notFound.length}`);

  if (notFound.length > 0) {
    console.log(`\n매핑 없는 도구들 (Google Favicon 사용):`);
    notFound.forEach(slug => console.log(`   - ${slug}`));
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`\n💾 저장: ${OUTPUT_PATH}`);
}

function extractDomain(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

main();
