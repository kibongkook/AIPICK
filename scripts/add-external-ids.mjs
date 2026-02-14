/**
 * add-external-ids.mjs
 *
 * Adds external platform IDs (App Store, Play Store, Trustpilot, G2)
 * and resets rating_avg / review_count to 0 for all tools in seed.json.
 *
 * Usage:  node scripts/add-external-ids.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SEED_PATH = resolve(__dirname, '..', 'data', 'seed.json');

// ─── Known Mappings ─────────────────────────────────────────────────────────

const APP_STORE_IDS = {
  'chatgpt': '6448311069',
  'claude': '6473753684',
  'gemini': '6477141240',
  'perplexity': '6714467650',
  'microsoft-copilot': '6738322791',
  'wrtn': null,
  'grok': null,
  'canva-ai': '897446215',
  'grammarly': '1044906395',
  'deepl': '1552407475',
  'notion-ai': '1232780281',
  'midjourney': null,
  'character-ai': '1607227956',
  'capcut': '1500855883',
  'papago': '1147874819',
  'google-translate': '414706506',
  'clova-note': '1620786367',
  'speechify': '1209815023',
  'duolingo-max': '570060128',
};

const PLAY_STORE_IDS = {
  'chatgpt': 'com.openai.chatgpt',
  'claude': 'com.anthropic.claude',
  'gemini': 'com.google.android.apps.bard',
  'perplexity': 'ai.perplexity.app.android',
  'microsoft-copilot': 'com.microsoft.copilot',
  'canva-ai': 'com.canva.editor',
  'grammarly': 'com.grammarly.android.keyboard',
  'deepl': 'com.deepl.mobiletranslator',
  'notion-ai': 'notion.id',
  'capcut': 'com.lemon.lvoverseas',
  'papago': 'com.naver.labs.translator',
  'google-translate': 'com.google.android.apps.translate',
  'clova-note': 'com.naver.clova.note',
  'speechify': 'com.cliffweitzman.speechifyMobile',
  'duolingo-max': 'com.duolingo',
};

const G2_SLUGS = {
  'chatgpt': 'chatgpt',
  'claude': 'claude',
  'gemini': 'google-gemini',
  'notion-ai': 'notion-ai',
  'canva-ai': 'canva',
  'grammarly': 'grammarly',
  'jasper': 'jasper',
  'copy-ai': 'copy-ai',
  'writesonic': 'writesonic',
  'midjourney': 'midjourney',
  'deepl': 'deepl',
  'otter-ai': 'otter-ai',
  'fireflies-ai': 'fireflies-ai',
  'zapier-ai': 'zapier',
  'make': 'make-formerly-integromat',
  'perplexity': 'perplexity-ai',
  'github-copilot': 'github-copilot',
  'cursor': 'cursor-ai',
};

// ─── Main ───────────────────────────────────────────────────────────────────

const seed = JSON.parse(readFileSync(SEED_PATH, 'utf8'));

const stats = {
  total: 0,
  appStorePopulated: 0,
  playStorePopulated: 0,
  trustpilotPopulated: 0,
  g2Populated: 0,
  ratingReset: 0,
};

for (const tool of seed.tools) {
  stats.total++;

  // ── app_store_id ──
  if (!('app_store_id' in tool)) {
    const value = APP_STORE_IDS[tool.slug] ?? null;
    tool.app_store_id = value;
  }
  if (tool.app_store_id) stats.appStorePopulated++;

  // ── play_store_id ──
  if (!('play_store_id' in tool)) {
    const value = PLAY_STORE_IDS[tool.slug] ?? null;
    tool.play_store_id = value;
  }
  if (tool.play_store_id) stats.playStorePopulated++;

  // ── trustpilot_domain (auto-derived from url) ──
  if (!('trustpilot_domain' in tool)) {
    try {
      const hostname = new URL(tool.url).hostname.replace(/^www\./, '');
      tool.trustpilot_domain = hostname;
    } catch {
      tool.trustpilot_domain = null;
    }
  }
  if (tool.trustpilot_domain) stats.trustpilotPopulated++;

  // ── g2_slug ──
  if (!('g2_slug' in tool)) {
    const value = G2_SLUGS[tool.slug] ?? null;
    tool.g2_slug = value;
  }
  if (tool.g2_slug) stats.g2Populated++;

  // ── confidence fields ──
  if (!('confidence_level' in tool)) {
    tool.confidence_level = 'none';
  }
  if (!('confidence_source_count' in tool)) {
    tool.confidence_source_count = 0;
  }
  if (!('rating_sources' in tool)) {
    tool.rating_sources = [];
  }

  // ── Reset fake rating / review data ──
  tool.rating_avg = 0;
  tool.review_count = 0;
  stats.ratingReset++;
}

// ─── Write back ─────────────────────────────────────────────────────────────

writeFileSync(SEED_PATH, JSON.stringify(seed, null, 2) + '\n', 'utf8');

// ─── Summary ────────────────────────────────────────────────────────────────

console.log('=== add-external-ids: Summary ===');
console.log(`Total tools processed:        ${stats.total}`);
console.log(`app_store_id populated:       ${stats.appStorePopulated}`);
console.log(`play_store_id populated:      ${stats.playStorePopulated}`);
console.log(`trustpilot_domain populated:  ${stats.trustpilotPopulated}`);
console.log(`g2_slug populated:            ${stats.g2Populated}`);
console.log(`rating_avg/review_count reset:${stats.ratingReset}`);
console.log('');
console.log('Done. seed.json updated successfully.');
