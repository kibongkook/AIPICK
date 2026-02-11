const seed = require('../data/seed.json');

console.log('=== AIPICK DB 현황 분석 ===\n');

// 1. 전체 통계
console.log('📊 전체 통계:');
console.log(`  총 AI 서비스: ${seed.tools.length}개`);
console.log(`  총 카테고리: ${seed.categories.length}개\n`);

// 2. 카테고리별 분포
console.log('📁 카테고리별 AI 서비스 분포:\n');

const catMap = new Map();
seed.categories.forEach(cat => {
  catMap.set(cat.id, { name: cat.name, slug: cat.slug, count: 0, tools: [] });
});

seed.tools.forEach(tool => {
  const cat = catMap.get(tool.category_id);
  if (cat) {
    cat.count++;
    cat.tools.push({ name: tool.name, rating: tool.rating_avg, visits: tool.visit_count });
  }
});

// 정렬: 도구 수 많은 순
const sortedCats = Array.from(catMap.values()).sort((a, b) => b.count - a.count);

sortedCats.forEach((cat, i) => {
  console.log(`${i+1}. ${cat.name} (${cat.slug}): ${cat.count}개`);

  // 상위 3개 인기 도구
  const top3 = cat.tools
    .sort((a, b) => (b.visits || 0) - (a.visits || 0))
    .slice(0, 3);

  top3.forEach((tool, j) => {
    const visits = tool.visits ? `${(tool.visits / 1000000).toFixed(0)}M` : '0';
    console.log(`   ${j+1}) ${tool.name} (${visits} 방문, ⭐${tool.rating})`);
  });
  console.log('');
});

// 3. 평점 분포
console.log('⭐ 평점 분포:');
const ratingRanges = {
  '4.8점': 0,
  '4.7점': 0,
  '4.6점': 0,
  '4.5점': 0,
  '4.4점': 0,
  '4.3점': 0,
  '4.2점': 0,
  '4.1점': 0,
  '4.0점 이하': 0
};

seed.tools.forEach(tool => {
  const rating = tool.rating_avg || 0;
  if (rating >= 4.8) ratingRanges['4.8점']++;
  else if (rating >= 4.7) ratingRanges['4.7점']++;
  else if (rating >= 4.6) ratingRanges['4.6점']++;
  else if (rating >= 4.5) ratingRanges['4.5점']++;
  else if (rating >= 4.4) ratingRanges['4.4점']++;
  else if (rating >= 4.3) ratingRanges['4.3점']++;
  else if (rating >= 4.2) ratingRanges['4.2점']++;
  else if (rating >= 4.1) ratingRanges['4.1점']++;
  else ratingRanges['4.0점 이하']++;
});

Object.entries(ratingRanges).forEach(([range, count]) => {
  if (count > 0) {
    const bar = '█'.repeat(Math.ceil(count / 2));
    console.log(`  ${range}: ${count}개 ${bar}`);
  }
});

// 4. 방문수 분포
console.log('\n👥 월간 방문수 분포:');
const visitRanges = {
  '1억 이상': 0,
  '5천만-1억': 0,
  '1천만-5천만': 0,
  '5백만-1천만': 0,
  '1백만-5백만': 0,
  '1백만 미만': 0
};

seed.tools.forEach(tool => {
  const visits = tool.visit_count || 0;
  if (visits >= 100000000) visitRanges['1억 이상']++;
  else if (visits >= 50000000) visitRanges['5천만-1억']++;
  else if (visits >= 10000000) visitRanges['1천만-5천만']++;
  else if (visits >= 5000000) visitRanges['5백만-1천만']++;
  else if (visits >= 1000000) visitRanges['1백만-5백만']++;
  else visitRanges['1백만 미만']++;
});

Object.entries(visitRanges).forEach(([range, count]) => {
  if (count > 0) {
    const bar = '█'.repeat(Math.ceil(count / 2));
    console.log(`  ${range}: ${count}개 ${bar}`);
  }
});

// 5. TOP 10 인기 서비스
console.log('\n🔥 TOP 10 인기 AI 서비스 (방문수 기준):\n');
const top10 = [...seed.tools]
  .sort((a, b) => (b.visit_count || 0) - (a.visit_count || 0))
  .slice(0, 10);

top10.forEach((tool, i) => {
  const cat = seed.categories.find(c => c.id === tool.category_id);
  const visits = tool.visit_count ? (tool.visit_count / 1000000).toFixed(0) : '0';
  console.log(`${i+1}. ${tool.name}`);
  console.log(`   카테고리: ${cat?.name}`);
  console.log(`   월간 방문: ${visits}M명`);
  console.log(`   평점: ⭐${tool.rating_avg}`);
  console.log('');
});

// 6. 선정 기준 추정
console.log('🎯 선정 기준 (추정):');
console.log('  ✓ 글로벌 주요 AI 서비스 (ChatGPT, Claude, Gemini 등)');
console.log('  ✓ Product Hunt 인기 도구');
console.log('  ✓ GitHub 스타 5천+ 오픈소스');
console.log('  ✓ 카테고리별 대표 서비스 (최소 10개)');
console.log('  ✓ 한국 주요 서비스 (뤼튼, 클로바X 등)');
console.log('  ✓ 무료 플랜 제공 우선');
