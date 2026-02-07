import { readFileSync } from 'fs';
const d = JSON.parse(readFileSync('data/seed.json', 'utf-8'));
const t = d.tools;
console.log('Total tools:', t.length);
console.log('With logos:', t.filter(x => x.logo_url).length);
console.log('Non-stable trends:', t.filter(x => x.trend_direction && x.trend_direction !== 'stable').length);
console.log('Benchmarks:', (d.tool_benchmark_scores || []).length);

const top5 = [...t].sort((a, b) => (b.hybrid_score || 0) - (a.hybrid_score || 0)).slice(0, 5);
console.log('\nTop 5 by hybrid_score:');
top5.forEach((x, i) => console.log(`  ${i+1}. ${x.name}: ${x.hybrid_score}`));

const sora = t.find(x => x.slug === 'sora');
console.log('\nSora:', sora.pricing_type, '|', sora.free_quota_detail?.slice(0, 60));

const paid = t.filter(x => x.pricing_type === 'Paid');
console.log('\nPaid tools:', paid.map(x => x.name).join(', '));
