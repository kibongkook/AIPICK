const data = require('../data/seed.json');

const withoutPrompt = data.tools.filter(t => t.sample_output && !t.sample_output_prompt);
const withPrompt = data.tools.filter(t => t.sample_output && t.sample_output_prompt);

console.log('Tools with sample_output_prompt:', withPrompt.length);
console.log('Tools WITHOUT sample_output_prompt:', withoutPrompt.length);

if (withoutPrompt.length > 0) {
  console.log('\nMissing prompts:');
  withoutPrompt.slice(0, 25).forEach(t => console.log('  -', t.name, '(' + t.slug + ')'));
  if (withoutPrompt.length > 25) {
    console.log(`  ... and ${withoutPrompt.length - 25} more`);
  }
}
