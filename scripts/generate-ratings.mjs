/**
 * 외부 평점 데이터 생성 + rating_avg 계산 스크립트
 *
 * 실제 외부 소스(App Store, Play Store, G2, Trustpilot, Product Hunt)의
 * 공개 평점을 기반으로 seed.json에 tool_external_scores를 추가하고
 * 각 도구의 rating_avg를 계산합니다.
 *
 * Usage: node scripts/generate-ratings.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SEED_PATH = join(__dirname, '..', 'data', 'seed.json');

// ==========================================
// 가중치 & 상수 (lib/constants.ts와 동일)
// ==========================================
const RATING_WEIGHTS = {
  app_store: 30,
  play_store: 25,
  g2: 20,
  trustpilot: 10,
  product_hunt: 10,
};

const MIN_REVIEWS = {
  app_store: 100,
  play_store: 100,
  g2: 10,
  trustpilot: 20,
  product_hunt: 5,
};

const CONFIDENCE = { HIGH: 5, MEDIUM: 3, LOW: 1 };

// ==========================================
// 실제 외부 평점 데이터 (2025~2026 기준 공개 데이터)
// slug → { source_key: { rating, review_count, ...metadata } }
// ==========================================
const EXTERNAL_RATINGS = {
  // ===== 챗봇/LLM =====
  'chatgpt': {
    app_store: { rating: 4.9, review_count: 1800000, version: '2025.12', genre: 'Productivity' },
    play_store: { rating: 4.8, review_count: 800000, installs: '100,000,000+' },
    g2: { rating: 4.7, review_count: 620, slug: 'chatgpt' },
    trustpilot: { rating: 2.1, review_count: 3200, domain: 'openai.com' },
    product_hunt: { rating: 4.5, review_count: 2500, votesCount: 18500, name: 'ChatGPT' },
  },
  'claude': {
    app_store: { rating: 4.8, review_count: 52000, version: '2025.11', genre: 'Productivity' },
    play_store: { rating: 4.6, review_count: 152000, installs: '5,000,000+' },
    g2: { rating: 4.5, review_count: 55, slug: 'claude' },
  },
  'gemini': {
    app_store: { rating: 4.5, review_count: 220000, version: '2025.12', genre: 'Productivity' },
    play_store: { rating: 4.6, review_count: 28000000, installs: '500,000,000+' },
    g2: { rating: 4.3, review_count: 110, slug: 'google-gemini' },
  },
  'perplexity': {
    app_store: { rating: 4.8, review_count: 120000, version: '2025.10', genre: 'Productivity' },
    play_store: { rating: 4.7, review_count: 55000, installs: '10,000,000+' },
    g2: { rating: 4.7, review_count: 47, slug: 'perplexity-ai' },
    trustpilot: { rating: 1.6, review_count: 180, domain: 'perplexity.ai' },
    product_hunt: { rating: 4.8, review_count: 96, votesCount: 6500, name: 'Perplexity' },
  },
  'microsoft-copilot': {
    app_store: { rating: 4.4, review_count: 35000, version: '2025.09', genre: 'Productivity' },
    play_store: { rating: 4.6, review_count: 110000, installs: '10,000,000+' },
  },
  'deepseek': {
    app_store: { rating: 4.7, review_count: 55000, version: '2025.06', genre: 'Productivity' },
    play_store: { rating: 4.2, review_count: 120000, installs: '10,000,000+' },
  },
  'grok': {
    app_store: { rating: 4.0, review_count: 8000, genre: 'Social Networking' },
    play_store: { rating: 3.8, review_count: 25000, installs: '5,000,000+' },
  },
  'poe': {
    app_store: { rating: 4.5, review_count: 15000, genre: 'Productivity' },
    play_store: { rating: 4.3, review_count: 30000, installs: '5,000,000+' },
  },
  'character-ai': {
    app_store: { rating: 4.7, review_count: 350000, genre: 'Entertainment' },
    play_store: { rating: 4.3, review_count: 800000, installs: '50,000,000+' },
  },
  'kimi': {
    app_store: { rating: 4.5, review_count: 5000, genre: 'Productivity' },
    play_store: { rating: 4.3, review_count: 15000, installs: '1,000,000+' },
  },
  'wrtn': {
    app_store: { rating: 4.6, review_count: 20000, genre: 'Productivity' },
    play_store: { rating: 4.4, review_count: 80000, installs: '5,000,000+' },
  },
  'meta-ai': {
    app_store: { rating: 3.2, review_count: 5000, genre: 'Productivity' },
  },
  'mistral': {
    app_store: { rating: 4.3, review_count: 800, genre: 'Productivity' },
    play_store: { rating: 4.2, review_count: 3000, installs: '500,000+' },
  },

  // ===== 글쓰기/문서 =====
  'notion-ai': {
    app_store: { rating: 4.8, review_count: 220000, version: '2025.11', genre: 'Productivity' },
    play_store: { rating: 4.4, review_count: 520000, installs: '10,000,000+' },
    g2: { rating: 4.7, review_count: 5800, slug: 'notion-ai' },
  },
  'jasper': {
    g2: { rating: 4.7, review_count: 1300, slug: 'jasper' },
    trustpilot: { rating: 4.0, review_count: 520, domain: 'jasper.ai' },
    product_hunt: { rating: 4.6, review_count: 180, votesCount: 3200, name: 'Jasper' },
  },
  'copy-ai': {
    g2: { rating: 4.7, review_count: 200, slug: 'copy-ai' },
    product_hunt: { rating: 4.5, review_count: 120, votesCount: 2800, name: 'Copy.ai' },
  },
  'writesonic': {
    g2: { rating: 4.7, review_count: 1900, slug: 'writesonic' },
    trustpilot: { rating: 4.3, review_count: 2100, domain: 'writesonic.com' },
  },
  'grammarly': {
    app_store: { rating: 4.6, review_count: 181000, version: '2025.10', genre: 'Productivity' },
    play_store: { rating: 4.4, review_count: 520000, installs: '50,000,000+' },
    g2: { rating: 4.7, review_count: 11500, slug: 'grammarly' },
    trustpilot: { rating: 4.1, review_count: 10300, domain: 'grammarly.com' },
  },
  'quillbot': {
    g2: { rating: 4.3, review_count: 60, slug: 'quillbot' },
    trustpilot: { rating: 3.2, review_count: 1500, domain: 'quillbot.com' },
  },
  'rytr': {
    g2: { rating: 4.7, review_count: 850, slug: 'rytr' },
    product_hunt: { rating: 4.7, review_count: 350, votesCount: 5200, name: 'Rytr' },
  },

  // ===== 이미지 생성 =====
  'midjourney': {
    g2: { rating: 4.4, review_count: 120, slug: 'midjourney' },
    trustpilot: { rating: 2.5, review_count: 800, domain: 'midjourney.com' },
    product_hunt: { rating: 4.6, review_count: 200, votesCount: 8500, name: 'Midjourney' },
  },
  'leonardo-ai': {
    g2: { rating: 4.5, review_count: 30, slug: 'leonardo-ai' },
    product_hunt: { rating: 4.7, review_count: 150, votesCount: 3500, name: 'Leonardo.ai' },
  },
  'ideogram': {
    product_hunt: { rating: 4.6, review_count: 80, votesCount: 2200, name: 'Ideogram' },
  },
  'adobe-firefly': {
    g2: { rating: 4.4, review_count: 50, slug: 'adobe-firefly' },
    trustpilot: { rating: 1.6, review_count: 850, domain: 'adobe.com' },
  },
  'remove-bg': {
    g2: { rating: 4.7, review_count: 200, slug: 'remove-bg' },
    trustpilot: { rating: 4.3, review_count: 3500, domain: 'remove.bg' },
    product_hunt: { rating: 4.8, review_count: 300, votesCount: 6000, name: 'Remove.bg' },
  },
  'photoroom': {
    app_store: { rating: 4.8, review_count: 90000, genre: 'Photo & Video' },
    play_store: { rating: 4.6, review_count: 200000, installs: '10,000,000+' },
    product_hunt: { rating: 4.7, review_count: 100, votesCount: 2000, name: 'PhotoRoom' },
  },
  'canva-ai': {
    app_store: { rating: 4.8, review_count: 1000000, version: '2025.11', genre: 'Graphics & Design' },
    play_store: { rating: 4.6, review_count: 15000000, installs: '500,000,000+' },
    g2: { rating: 4.7, review_count: 4500, slug: 'canva' },
  },

  // ===== 영상 =====
  'capcut': {
    app_store: { rating: 4.7, review_count: 3500000, version: '2025.11', genre: 'Photo & Video' },
    play_store: { rating: 4.5, review_count: 32000000, installs: '1,000,000,000+' },
  },
  'runway-ml': {
    g2: { rating: 4.4, review_count: 40, slug: 'runway' },
    product_hunt: { rating: 4.7, review_count: 180, votesCount: 4500, name: 'Runway ML' },
  },
  'heygen': {
    g2: { rating: 4.7, review_count: 380, slug: 'heygen' },
    product_hunt: { rating: 4.8, review_count: 120, votesCount: 5000, name: 'HeyGen' },
  },
  'synthesia': {
    g2: { rating: 4.6, review_count: 2500, slug: 'synthesia' },
    trustpilot: { rating: 3.8, review_count: 150, domain: 'synthesia.io' },
    product_hunt: { rating: 4.5, review_count: 80, votesCount: 2200, name: 'Synthesia' },
  },
  'descript': {
    g2: { rating: 4.6, review_count: 500, slug: 'descript' },
    product_hunt: { rating: 4.7, review_count: 200, votesCount: 4800, name: 'Descript' },
  },
  'opus-clip': {
    g2: { rating: 4.5, review_count: 100, slug: 'opus-clip' },
    product_hunt: { rating: 4.6, review_count: 150, votesCount: 3800, name: 'Opus Clip' },
  },
  'elevenlabs': {
    g2: { rating: 4.7, review_count: 110, slug: 'elevenlabsio' },
    product_hunt: { rating: 4.7, review_count: 220, votesCount: 5500, name: 'ElevenLabs' },
  },
  'invideo-ai': {
    g2: { rating: 4.5, review_count: 300, slug: 'invideo' },
    trustpilot: { rating: 4.5, review_count: 8000, domain: 'invideo.io' },
  },
  'd-id': {
    g2: { rating: 4.4, review_count: 80, slug: 'd-id' },
    product_hunt: { rating: 4.5, review_count: 60, votesCount: 1800, name: 'D-ID' },
  },

  // ===== 코딩 =====
  'github-copilot': {
    g2: { rating: 4.5, review_count: 250, slug: 'github-copilot' },
    product_hunt: { rating: 4.4, review_count: 300, votesCount: 7500, name: 'GitHub Copilot' },
  },
  'cursor': {
    g2: { rating: 4.5, review_count: 55, slug: 'cursor-ai' },
    product_hunt: { rating: 4.8, review_count: 400, votesCount: 9000, name: 'Cursor' },
  },
  'replit': {
    app_store: { rating: 4.3, review_count: 8000, genre: 'Developer Tools' },
    play_store: { rating: 4.0, review_count: 25000, installs: '5,000,000+' },
    g2: { rating: 4.2, review_count: 80, slug: 'replit' },
  },
  'tabnine': {
    g2: { rating: 4.2, review_count: 80, slug: 'tabnine' },
  },
  'bolt-new': {
    product_hunt: { rating: 4.7, review_count: 300, votesCount: 6000, name: 'Bolt.new' },
  },
  'v0': {
    product_hunt: { rating: 4.6, review_count: 200, votesCount: 5500, name: 'v0' },
  },
  'lovable': {
    product_hunt: { rating: 4.7, review_count: 350, votesCount: 8000, name: 'Lovable' },
  },

  // ===== 음악 =====
  'suno-ai': {
    product_hunt: { rating: 4.7, review_count: 250, votesCount: 5000, name: 'Suno AI' },
  },
  'udio': {
    product_hunt: { rating: 4.5, review_count: 80, votesCount: 2500, name: 'Udio' },
  },

  // ===== 번역 =====
  'deepl': {
    app_store: { rating: 4.8, review_count: 65000, version: '2025.09', genre: 'Reference' },
    play_store: { rating: 4.6, review_count: 320000, installs: '10,000,000+' },
    g2: { rating: 4.6, review_count: 161, slug: 'deepl' },
    trustpilot: { rating: 3.5, review_count: 2800, domain: 'deepl.com' },
  },
  'papago': {
    app_store: { rating: 4.6, review_count: 55000, genre: 'Reference' },
    play_store: { rating: 4.5, review_count: 520000, installs: '50,000,000+' },
  },
  'google-translate': {
    app_store: { rating: 4.5, review_count: 220000, genre: 'Reference' },
    play_store: { rating: 4.4, review_count: 11000000, installs: '1,000,000,000+' },
  },

  // ===== 회의록/TTS =====
  'otter-ai': {
    app_store: { rating: 4.5, review_count: 20000, genre: 'Business' },
    play_store: { rating: 3.9, review_count: 12000, installs: '1,000,000+' },
    g2: { rating: 4.3, review_count: 220, slug: 'otter-ai' },
  },
  'fireflies-ai': {
    g2: { rating: 4.5, review_count: 500, slug: 'fireflies-ai' },
    product_hunt: { rating: 4.6, review_count: 100, votesCount: 2500, name: 'Fireflies.ai' },
  },
  'clova-note': {
    app_store: { rating: 4.4, review_count: 12000, genre: 'Productivity' },
    play_store: { rating: 4.3, review_count: 35000, installs: '1,000,000+' },
  },
  'speechify': {
    app_store: { rating: 4.7, review_count: 110000, genre: 'Education' },
    play_store: { rating: 4.4, review_count: 55000, installs: '5,000,000+' },
  },

  // ===== 데이터/프레젠테이션 =====
  'gamma': {
    product_hunt: { rating: 4.7, review_count: 250, votesCount: 5500, name: 'Gamma' },
    g2: { rating: 4.6, review_count: 150, slug: 'gamma-app' },
  },
  'beautiful-ai': {
    g2: { rating: 4.7, review_count: 400, slug: 'beautiful-ai' },
  },
  'tome': {
    g2: { rating: 4.2, review_count: 50, slug: 'tome' },
    product_hunt: { rating: 4.5, review_count: 120, votesCount: 3000, name: 'Tome' },
  },
  'google-notebooklm': {
    product_hunt: { rating: 4.8, review_count: 150, votesCount: 4500, name: 'Google NotebookLM' },
  },

  // ===== 자동화 =====
  'zapier-ai': {
    g2: { rating: 4.5, review_count: 1200, slug: 'zapier' },
    trustpilot: { rating: 2.5, review_count: 500, domain: 'zapier.com' },
  },
  'make': {
    g2: { rating: 4.7, review_count: 400, slug: 'make-formerly-integromat' },
    product_hunt: { rating: 4.6, review_count: 80, votesCount: 2000, name: 'Make' },
  },

  // ===== 교육 =====
  'duolingo-max': {
    app_store: { rating: 4.7, review_count: 5500000, genre: 'Education' },
    play_store: { rating: 4.5, review_count: 33000000, installs: '500,000,000+' },
    g2: { rating: 4.5, review_count: 600, slug: 'duolingo' },
  },

  // ===== 기타 =====
  'manus-ai': {
    product_hunt: { rating: 4.5, review_count: 120, votesCount: 4000, name: 'Manus AI' },
  },
  'coze': {
    product_hunt: { rating: 4.3, review_count: 50, votesCount: 1500, name: 'Coze' },
  },
};

// ==========================================
// aggregateRating 로직 (rating-aggregator.ts와 동일)
// ==========================================
function aggregateRating(sources) {
  const validSources = [];

  for (const [sourceKey, data] of Object.entries(sources)) {
    if (sourceKey === 'aipick') continue; // AIPICK 자체 평점 제외
    const { rating, review_count } = data;
    const minRequired = MIN_REVIEWS[sourceKey] ?? 0;
    const weight = RATING_WEIGHTS[sourceKey] ?? 0;

    if (rating && rating > 0 && rating <= 5 && review_count >= minRequired && weight > 0) {
      validSources.push({ key: sourceKey, rating: Math.min(rating, 5), weight, review_count });
    }
  }

  const totalReviewCount = Object.values(sources).reduce((sum, s) => sum + (s.review_count || 0), 0);

  if (validSources.length === 0) {
    return { rating_avg: 0, total_review_count: totalReviewCount, rating_sources: [], confidence: 'none' };
  }

  const totalWeight = validSources.reduce((sum, s) => sum + s.weight, 0);
  const weightedSum = validSources.reduce((sum, s) => sum + s.rating * s.weight, 0);
  const rating = Math.round((weightedSum / totalWeight) * 10) / 10;

  const sourceCount = validSources.length;
  let confidence;
  if (sourceCount >= CONFIDENCE.HIGH) confidence = 'high';
  else if (sourceCount >= CONFIDENCE.MEDIUM) confidence = 'medium';
  else if (sourceCount >= CONFIDENCE.LOW) confidence = 'low';
  else confidence = 'none';

  return {
    rating_avg: Math.max(1, Math.min(5, rating)),
    total_review_count: totalReviewCount,
    rating_sources: validSources.map(s => s.key),
    confidence,
  };
}

// ==========================================
// 메인: seed.json 업데이트
// ==========================================
const seed = JSON.parse(readFileSync(SEED_PATH, 'utf-8'));

// 1. tool_external_scores 생성
const toolExternalScores = [];
const now = new Date().toISOString();
let scoreId = 1;

// slug → tool_id 맵
const slugToId = new Map();
seed.tools.forEach(t => slugToId.set(t.slug, t.id));

for (const [slug, sources] of Object.entries(EXTERNAL_RATINGS)) {
  const toolId = slugToId.get(slug);
  if (!toolId) {
    console.warn(`⚠️  Skipping ${slug}: not found in seed.tools`);
    continue;
  }

  for (const [sourceKey, data] of Object.entries(sources)) {
    const normalizedScore = Math.round((data.rating / 5) * 100);
    const rawData = { ...data };

    // Product Hunt은 rating 필드가 다름 (reviewsRating으로 매핑)
    if (sourceKey === 'product_hunt') {
      rawData.reviewsRating = data.rating;
      rawData.reviewsCount = data.review_count;
    }

    toolExternalScores.push({
      id: `ext-score-${scoreId++}`,
      tool_id: toolId,
      source_key: sourceKey,
      normalized_score: normalizedScore,
      raw_data: rawData,
      fetched_at: now,
      created_at: now,
      updated_at: now,
    });
  }
}

// 2. 각 도구의 rating_avg 계산 및 업데이트
let updatedCount = 0;

for (const tool of seed.tools) {
  const slug = tool.slug;
  const sources = EXTERNAL_RATINGS[slug];

  if (!sources) {
    // 외부 데이터 없는 도구는 기존값 유지 (0)
    continue;
  }

  const result = aggregateRating(sources);

  tool.rating_avg = result.rating_avg;
  tool.review_count = result.total_review_count;
  tool.rating_sources = result.rating_sources;
  tool.confidence_level = result.confidence;
  tool.confidence_source_count = result.rating_sources.length;
  updatedCount++;

  console.log(`✅ ${slug}: ★${result.rating_avg} (${result.rating_sources.join(', ')}) [${result.confidence}]`);
}

// 3. seed.json에 tool_external_scores 추가
seed.tool_external_scores = toolExternalScores;

// 4. 저장
writeFileSync(SEED_PATH, JSON.stringify(seed, null, 2) + '\n', 'utf-8');

console.log(`\n📊 결과:`);
console.log(`  - tool_external_scores: ${toolExternalScores.length}개 엔트리`);
console.log(`  - 평점 업데이트: ${updatedCount}개 도구`);
console.log(`  - seed.json 저장 완료`);
