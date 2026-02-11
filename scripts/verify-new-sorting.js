const seed = require('../data/seed.json');

console.log('=== 수정된 정렬 로직 시뮬레이션 ===\n');

// HOT 로직 (수정된 버전)
console.log('🔥 HOT (getTrending - visit_count 기준):');
const hot = [...seed.tools].sort((a, b) => {
  const aMag = a.trend_magnitude ?? 0;
  const bMag = b.trend_magnitude ?? 0;
  if (aMag !== bMag) return bMag - aMag;

  const aDelta = a.weekly_visit_delta || 0;
  const bDelta = b.weekly_visit_delta || 0;
  if (aDelta !== bDelta) return bDelta - aDelta;

  const aVisit = a.visit_count || 0;
  const bVisit = b.visit_count || 0;
  if (aVisit !== bVisit) return bVisit - aVisit;

  const aRating = a.rating_avg || 0;
  const bRating = b.rating_avg || 0;
  return bRating - aRating;
}).slice(0, 6);

hot.forEach((t, i) => {
  console.log(`${i+1}. ${t.name}`);
  console.log(`   visit_count: ${(t.visit_count || 0).toLocaleString()}`);
  console.log(`   rating: ${t.rating_avg}`);
  console.log('');
});

// TOP 5 로직 (수정된 버전)
console.log('🏆 TOP 5 (getRankings - rating_avg → visit_count 기준):');
const top5 = [...seed.tools].sort((a, b) => {
  const scoreA = a.hybrid_score || a.ranking_score || 0;
  const scoreB = b.hybrid_score || b.ranking_score || 0;
  if (scoreA !== scoreB) return scoreB - scoreA;

  const ratingA = a.rating_avg || 0;
  const ratingB = b.rating_avg || 0;
  if (ratingA !== ratingB) return ratingB - ratingA;

  const visitA = a.visit_count || 0;
  const visitB = b.visit_count || 0;
  if (visitA !== visitB) return visitB - visitA;

  return a.name.localeCompare(b.name);
}).slice(0, 5);

top5.forEach((t, i) => {
  console.log(`${i+1}. ${t.name}`);
  console.log(`   rating: ${t.rating_avg}`);
  console.log(`   visit_count: ${(t.visit_count || 0).toLocaleString()}`);
  console.log('');
});
