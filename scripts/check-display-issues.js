const data = require('../data/seed.json');

console.log('🔍 Checking for potential display issues\n');

// 매우 짧거나 긴 출력
const tooShort = data.tools.filter(t => t.sample_output && t.sample_output.length < 50);
const tooLong = data.tools.filter(t => t.sample_output && t.sample_output.length > 1500);

console.log('📏 Output Length Issues:');
console.log(`   Too short (<50 chars): ${tooShort.length}`);
if (tooShort.length > 0) {
  tooShort.forEach(t => {
    console.log(`     - ${t.name} (${t.slug}): ${t.sample_output.length} chars`);
    console.log(`       Output: "${t.sample_output.substring(0, 50)}..."`);
  });
}
console.log(`   Too long (>1500 chars): ${tooLong.length}`);
if (tooLong.length > 0) {
  tooLong.slice(0, 5).forEach(t => {
    console.log(`     - ${t.name} (${t.slug}): ${t.sample_output.length} chars`);
  });
}

// 프롬프트와 출력 내용 불일치 검사 (코드 vs 텍스트)
console.log('\n🔤 Content Type Mismatches:');
const codePrompts = data.tools.filter(t => {
  const p = (t.sample_output_prompt || '').toLowerCase();
  return p.includes('코드') || p.includes('react') || p.includes('python') || p.includes('javascript') || p.includes('함수') || p.includes('컴포넌트');
});
const hasCodeOutput = codePrompts.filter(t => {
  const o = t.sample_output || '';
  return o.includes('```') || o.includes('import ') || o.includes('function ') || o.includes('const ') || o.includes('export ');
});
const missingCodeMarkers = codePrompts.filter(t => !hasCodeOutput.includes(t));

console.log(`   Prompts asking for code: ${codePrompts.length}`);
console.log(`   Actually contain code markers: ${hasCodeOutput.length}`);
console.log(`   Missing code markers (might display as text): ${missingCodeMarkers.length}`);
if (missingCodeMarkers.length > 0) {
  missingCodeMarkers.slice(0, 10).forEach(t => {
    console.log(`     - ${t.name} (${t.slug})`);
    console.log(`       Prompt: ${t.sample_output_prompt}`);
    console.log(`       Output: ${t.sample_output.substring(0, 80)}...`);
  });
}

// 특수문자 또는 인코딩 문제
console.log('\n🔣 Special Character Issues:');
const withSpecialChars = data.tools.filter(t => {
  const o = t.sample_output || '';
  return o.includes('\ufffd') || o.includes('�') || o.includes('\0');
});
console.log(`   Tools with encoding issues: ${withSpecialChars.length}`);
if (withSpecialChars.length > 0) {
  withSpecialChars.forEach(t => console.log(`     - ${t.name} (${t.slug})`));
}

// 빈 줄이 많은 출력
console.log('\n📄 Formatting Issues:');
const manyEmptyLines = data.tools.filter(t => {
  const o = t.sample_output || '';
  const lines = o.split('\n');
  const emptyLines = lines.filter(l => l.trim() === '').length;
  return emptyLines > lines.length * 0.5 && lines.length > 5;
});
console.log(`   Tools with excessive empty lines: ${manyEmptyLines.length}`);
if (manyEmptyLines.length > 0) {
  manyEmptyLines.forEach(t => {
    const lines = t.sample_output.split('\n');
    const emptyLines = lines.filter(l => l.trim() === '').length;
    console.log(`     - ${t.name} (${t.slug}): ${emptyLines}/${lines.length} empty`);
  });
}

console.log('\n✅ Analysis complete!');
