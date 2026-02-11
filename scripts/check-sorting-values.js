const seed = require('../data/seed.json');

console.log('=== HOT & TOP5 정렬 값 확인 ===\n');
console.log('First 10 tools in seed.json order:');
seed.tools.slice(0, 10).forEach((t, i) => {
  console.log(`${i+1}. ${t.name}`);
  console.log(`   rating_avg: ${t.rating_avg}`);
  console.log(`   hybrid_score: ${t.hybrid_score}`);
  console.log(`   weekly_visit_delta: ${t.weekly_visit_delta}`);
  console.log(`   trend_magnitude: ${t.trend_magnitude}`);
  console.log(`   visit_count: ${t.visit_count}`);
  console.log('');
});

console.log('\n=== 현재 정렬 로직 시뮬레이션 ===\n');

// HOT 로직
console.log('🔥 HOT (getTrending fallback 로직):');
const hot = [...seed.tools].sort((a, b) => {
  const aMag = a.trend_magnitude ?? 0;
  const bMag = b.trend_magnitude ?? 0;
  if (aMag !== bMag) return bMag - aMag;
  return (b.weekly_visit_delta || 0) - (a.weekly_visit_delta || 0);
}).slice(0, 5);

hot.forEach((t, i) => {
  console.log(`${i+1}. ${t.name} (trend_mag: ${t.trend_magnitude}, weekly_delta: ${t.weekly_visit_delta})`);
});

// TOP 5 로직
console.log('\n🏆 TOP 5 (getRankings fallback 로직):');
const top5 = [...seed.tools].sort((a, b) => {
  const scoreA = a.hybrid_score || a.ranking_score || 0;
  const scoreB = b.hybrid_score || b.ranking_score || 0;
  if (scoreA !== scoreB) return scoreB - scoreA;
  return a.name.localeCompare(b.name);
}).slice(0, 5);

top5.forEach((t, i) => {
  console.log(`${i+1}. ${t.name} (hybrid: ${t.hybrid_score}, ranking: ${t.ranking_score})`);
});

console.log('\n=== 문제점 ===');
console.log('모든 정렬 값이 0이라 의미있는 정렬이 안 됩니다!');
console.log('- HOT: 원래 seed.json 순서 유지');
console.log('- TOP 5: 이름 가나다순 정렬');
