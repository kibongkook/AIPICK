const data = require('../data/seed.json');

const missing = data.tools.filter(t => !t.logo_url || t.logo_url.includes('placeholder') || t.logo_url === '');

console.log(`Missing or placeholder icons: ${missing.length}/${data.tools.length}`);
console.log('\nTools with missing icons:');
missing.forEach(t => {
  console.log(`- ${t.name} (${t.slug}): ${t.logo_url || 'NO URL'}`);
});
