const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, '../data/seed.json');
const seedData = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

const logos = seedData.tools.map(t => ({ name: t.name, slug: t.slug, url: t.logo_url }));

const clearbit = logos.filter(l => l.url && l.url.includes('clearbit'));
const dashboard = logos.filter(l => l.url && (l.url.includes('dashboard-icons') || l.url.includes('walkxcode')));
const duckduck = logos.filter(l => l.url && l.url.includes('duckduckgo'));
const direct = logos.filter(l => l.url && !l.url.includes('clearbit') && !l.url.includes('dashboard') && !l.url.includes('duckduckgo'));
const none = logos.filter(l => !l.url);

console.log('Logo sources breakdown:');
console.log(`- Clearbit: ${clearbit.length} tools`);
console.log(`- Dashboard Icons: ${dashboard.length} tools`);
console.log(`- DuckDuckGo: ${duckduck.length} tools`);
console.log(`- Direct URLs: ${direct.length} tools`);
console.log(`- No logo: ${none.length} tools`);

if (clearbit.length > 0) {
  console.log('\n=== Clearbit Logo URLs (may need verification) ===');
  clearbit.slice(0, 10).forEach(l => {
    console.log(`${l.name} (${l.slug}): ${l.url}`);
  });
}

if (none.length > 0) {
  console.log('\n=== Tools with no logo ===');
  none.forEach(l => {
    console.log(`- ${l.name} (${l.slug})`);
  });
}

console.log(`\n✓ Total tools checked: ${logos.length}`);
