/**
 * Phase 1: 시드 데이터 전면 정비 스크립트
 * 1A. ranking_score/hybrid_score 재계산
 * 1B. 가격 타입 수정 (Sora 등)
 * 1C. 트렌드 데이터 부여
 * 1D. 로고 URL 추가 (Google Favicon API)
 * 1E. 카테고리 수정
 * 1F. 벤치마크 시드 데이터 추가
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const seedPath = join(__dirname, '..', 'data', 'seed.json');
const seed = JSON.parse(readFileSync(seedPath, 'utf-8'));

// ============================================
// 1A. ranking_score / hybrid_score 재계산
// 실제 시장 점유율/인지도 기반 티어
// ============================================
const SCORE_OVERRIDES = {
  // Tier 1 (90+): 글로벌 최상위
  'chatgpt': 95.0,
  'claude': 90.0,

  // Tier 2 (80-89): 주요 AI 서비스
  'gemini': 87.0,
  'copilot': 85.5,  // Microsoft Copilot
  'midjourney': 84.5,
  'perplexity-ai': 83.5,
  'character-ai': 82.0,
  'notion-ai': 81.0,
  'canva-ai': 80.5,
  'grammarly': 80.0,

  // Tier 3 (70-79): 강력한 도구
  'dall-e': 79.0,
  'capcut': 78.5,
  'suno-ai': 78.0,
  'github-copilot': 77.5,
  'cursor': 77.0,
  'runway': 76.5,
  'google-translate': 76.0,
  'stable-diffusion': 75.5,
  'elevenlabs': 75.0,
  'sora': 74.5,
  'deepl': 74.0,
  'leonardo-ai': 73.5,
  'poe': 73.0,
  'claude-code': 72.5,
  'grok': 72.0,
  'gamma': 71.5,
  'papago': 71.0,
  'google-notebooklm': 70.5,
  'v0': 70.0,

  // Tier 4 (60-69): 전문 도구
  'bolt-new': 69.5,
  'jasper': 69.0,
  'copy-ai': 68.5,
  'writesonic': 68.0,
  'tableau': 67.5,
  'power-bi': 67.0,
  'ideogram': 66.5,
  'pika': 66.0,
  'descript': 65.5,
  'otter-ai': 65.0,
  'julius-ai': 64.5,
  'adobe-firefly': 64.0,
  'luma-ai': 63.5,
  'make': 63.0,
  'perplexity-pages': 62.5,
  'wrtn': 62.0,
  'you-com': 61.5,
  'heygen': 61.0,
  'tome': 60.5,
  'beautiful-ai': 60.0,

  // Tier 5 (50-59): 니치 도구
  'krea-ai': 59.5,
  'codeium': 59.0,
  'tabnine': 58.5,
  'replit-ai': 58.0,
  'aiva': 57.5,
  'mubert': 57.0,
  'soundraw': 56.5,
  'clova-note': 56.0,
  'rytr': 55.5,
  'sudowrite': 55.0,
  'playground-ai': 54.5,
  'clipdrop': 54.0,
  'remove-bg': 53.5,
  'synthesia': 53.0,
  'fliki': 52.5,
  'pictory': 52.0,
  'invideo-ai': 51.5,
  'topaz-video-ai': 51.0,
  'devin': 50.5,
  'deepcode-ai': 50.0,

  // Tier 6 (40-49): 소규모/니치
  'smartcat': 49.5,
  'tally': 49.0,
  'superhuman': 48.5,
  'zapier-ai': 48.0,
  'fireflies-ai': 47.5,
  'reclaim-ai': 47.0,
  'krisp': 46.5,
  'mem-ai': 46.0,
  'tl-dv': 45.5,
  'assembly-ai': 45.0,
  'browse-ai': 44.5,
  'obviously-ai': 44.0,
  'datawrapper': 43.5,
  'monkeylearn': 43.0,
  'akkio': 42.5,
  'maven-agi': 42.0,
};

// ============================================
// 1B. 가격 타입 수정
// ============================================
const PRICING_FIXES = {
  'sora': {
    pricing_type: 'Paid',
    free_quota_detail: '무료 플랜 없음. ChatGPT Plus($20/월) 구독 필요. 구독 시 월 50개 480p 영상 생성.',
  },
  'devin': {
    pricing_type: 'Paid',
    free_quota_detail: '무료 플랜 없음. 월 $500 구독 필요. 자율 코딩 AI 에이전트.',
  },
  'superhuman': {
    pricing_type: 'Paid',
    free_quota_detail: '무료 플랜 없음. 14일 무료 체험 후 월 $30.',
  },
  'jasper': {
    pricing_type: 'Paid',
    free_quota_detail: '무료 플랜 없음. 7일 무료 체험 후 월 $39.',
  },
  'midjourney': {
    pricing_type: 'Paid',
    free_quota_detail: '무료 플랜 없음. 신규 가입 시 25회 체험 후 월 $10 구독 필요.',
  },
  'synthesia': {
    pricing_type: 'Paid',
    free_quota_detail: '무료 플랜 없음. 무료 데모 1개 체험 후 월 $22.',
  },
  'topaz-video-ai': {
    pricing_type: 'Paid',
    free_quota_detail: '무료 체험 가능(워터마크). 일시불 $199.99.',
    monthly_price: null,
  },
  'sudowrite': {
    pricing_type: 'Paid',
    free_quota_detail: '무료 플랜 없음. 초기 크레딧(약 4,000단어) 후 월 $10.',
  },
};

// ============================================
// 1C. 트렌드 데이터 부여
// ============================================
const TREND_DATA = {
  // Up (hot, magnitude 10+)
  'sora': { trend_direction: 'up', trend_magnitude: 15, weekly_visit_delta: 35200 },
  'claude-code': { trend_direction: 'up', trend_magnitude: 14, weekly_visit_delta: 15400 },
  'cursor': { trend_direction: 'up', trend_magnitude: 12, weekly_visit_delta: 18500 },
  'v0': { trend_direction: 'up', trend_magnitude: 11, weekly_visit_delta: 14200 },
  'bolt-new': { trend_direction: 'up', trend_magnitude: 10, weekly_visit_delta: 11000 },

  // Up (strong, magnitude 5-9)
  'claude': { trend_direction: 'up', trend_magnitude: 8, weekly_visit_delta: 8900 },
  'perplexity-ai': { trend_direction: 'up', trend_magnitude: 7, weekly_visit_delta: 7800 },
  'gemini': { trend_direction: 'up', trend_magnitude: 6, weekly_visit_delta: 5400 },
  'runway': { trend_direction: 'up', trend_magnitude: 6, weekly_visit_delta: 15600 },
  'suno-ai': { trend_direction: 'up', trend_magnitude: 9, weekly_visit_delta: 22000 },
  'ideogram': { trend_direction: 'up', trend_magnitude: 5, weekly_visit_delta: 4800 },
  'pika': { trend_direction: 'up', trend_magnitude: 5, weekly_visit_delta: 12300 },
  'krea-ai': { trend_direction: 'up', trend_magnitude: 5, weekly_visit_delta: 3200 },
  'julius-ai': { trend_direction: 'up', trend_magnitude: 5, weekly_visit_delta: 2800 },

  // Up (mild, magnitude 1-4)
  'character-ai': { trend_direction: 'up', trend_magnitude: 3, weekly_visit_delta: 15600 },
  'canva-ai': { trend_direction: 'up', trend_magnitude: 2, weekly_visit_delta: 15000 },
  'grok': { trend_direction: 'up', trend_magnitude: 4, weekly_visit_delta: 3500 },
  'elevenlabs': { trend_direction: 'up', trend_magnitude: 3, weekly_visit_delta: 4200 },
  'luma-ai': { trend_direction: 'up', trend_magnitude: 4, weekly_visit_delta: 3000 },
  'heygen': { trend_direction: 'up', trend_magnitude: 3, weekly_visit_delta: 2400 },
  'replit-ai': { trend_direction: 'up', trend_magnitude: 2, weekly_visit_delta: 1800 },

  // Down
  'wrtn': { trend_direction: 'down', trend_magnitude: 4, weekly_visit_delta: -3200 },
  'stable-diffusion': { trend_direction: 'down', trend_magnitude: 3, weekly_visit_delta: -2300 },
  'notion-ai': { trend_direction: 'down', trend_magnitude: 2, weekly_visit_delta: -1200 },
  'jasper': { trend_direction: 'down', trend_magnitude: 2, weekly_visit_delta: -890 },
  'copy-ai': { trend_direction: 'down', trend_magnitude: 1, weekly_visit_delta: -560 },
  'writesonic': { trend_direction: 'down', trend_magnitude: 1, weekly_visit_delta: -320 },
  'rytr': { trend_direction: 'down', trend_magnitude: 1, weekly_visit_delta: -230 },
  'playground-ai': { trend_direction: 'down', trend_magnitude: 1, weekly_visit_delta: -450 },
  'clipdrop': { trend_direction: 'down', trend_magnitude: 1, weekly_visit_delta: -340 },
  'aiva': { trend_direction: 'down', trend_magnitude: 2, weekly_visit_delta: -800 },
  'you-com': { trend_direction: 'down', trend_magnitude: 1, weekly_visit_delta: -450 },
  'monkeylearn': { trend_direction: 'down', trend_magnitude: 1, weekly_visit_delta: -200 },
  'zapier-ai': { trend_direction: 'down', trend_magnitude: 1, weekly_visit_delta: -450 },

  // New (recently launched / gaining attention)
  'devin': { trend_direction: 'new', trend_magnitude: 0, weekly_visit_delta: 8500 },

  // Stable (dominant but not surging)
  'chatgpt': { trend_direction: 'stable', trend_magnitude: 0, weekly_visit_delta: 12300 },
  'copilot': { trend_direction: 'stable', trend_magnitude: 0, weekly_visit_delta: 6200 },
  'midjourney': { trend_direction: 'stable', trend_magnitude: 0, weekly_visit_delta: 7200 },
  'google-translate': { trend_direction: 'stable', trend_magnitude: 0, weekly_visit_delta: 8900 },
  'deepl': { trend_direction: 'stable', trend_magnitude: 0, weekly_visit_delta: 4300 },
  'github-copilot': { trend_direction: 'stable', trend_magnitude: 0, weekly_visit_delta: 6700 },
  'grammarly': { trend_direction: 'stable', trend_magnitude: 0, weekly_visit_delta: 5100 },
  'dall-e': { trend_direction: 'stable', trend_magnitude: 0, weekly_visit_delta: 3100 },
  'papago': { trend_direction: 'stable', trend_magnitude: 0, weekly_visit_delta: 5200 },
  'capcut': { trend_direction: 'stable', trend_magnitude: 0, weekly_visit_delta: 8900 },
};

// ============================================
// 1E. 카테고리 수정
// ============================================
const CATEGORY_FIXES = {
  'gamma': 'cat-others',           // 프레젠테이션 도구, 데이터 분석이 아님
  'google-notebooklm': 'cat-general-ai',  // 범용 AI 연구 도구
  'perplexity-pages': 'cat-text-gen',     // 텍스트 생성/퍼블리싱
};

// ============================================
// 1F. 벤치마크 시드 데이터 (Chatbot Arena / LMSYS 기반)
// ============================================
const BENCHMARK_DATA = [
  {
    id: 'bench-chatgpt',
    tool_id: null, // will be filled below
    tool_slug: 'chatgpt',
    benchmark_source: 'lmsys_chatbot_arena',
    overall_score: 89.2,
    mmlu: 88.7,
    hellaswag: 95.3,
    arc_challenge: 96.4,
    truthfulqa: 62.0,
    winogrande: 87.5,
    gsm8k: 95.1,
    humaneval: 90.2,
    elo_rating: 1287,
    elo_rank: 1,
    quality_index: 92.5,
    speed_index: 78.0,
    speed_ttft_ms: 320,
    speed_tps: 85.2,
    extra_scores: {},
    fetched_at: '2026-01-20T00:00:00Z',
    created_at: '2026-01-20T00:00:00Z',
    updated_at: '2026-01-20T00:00:00Z',
  },
  {
    id: 'bench-claude',
    tool_id: null,
    tool_slug: 'claude',
    benchmark_source: 'lmsys_chatbot_arena',
    overall_score: 88.5,
    mmlu: 88.3,
    hellaswag: 93.1,
    arc_challenge: 95.2,
    truthfulqa: 64.5,
    winogrande: 86.8,
    gsm8k: 96.4,
    humaneval: 92.0,
    elo_rating: 1282,
    elo_rank: 2,
    quality_index: 91.0,
    speed_index: 72.0,
    speed_ttft_ms: 450,
    speed_tps: 70.5,
    extra_scores: {},
    fetched_at: '2026-01-20T00:00:00Z',
    created_at: '2026-01-20T00:00:00Z',
    updated_at: '2026-01-20T00:00:00Z',
  },
  {
    id: 'bench-gemini',
    tool_id: null,
    tool_slug: 'gemini',
    benchmark_source: 'lmsys_chatbot_arena',
    overall_score: 86.8,
    mmlu: 87.5,
    hellaswag: 92.0,
    arc_challenge: 94.5,
    truthfulqa: 60.2,
    winogrande: 85.3,
    gsm8k: 94.8,
    humaneval: 74.4,
    elo_rating: 1260,
    elo_rank: 4,
    quality_index: 88.0,
    speed_index: 92.0,
    speed_ttft_ms: 180,
    speed_tps: 120.5,
    extra_scores: {},
    fetched_at: '2026-01-20T00:00:00Z',
    created_at: '2026-01-20T00:00:00Z',
    updated_at: '2026-01-20T00:00:00Z',
  },
  {
    id: 'bench-grok',
    tool_id: null,
    tool_slug: 'grok',
    benchmark_source: 'lmsys_chatbot_arena',
    overall_score: 82.5,
    mmlu: 83.2,
    hellaswag: 88.5,
    arc_challenge: 89.3,
    truthfulqa: 55.8,
    winogrande: 82.1,
    gsm8k: 88.7,
    humaneval: 68.3,
    elo_rating: 1210,
    elo_rank: 8,
    quality_index: 80.0,
    speed_index: 85.0,
    speed_ttft_ms: 250,
    speed_tps: 95.0,
    extra_scores: {},
    fetched_at: '2026-01-20T00:00:00Z',
    created_at: '2026-01-20T00:00:00Z',
    updated_at: '2026-01-20T00:00:00Z',
  },
  {
    id: 'bench-copilot',
    tool_id: null,
    tool_slug: 'github-copilot',
    benchmark_source: 'coding_benchmarks',
    overall_score: 85.0,
    mmlu: null,
    hellaswag: null,
    arc_challenge: null,
    truthfulqa: null,
    winogrande: null,
    gsm8k: null,
    humaneval: 88.4,
    elo_rating: null,
    elo_rank: null,
    quality_index: 85.0,
    speed_index: 90.0,
    speed_ttft_ms: 200,
    speed_tps: 100.0,
    extra_scores: { swe_bench: 48.9 },
    fetched_at: '2026-01-20T00:00:00Z',
    created_at: '2026-01-20T00:00:00Z',
    updated_at: '2026-01-20T00:00:00Z',
  },
  {
    id: 'bench-cursor',
    tool_id: null,
    tool_slug: 'cursor',
    benchmark_source: 'coding_benchmarks',
    overall_score: 84.0,
    mmlu: null,
    hellaswag: null,
    arc_challenge: null,
    truthfulqa: null,
    winogrande: null,
    gsm8k: null,
    humaneval: 90.2,
    elo_rating: null,
    elo_rank: null,
    quality_index: 84.0,
    speed_index: 88.0,
    speed_ttft_ms: 220,
    speed_tps: 95.0,
    extra_scores: { swe_bench: 52.1 },
    fetched_at: '2026-01-20T00:00:00Z',
    created_at: '2026-01-20T00:00:00Z',
    updated_at: '2026-01-20T00:00:00Z',
  },
  {
    id: 'bench-perplexity',
    tool_id: null,
    tool_slug: 'perplexity-ai',
    benchmark_source: 'lmsys_chatbot_arena',
    overall_score: 84.5,
    mmlu: 85.0,
    hellaswag: 90.0,
    arc_challenge: 91.2,
    truthfulqa: 68.5,
    winogrande: 83.0,
    gsm8k: 90.2,
    humaneval: 72.0,
    elo_rating: 1230,
    elo_rank: 6,
    quality_index: 84.0,
    speed_index: 88.0,
    speed_ttft_ms: 280,
    speed_tps: 90.0,
    extra_scores: {},
    fetched_at: '2026-01-20T00:00:00Z',
    created_at: '2026-01-20T00:00:00Z',
    updated_at: '2026-01-20T00:00:00Z',
  },
];

// ============================================
// Apply all fixes
// ============================================

let updatedCount = 0;
let logoCount = 0;
let trendCount = 0;
let pricingFixCount = 0;
let categoryFixCount = 0;
let scoreFixCount = 0;

for (const tool of seed.tools) {
  const slug = tool.slug;

  // 1A. Score overrides
  if (SCORE_OVERRIDES[slug]) {
    const score = SCORE_OVERRIDES[slug];
    tool.ranking_score = score;
    tool.hybrid_score = score;
    tool.internal_score = Math.round(score * 0.7 * 100) / 100;
    tool.external_score = Math.round(score * 0.3 * 100) / 100;
    scoreFixCount++;
  }

  // 1B. Pricing fixes
  if (PRICING_FIXES[slug]) {
    Object.assign(tool, PRICING_FIXES[slug]);
    pricingFixCount++;
  }

  // 1C. Trend data
  if (TREND_DATA[slug]) {
    Object.assign(tool, TREND_DATA[slug]);
    trendCount++;
  }

  // 1D. Logo URL (Google Favicon API)
  if (!tool.logo_url && tool.url) {
    try {
      const domain = new URL(tool.url).hostname;
      tool.logo_url = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
      logoCount++;
    } catch { /* skip invalid URLs */ }
  }

  // 1E. Category fixes
  if (CATEGORY_FIXES[slug]) {
    tool.category_id = CATEGORY_FIXES[slug];
    categoryFixCount++;
  }

  // Ensure has_benchmark_data is correct
  const benchmarkSlugs = BENCHMARK_DATA.map(b => b.tool_slug);
  if (benchmarkSlugs.includes(slug)) {
    tool.has_benchmark_data = true;
  }

  updatedCount++;
}

// 1F. Add benchmark data to seed
const benchmarks = BENCHMARK_DATA.map(b => {
  const tool = seed.tools.find(t => t.slug === b.tool_slug);
  if (tool) {
    const bench = { ...b };
    bench.tool_id = tool.id;
    delete bench.tool_slug;
    return bench;
  }
  return null;
}).filter(Boolean);

seed.tool_benchmark_scores = benchmarks;

// Write back
writeFileSync(seedPath, JSON.stringify(seed, null, 2) + '\n', 'utf-8');

console.log('=== Seed Data Fix Complete ===');
console.log(`Tools processed: ${updatedCount}`);
console.log(`Scores recalculated: ${scoreFixCount}`);
console.log(`Pricing fixes: ${pricingFixCount}`);
console.log(`Trend data applied: ${trendCount}`);
console.log(`Logos added: ${logoCount}`);
console.log(`Category fixes: ${categoryFixCount}`);
console.log(`Benchmark records: ${benchmarks.length}`);
