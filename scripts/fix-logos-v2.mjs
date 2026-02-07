/**
 * fix-logos-v2.mjs
 * Tier 1: 핵심 30개 도구 — 고품질 로고 URL (공식 CDN/브랜드 이미지)
 * Tier 2: 나머지 89개 도구 — Google Favicon V2 (128x128)
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const seedPath = resolve(__dirname, '../data/seed.json');

// ── Tier 1: 수동 큐레이션 고품질 로고 ──
// 공식 브랜드 아이콘 또는 고품질 CDN 소스
const CURATED_LOGOS = {
  // General AI
  'chatgpt': 'https://cdn.oaistatic.com/assets/apple-touch-icon-mz9nytnj.webp',
  'claude': 'https://claude.ai/images/claude_app_icon.png',
  'gemini': 'https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690b6.svg',
  'perplexity': 'https://assets.perplexity.ai/pplx-default-preview.png',
  'microsoft-copilot': 'https://copilot.microsoft.com/rp/hT2UKcAlBfMR5VjLGfNLuHJf3ag.png',
  'grok': 'https://x.ai/favicon.ico',

  // Image Generation
  'midjourney': 'https://cdn.midjourney.com/website/fav/apple-touch-icon.png',
  'dall-e-3': 'https://cdn.oaistatic.com/assets/apple-touch-icon-mz9nytnj.webp',
  'stable-diffusion': 'https://stability.ai/favicon.ico',
  'adobe-firefly': 'https://firefly.adobe.com/favicon.ico',

  // Video
  'runway-ml': 'https://runwayml.com/favicon.ico',
  'sora': 'https://sora.com/favicon.ico',
  'pika': 'https://pika.art/favicon.ico',
  'capcut': 'https://lf16-web-buz.capcut.com/obj/capcut-web-buz-us/common/images/capcut-favicon.ico',
  'heygen': 'https://www.heygen.com/favicon.ico',

  // Coding
  'github-copilot': 'https://github.githubassets.com/favicons/favicon.svg',
  'cursor': 'https://www.cursor.com/favicon.ico',
  'replit': 'https://replit.com/public/icons/favicon-196.png',
  'v0': 'https://v0.dev/favicon.ico',
  'bolt-new': 'https://bolt.new/favicon.ico',

  // Text
  'notion-ai': 'https://www.notion.so/images/favicon.ico',
  'jasper': 'https://www.jasper.ai/favicon.ico',
  'grammarly': 'https://static.grammarly.com/assets/files/efe57d016d9efff36da7884c193b646b/favicon-32x32.png',

  // Music
  'suno-ai': 'https://suno.com/favicon.ico',
  'udio': 'https://www.udio.com/favicon.ico',

  // Translation
  'deepl': 'https://static.deepl.com/img/favicon/favicon_96.png',
  'papago': 'https://papago.naver.com/favicon.ico',

  // Data/Presentation
  'gamma': 'https://gamma.app/favicon.ico',
  'tableau': 'https://www.tableau.com/favicon.ico',
  'canva-ai': 'https://static.canva.com/static/images/favicon-1.ico',
};

// ── 전체 도메인 맵 (기존 fix-logos.mjs에서 가져옴) ──
const DOMAIN_MAP = {
  'chatgpt': 'chatgpt.com',
  'claude': 'claude.ai',
  'gemini': 'gemini.google.com',
  'perplexity': 'perplexity.ai',
  'wrtn': 'wrtn.ai',
  'microsoft-copilot': 'copilot.microsoft.com',
  'grok': 'x.ai',
  'poe': 'poe.com',
  'huggingchat': 'huggingface.co',
  'you-com': 'you.com',
  'coze': 'coze.com',
  'dwijibgi': 'dwijibgi.ai',
  'kimi': 'kimi.ai',
  'notion-ai': 'notion.so',
  'jasper': 'jasper.ai',
  'copy-ai': 'copy.ai',
  'writesonic': 'writesonic.com',
  'grammarly': 'grammarly.com',
  'quillbot': 'quillbot.com',
  'character-ai': 'character.ai',
  'otter-ai': 'otter.ai',
  'fireflies-ai': 'fireflies.ai',
  'tldv': 'tldv.io',
  'clova-note': 'clovanote.naver.com',
  'rytr': 'rytr.me',
  'wordtune': 'wordtune.com',
  'sudowrite': 'sudowrite.com',
  'typecast': 'typecast.ai',
  'midjourney': 'midjourney.com',
  'dall-e-3': 'openai.com',
  'stable-diffusion': 'stability.ai',
  'leonardo-ai': 'leonardo.ai',
  'ideogram': 'ideogram.ai',
  'adobe-firefly': 'firefly.adobe.com',
  'krea-ai': 'krea.ai',
  'playground-ai': 'playground.com',
  'bing-image-creator': 'bing.com',
  'flux': 'flux1.ai',
  'remove-bg': 'remove.bg',
  'photoroom': 'photoroom.com',
  'clipdrop': 'clipdrop.co',
  'runway-ml': 'runwayml.com',
  'capcut': 'capcut.com',
  'vrew': 'vrew.voyagerx.com',
  'pika': 'pika.art',
  'sora': 'sora.com',
  'luma-dream-machine': 'lumalabs.ai',
  'kling-ai': 'klingai.com',
  'heygen': 'heygen.com',
  'synthesia': 'synthesia.io',
  'd-id': 'd-id.com',
  'descript': 'descript.com',
  'opus-clip': 'opus.pro',
  'elevenlabs': 'elevenlabs.io',
  'fliki': 'fliki.ai',
  'invideo-ai': 'invideo.io',
  'topaz-video-ai': 'topazlabs.com',
  'github-copilot': 'github.com',
  'cursor': 'cursor.com',
  'replit': 'replit.com',
  'tabnine': 'tabnine.com',
  'windsurf': 'windsurf.com',
  'amazon-q-developer': 'aws.amazon.com',
  'bolt-new': 'bolt.new',
  'v0': 'v0.dev',
  'lovable': 'lovable.dev',
  'continue': 'continue.dev',
  'pieces': 'pieces.app',
  'cody': 'sourcegraph.com',
  'blackbox-ai': 'blackbox.ai',
  'devin': 'devin.ai',
  'claude-code': 'claude.ai',
  'suno-ai': 'suno.com',
  'udio': 'udio.com',
  'aiva': 'aiva.ai',
  'mubert': 'mubert.com',
  'soundraw': 'soundraw.io',
  'boomy': 'boomy.com',
  'soundful': 'soundful.com',
  'beatoven-ai': 'beatoven.ai',
  'loudly': 'loudly.com',
  'julius-ai': 'julius.ai',
  'gamma': 'gamma.app',
  'tableau': 'tableau.com',
  'google-notebooklm': 'notebooklm.google.com',
  'obviously-ai': 'obviously.ai',
  'rows-ai': 'rows.com',
  'beautiful-ai': 'beautiful.ai',
  'slidesai': 'slidesai.io',
  'tome': 'tome.app',
  'prezi-ai': 'prezi.com',
  'monkeylearn': 'monkeylearn.com',
  'power-bi': 'powerbi.microsoft.com',
  'hex': 'hex.tech',
  'deepl': 'deepl.com',
  'papago': 'papago.naver.com',
  'google-translate': 'translate.google.com',
  'deepl-write': 'deepl.com',
  'flitto': 'flitto.com',
  'smartcat': 'smartcat.com',
  'lingva-translate': 'lingva.ml',
  'itranslate': 'itranslate.com',
  'canva-ai': 'canva.com',
  'zapier-ai': 'zapier.com',
  'make': 'make.com',
  'loom-ai': 'loom.com',
  'miro-ai': 'miro.com',
  'tally': 'tally.so',
  'typeform': 'typeform.com',
  'scribe': 'scribehow.com',
  'reclaim-ai': 'reclaim.ai',
  'superhuman': 'superhuman.com',
  'lex': 'lex.page',
  'perplexity-pages': 'perplexity.ai',
  'coda-ai': 'coda.io',
  'mem-ai': 'mem.ai',
  'napkin-ai': 'napkin.ai',
  'whimsical-ai': 'whimsical.com',
  'krisp': 'krisp.ai',
};

function getGoogleFaviconV2(domain) {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}

// ── Main ──
const seed = JSON.parse(readFileSync(seedPath, 'utf-8'));
const tools = seed.tools;
let tier1Count = 0;
let tier2Count = 0;

for (const tool of tools) {
  const slug = tool.slug;

  // Tier 1: 수동 큐레이션
  if (CURATED_LOGOS[slug]) {
    tool.logo_url = CURATED_LOGOS[slug];
    tier1Count++;
    continue;
  }

  // Tier 2: Google Favicon V2 128x128
  const domain = DOMAIN_MAP[slug];
  if (domain) {
    tool.logo_url = getGoogleFaviconV2(domain);
    tier2Count++;
  }
}

writeFileSync(seedPath, JSON.stringify(seed, null, 2), 'utf-8');

console.log('=== Logo Fix V2 Summary ===');
console.log(`Total tools: ${tools.length}`);
console.log(`Tier 1 (curated): ${tier1Count}`);
console.log(`Tier 2 (Google Favicon 128px): ${tier2Count}`);
console.log(`Unchanged: ${tools.length - tier1Count - tier2Count}`);
console.log('Done!');
