/**
 * 카테고리 체계 통일 마이그레이션 스크립트
 *
 * 16개 seed.json 카테고리 → 12개 통일 카테고리
 *
 * 병합:
 *   voice → music (음악·오디오)
 *   data-analysis + research → data (데이터·리서치)
 * 삭제:
 *   learning (매핑 도구 0개)
 *   entertainment (1개 도구 → chat으로 재배치)
 * 고아 카테고리 ID 정리:
 *   e9f8c3a1... (chatgpt,claude,gemini,copilot,cursor,replit,v0) → coding
 *   f1a2b3c4... (chatgpt,claude,gemini,perplexity) → data (리서치)
 *   c3d4e5f6... (udio) → music
 *   d83f8a62... (make) → automation
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const seedPath = join(__dirname, '..', 'data', 'seed.json');

const data = JSON.parse(readFileSync(seedPath, 'utf-8'));

// === 현재 카테고리 ID 매핑 ===
const OLD_IDS = {
  chat:           'e052e3cb-1613-4dc3-95c9-8fb66fa1bda8',
  writing:        '7fbbbeb2-d3c7-4920-af6b-4680f78f1a61',
  translation:    '5025a911-0505-4394-a778-587445327ade',
  voice:          'abdcd10c-02d6-4830-bb06-f0db65093353',
  design:         '63191d5a-af82-4c95-b7b6-ebb1cb5e33d3',
  video:          'a0a4d567-c8a5-4b6f-b135-b13b558b6e6f',
  music:          '61b550b2-1563-407b-a059-b8957ba0fa5d',
  coding:         '118a92a9-2e3e-490a-a5ca-059026ceb89c',
  automation:     'b4c4412f-805c-409b-8cd4-de074f47ee58',
  'data-analysis':'ca1a1250-a8e3-4dd6-8994-bda300aec46a',
  research:       '8dc40214-996b-401f-a8bd-fead730c4292',
  presentation:   'c1670373-b4fb-4222-be2b-b490f7895d24',
  marketing:      '0e430c24-8bfa-479d-a1aa-d99aefdee380',
  building:       '1e245fcd-2d55-4e02-89a1-1ed651d38aaf',
  learning:       '8fe946e1-e686-4efa-a51a-2aff6d240f88',
  entertainment:  '98d51ac5-bd69-45f6-8651-48346755cfc6',
};

// 고아 카테고리 IDs
const ORPHAN_IDS = {
  orphan1: 'e9f8c3a1-4b6d-4f2e-9c5a-7e8d9f0a1b2c', // chatgpt,claude,gemini,copilot,cursor,replit,v0 → coding
  orphan2: 'f1a2b3c4-5d6e-4f7a-8b9c-0d1e2f3a4b5c', // chatgpt,claude,gemini,perplexity → data
  orphan3: 'c3d4e5f6-7a8b-4c9d-0e1f-2a3b4c5d6e7f', // udio → music
  orphan4: 'd83f8a62-2f56-43a6-8c8b-3f40c4d8f6d0', // make → automation
};

// === 새 data 카테고리 ID (research ID 재사용) ===
const NEW_DATA_ID = OLD_IDS.research; // research ID를 data로 재활용

// === 카테고리 ID 리매핑 규칙 ===
const REMAP = {
  // voice → music
  [OLD_IDS.voice]: OLD_IDS.music,
  // data-analysis → data (research ID 재사용)
  [OLD_IDS['data-analysis']]: NEW_DATA_ID,
  // learning → 삭제 (매핑 없음)
  [OLD_IDS.learning]: null,
  // entertainment → chat (character-ai 등)
  [OLD_IDS.entertainment]: OLD_IDS.chat,
  // 고아 → 적절한 카테고리
  [ORPHAN_IDS.orphan1]: OLD_IDS.coding,      // 코딩 도구들
  [ORPHAN_IDS.orphan2]: NEW_DATA_ID,          // 리서치 도구들
  [ORPHAN_IDS.orphan3]: OLD_IDS.music,        // udio → music
  [ORPHAN_IDS.orphan4]: OLD_IDS.automation,   // make → automation
};

// === Step 1: categories 배열 업데이트 ===
console.log('=== Step 1: Updating categories array ===');

const removeSlugs = new Set(['voice', 'data-analysis', 'learning', 'entertainment']);

// research → data로 slug/name 변경
const newCategories = data.categories
  .filter(c => !removeSlugs.has(c.slug))
  .map(c => {
    if (c.slug === 'research') {
      return { ...c, slug: 'data', name: '데이터 · 리서치', description: '데이터 분석, 자료 조사, 논문 검색' };
    }
    if (c.slug === 'music') {
      return { ...c, name: '음악 · 오디오', description: '음악 생성, 음성 합성, 오디오 편집' };
    }
    if (c.slug === 'writing') {
      return { ...c, name: '글쓰기 · 문서 · 요약' };
    }
    if (c.slug === 'video') {
      return { ...c, name: '영상 · 콘텐츠 제작' };
    }
    if (c.slug === 'coding') {
      return { ...c, name: '코딩 · 개발' };
    }
    if (c.slug === 'automation') {
      return { ...c, name: '업무 자동화' };
    }
    if (c.slug === 'translation') {
      return { ...c, name: '번역 · 언어' };
    }
    if (c.slug === 'presentation') {
      return { ...c, name: '발표자료 · PPT' };
    }
    if (c.slug === 'marketing') {
      return { ...c, name: '마케팅 · 홍보' };
    }
    if (c.slug === 'building') {
      return { ...c, name: '서비스 · 제품 만들기' };
    }
    return c;
  });

console.log(`Categories: ${data.categories.length} → ${newCategories.length}`);
newCategories.forEach(c => console.log(`  ${c.slug} (${c.name})`));

// === Step 2: tool_categories 리매핑 ===
console.log('\n=== Step 2: Remapping tool_categories ===');

let remapped = 0;
let removed = 0;

const newToolCategories = [];
const seen = new Set(); // 중복 방지

for (const tc of data.tool_categories) {
  let catId = tc.category_id;

  // 리매핑 필요한 경우
  if (catId in REMAP) {
    const newId = REMAP[catId];
    if (newId === null) {
      removed++;
      continue; // learning 매핑 삭제
    }
    catId = newId;
    remapped++;
  }

  // 중복 체크 (같은 tool_id + category_id)
  const key = `${tc.tool_id}|${catId}`;
  if (seen.has(key)) {
    removed++;
    continue;
  }
  seen.add(key);

  newToolCategories.push({
    ...tc,
    category_id: catId,
  });
}

console.log(`tool_categories: ${data.tool_categories.length} → ${newToolCategories.length} (remapped: ${remapped}, removed: ${removed})`);

// === Step 3: tool.category_id 레거시 필드 업데이트 ===
console.log('\n=== Step 3: Updating tool.category_id ===');

const catIdMap = {};
for (const [oldId, newId] of Object.entries(REMAP)) {
  if (newId) catIdMap[oldId] = newId;
}

let toolUpdated = 0;
const newTools = data.tools.map(tool => {
  if (tool.category_id && tool.category_id in catIdMap) {
    toolUpdated++;
    return { ...tool, category_id: catIdMap[tool.category_id] };
  }
  return tool;
});

console.log(`Tools with category_id updated: ${toolUpdated}`);

// === Step 4: purpose_tool_recommendations 업데이트 ===
console.log('\n=== Step 4: Updating purpose_tool_recommendations ===');

// research → data, learning → chat
const purposeSlugRemap = {
  'research': 'data',
  'learning': 'chat',
};

let recUpdated = 0;
const newRecommendations = (data.purpose_tool_recommendations || []).map(rec => {
  if (rec.purpose_slug in purposeSlugRemap) {
    recUpdated++;
    return { ...rec, purpose_slug: purposeSlugRemap[rec.purpose_slug] };
  }
  return rec;
});

console.log(`Recommendations updated: ${recUpdated}`);

// === Write output ===
data.categories = newCategories;
data.tool_categories = newToolCategories;
data.tools = newTools;
data.purpose_tool_recommendations = newRecommendations;

writeFileSync(seedPath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
console.log('\n✅ seed.json updated successfully!');

// === Verification ===
console.log('\n=== Verification ===');
const validCatIds = new Set(newCategories.map(c => c.id));
const orphanedAfter = newToolCategories.filter(tc => !validCatIds.has(tc.category_id));
console.log(`Orphaned tool_categories after migration: ${orphanedAfter.length}`);
if (orphanedAfter.length > 0) {
  const orphanIds = [...new Set(orphanedAfter.map(tc => tc.category_id))];
  console.log(`  Orphan IDs: ${orphanIds.join(', ')}`);
}

// Count tools per category
console.log('\nTools per category:');
const countMap = {};
newToolCategories.forEach(tc => {
  countMap[tc.category_id] = (countMap[tc.category_id] || 0) + 1;
});
const catNameMap = {};
newCategories.forEach(c => { catNameMap[c.id] = c.slug; });
Object.entries(countMap)
  .sort((a, b) => b[1] - a[1])
  .forEach(([id, count]) => {
    console.log(`  ${catNameMap[id] || id}: ${count}`);
  });
