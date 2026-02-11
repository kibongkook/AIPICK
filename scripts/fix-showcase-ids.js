/**
 * Showcase ID Fix Script
 *
 * 문제: tool_showcases에서 존재하지 않는 showcase_id를 참조
 * 해결: showcase_id를 올바른 ID로 매핑
 */

const fs = require('fs');
const path = require('path');

const SEED_PATH = path.join(__dirname, '../data/seed.json');
const OUTPUT_PATH = path.join(__dirname, '../data/seed-fixed-showcases.json');

// 잘못된 ID → 올바른 ID 매핑
const ID_MAPPING = {
  // 범용 AI → 여러 카테고리로 분산
  'cs-general-ai': 'cs-research',  // 연구/분석에 가장 적합

  // 텍스트 생성 → 글쓰기
  'cs-text-generation': 'cs-writing',

  // 이미지 생성 → 디자인
  'cs-image-generation': 'cs-design',

  // 비디오 편집 → 비디오
  'cs-video-editing': 'cs-video',

  // 코딩 도구 → 코딩
  'cs-coding-tools': 'cs-coding',

  // 음악 생성 → 디자인 (창작 카테고리)
  'cs-music-generation': 'cs-design',

  // 데이터 분석 → 리서치
  'cs-data-analysis': 'cs-research',

  // 번역 → 글쓰기
  'cs-translation': 'cs-writing',

  // 기타 → 발표자료 (가장 근접)
  'cs-others': 'cs-presentation',
};

function main() {
  console.log('🔧 Showcase ID Fix Script\n');

  // 1. seed.json 읽기
  const data = JSON.parse(fs.readFileSync(SEED_PATH, 'utf-8'));

  // 2. 현재 상태 분석
  const csIds = new Set((data.category_showcases || []).map(cs => cs.id));
  const toolShowcases = data.tool_showcases || [];

  console.log('📊 Current State:');
  console.log(`   Total tool_showcases: ${toolShowcases.length}`);
  console.log(`   Category_showcases: ${csIds.size}`);
  console.log('');

  const broken = toolShowcases.filter(ts => !csIds.has(ts.showcase_id));
  console.log(`   Broken references: ${broken.length}\n`);

  // 3. ID 매핑 적용
  let fixed = 0;
  let notMapped = 0;

  toolShowcases.forEach(ts => {
    if (!csIds.has(ts.showcase_id)) {
      const mappedId = ID_MAPPING[ts.showcase_id];
      if (mappedId) {
        console.log(`   ✅ ${ts.id}: ${ts.showcase_id} → ${mappedId}`);
        ts.showcase_id = mappedId;
        fixed++;
      } else {
        console.log(`   ⚠️  ${ts.id}: No mapping for ${ts.showcase_id}`);
        notMapped++;
      }
    }
  });

  console.log('');
  console.log('📈 Results:');
  console.log(`   Fixed: ${fixed}`);
  console.log(`   Not mapped: ${notMapped}`);
  console.log('');

  // 4. 검증
  const stillBroken = toolShowcases.filter(ts => !csIds.has(ts.showcase_id));
  if (stillBroken.length > 0) {
    console.log('⚠️  Still broken:');
    stillBroken.forEach(ts => {
      console.log(`     ${ts.id}: ${ts.showcase_id}`);
    });
    console.log('');
  } else {
    console.log('✅ All showcase references are now valid!\n');
  }

  // 5. 저장
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`💾 Saved to: ${OUTPUT_PATH}`);
  console.log('\n✨ Review the changes and replace seed.json if satisfied.');
}

main();
