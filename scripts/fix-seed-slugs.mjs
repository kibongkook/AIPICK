/**
 * Fix slug mismatches from the first seed fix script.
 * Applies correct scores to tools that were missed due to slug differences.
 */
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const seedPath = join(__dirname, '..', 'data', 'seed.json');
const seed = JSON.parse(readFileSync(seedPath, 'utf-8'));

// Slug corrections: script used -> actual slug -> correct score
const SLUG_FIXES = {
  'microsoft-copilot': { hybrid_score: 85.5, ranking_score: 85.5 },
  'perplexity': { hybrid_score: 83.5, ranking_score: 83.5 },
  'dall-e-3': { hybrid_score: 79.0, ranking_score: 79.0 },
  'runway-ml': { hybrid_score: 76.5, ranking_score: 76.5 },
  'luma-dream-machine': { hybrid_score: 63.5, ranking_score: 63.5 },
};

// Also fix trend data for missed slugs
const TREND_FIXES = {
  'microsoft-copilot': { trend_direction: 'up', trend_magnitude: 4, weekly_visit_delta: 4200 },
  'perplexity': { trend_direction: 'up', trend_magnitude: 7, weekly_visit_delta: 18000 },
  'dall-e-3': { trend_direction: 'stable', trend_magnitude: 0, weekly_visit_delta: 200 },
  'runway-ml': { trend_direction: 'up', trend_magnitude: 5, weekly_visit_delta: 8000 },
  'luma-dream-machine': { trend_direction: 'up', trend_magnitude: 3, weekly_visit_delta: 3500 },
};

let scoreFixed = 0;
let trendFixed = 0;

for (const tool of seed.tools) {
  if (SLUG_FIXES[tool.slug]) {
    const fix = SLUG_FIXES[tool.slug];
    tool.hybrid_score = fix.hybrid_score;
    tool.ranking_score = fix.ranking_score;
    tool.internal_score = +(fix.hybrid_score * 0.7).toFixed(1);
    tool.external_score = +(fix.hybrid_score * 0.3).toFixed(1);
    scoreFixed++;
    console.log(`Score fixed: ${tool.name} (${tool.slug}) → ${fix.hybrid_score}`);
  }
  if (TREND_FIXES[tool.slug]) {
    Object.assign(tool, TREND_FIXES[tool.slug]);
    trendFixed++;
    console.log(`Trend fixed: ${tool.name} (${tool.slug}) → ${TREND_FIXES[tool.slug].trend_direction}`);
  }
}

writeFileSync(seedPath, JSON.stringify(seed, null, 2), 'utf-8');
console.log(`\n=== Slug Fix Complete ===`);
console.log(`Scores fixed: ${scoreFixed}`);
console.log(`Trends fixed: ${trendFixed}`);
