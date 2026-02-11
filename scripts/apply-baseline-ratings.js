const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, '../data/seed.json');
const seedData = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

// 카테고리별 기본 평점 범위 (외부 평가 없는 도구들을 위한 추정치)
const categoryBaseRatings = {
  'text-generation': { min: 4.2, max: 4.5, visitBase: 50000000 },
  'code': { min: 4.3, max: 4.6, visitBase: 20000000 },
  'image': { min: 4.1, max: 4.4, visitBase: 30000000 },
  'video': { min: 4.0, max: 4.3, visitBase: 15000000 },
  'audio': { min: 4.1, max: 4.4, visitBase: 10000000 },
  'research': { min: 4.2, max: 4.5, visitBase: 25000000 },
  'writing': { min: 4.2, max: 4.5, visitBase: 40000000 },
  'design': { min: 4.1, max: 4.4, visitBase: 35000000 },
  'productivity': { min: 4.3, max: 4.6, visitBase: 45000000 },
  'data': { min: 4.2, max: 4.5, visitBase: 20000000 },
};

// 도구 이름 기반 인기도 추정 (글로벌 주요 브랜드)
const popularTools = [
  'openai', 'anthropic', 'google', 'microsoft', 'meta', 'adobe', 'figma',
  'notion', 'slack', 'zoom', 'discord', 'github', 'gitlab', 'linear',
  'vercel', 'netlify', 'aws', 'azure', 'huggingface', 'replicate'
];

function isPopularTool(name, website) {
  const nameLower = name.toLowerCase();
  const websiteLower = (website || '').toLowerCase();
  return popularTools.some(brand =>
    nameLower.includes(brand) || websiteLower.includes(brand)
  );
}

function generateBaselineRating(tool, categorySlug) {
  // 이미 평점이 있으면 건너뛰기
  if (tool.rating_avg && tool.rating_avg > 0) {
    return;
  }

  const categoryRating = categoryBaseRatings[categorySlug] || { min: 4.0, max: 4.3, visitBase: 20000000 };

  // 평점: 카테고리 범위 내에서 랜덤 (소수점 1자리)
  const rating = Math.round((categoryRating.min + Math.random() * (categoryRating.max - categoryRating.min)) * 10) / 10;

  // 방문수: 인기 도구는 2-5배, 일반 도구는 0.5-2배
  const popularityMultiplier = isPopularTool(tool.name, tool.website)
    ? 2 + Math.random() * 3
    : 0.5 + Math.random() * 1.5;
  const visitCount = Math.round(categoryRating.visitBase * popularityMultiplier);

  // Product Hunt 추정치: 방문수의 0.1-0.5%
  const phUpvotes = Math.round(visitCount * (0.001 + Math.random() * 0.004));

  tool.rating_avg = rating;
  tool.visit_count = visitCount;
  tool.product_hunt_upvotes = phUpvotes;
}

// 카테고리 slug를 id로부터 찾기
const categoryMap = {};
seedData.categories.forEach(cat => {
  categoryMap[cat.id] = cat.slug;
});

let updated = 0;
seedData.tools.forEach(tool => {
  const categorySlug = categoryMap[tool.category_id];
  if (!categorySlug) return;

  const hadRating = tool.rating_avg && tool.rating_avg > 0;
  generateBaselineRating(tool, categorySlug);

  if (!hadRating && tool.rating_avg > 0) {
    updated++;
  }
});

// 저장
fs.writeFileSync(seedPath, JSON.stringify(seedData, null, 2), 'utf8');

console.log(`\n✅ Applied baseline ratings to ${updated} tools`);
console.log(`📊 Total tools with ratings: ${seedData.tools.filter(t => t.rating_avg > 0).length}`);
