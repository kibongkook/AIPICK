/**
 * fix-logos.mjs
 * Google Favicon API(16x16 upscaled) / Clearbit(deprecated) → icon.horse 고품질 로고로 전면 교체
 *
 * 전략:
 * 1. 모든 서비스: icon.horse API (https://icon.horse/icon/{domain}) — 고품질 PNG, 무료, 안정적
 * 2. 도메인 정규화: 잘못된 도메인이나 서브도메인 → 올바른 루트 도메인
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const seedPath = resolve(__dirname, '../data/seed.json');

// ── 도메인 정규화 맵 (slug → 올바른 도메인) ──
// icon.horse는 도메인만 정확하면 고품질 아이콘을 반환함
const DOMAIN_MAP = {
  // General AI
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

  // Text Generation
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

  // Image Generation
  'midjourney': 'midjourney.com',
  'dall-e-3': 'openai.com',
  'stable-diffusion': 'stability.ai',
  'leonardo-ai': 'leonardo.ai',
  'ideogram': 'ideogram.ai',
  'adobe-firefly': 'adobe.com',
  'krea-ai': 'krea.ai',
  'playground-ai': 'playground.com',
  'bing-image-creator': 'bing.com',
  'flux': 'flux1.ai',
  'remove-bg': 'remove.bg',
  'photoroom': 'photoroom.com',
  'clipdrop': 'clipdrop.co',

  // Video
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

  // Coding
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

  // Music
  'suno-ai': 'suno.com',
  'udio': 'udio.com',
  'aiva': 'aiva.ai',
  'mubert': 'mubert.com',
  'soundraw': 'soundraw.io',
  'boomy': 'boomy.com',
  'soundful': 'soundful.com',
  'beatoven-ai': 'beatoven.ai',
  'loudly': 'loudly.com',

  // Data & Presentation
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

  // Translation
  'deepl': 'deepl.com',
  'papago': 'papago.naver.com',
  'google-translate': 'translate.google.com',
  'deepl-write': 'deepl.com',
  'flitto': 'flitto.com',
  'smartcat': 'smartcat.com',
  'lingva-translate': 'lingva.ml',
  'itranslate': 'itranslate.com',

  // Others / Productivity
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

// icon.horse URL 생성
function getIconHorseLogo(domain) {
  return `https://icon.horse/icon/${domain}`;
}

// 기존 URL에서 domain 추출 (fallback)
function extractDomain(logoUrl) {
  // Google Favicon API
  const googleMatch = logoUrl.match(/domain=([^&]+)/);
  if (googleMatch) return googleMatch[1].replace(/^www\./, '');
  // Clearbit
  const clearbitMatch = logoUrl.match(/logo\.clearbit\.com\/(.+)/);
  if (clearbitMatch) return clearbitMatch[1];
  // icon.horse
  const horseMatch = logoUrl.match(/icon\.horse\/icon\/(.+)/);
  if (horseMatch) return horseMatch[1];
  return null;
}

// ── Main ──
const seed = JSON.parse(readFileSync(seedPath, 'utf-8'));
const tools = seed.tools;
let fixedCount = 0;
let mappedCount = 0;
let fallbackCount = 0;

for (const tool of tools) {
  const slug = tool.slug;

  // 1순위: 명시적 도메인 맵
  if (DOMAIN_MAP[slug]) {
    tool.logo_url = getIconHorseLogo(DOMAIN_MAP[slug]);
    mappedCount++;
    fixedCount++;
    continue;
  }

  // 2순위: 기존 URL에서 도메인 추출 → icon.horse
  const domain = extractDomain(tool.logo_url);
  if (domain) {
    tool.logo_url = getIconHorseLogo(domain);
    fallbackCount++;
    fixedCount++;
  }
}

// 저장
writeFileSync(seedPath, JSON.stringify(seed, null, 2), 'utf-8');

console.log('=== Logo Fix Summary (icon.horse) ===');
console.log(`Total tools: ${tools.length}`);
console.log(`Fixed: ${fixedCount}`);
console.log(`  - Explicit domain map: ${mappedCount}`);
console.log(`  - Fallback extraction: ${fallbackCount}`);
console.log(`Unchanged: ${tools.length - fixedCount}`);
console.log('Done! seed.json updated with icon.horse logos.');
