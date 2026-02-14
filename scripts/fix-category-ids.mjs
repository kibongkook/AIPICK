#!/usr/bin/env node
/**
 * cat- 접두사 category_id를 UUID 기반으로 변환
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SEED_PATH = path.join(__dirname, '..', 'data', 'seed.json');
const AI_TOOLS_PATH = path.join(__dirname, '..', 'data', 'ai-tools-500.json');

// slug → UUID 매핑 테이블
const CATEGORY_MAP = {
  'cat-chat': 'e052e3cb-1613-4dc3-95c9-8fb66fa1bda8',
  'cat-general-ai': 'e052e3cb-1613-4dc3-95c9-8fb66fa1bda8', // chat과 동일
  'cat-text-generation': 'e052e3cb-1613-4dc3-95c9-8fb66fa1bda8', // chat과 동일
  'cat-writing': '7fbbbeb2-d3c7-4920-af6b-4680f78f1a61',
  'cat-translation': '5025a911-0505-4394-a778-587445327ade',
  'cat-voice': 'abdcd10c-02d6-4830-bb06-f0db65093353',
  'cat-design': '63191d5a-af82-4c95-b7b6-ebb1cb5e33d3',
  'cat-image-generation': '63191d5a-af82-4c95-b7b6-ebb1cb5e33d3', // design과 동일
  'cat-video': 'a0a4d567-c8a5-4b6f-b135-b13b558b6e6f',
  'cat-video-generation': 'a0a4d567-c8a5-4b6f-b135-b13b558b6e6f', // video와 동일
  'cat-video-editing': 'a0a4d567-c8a5-4b6f-b135-b13b558b6e6f', // video와 동일
  'cat-music': '61b550b2-1563-407b-a059-b8957ba0fa5d',
  'cat-coding': '118a92a9-2e3e-490a-a5ca-059026ceb89c',
  'cat-coding-tools': '118a92a9-2e3e-490a-a5ca-059026ceb89c', // coding과 동일
  'cat-automation': 'b4c4412f-805c-409b-8cd4-de074f47ee58',
  'cat-data': 'ca1a1250-a8e3-4dd6-8994-bda300aec46a',
  'cat-data-analysis': 'ca1a1250-a8e3-4dd6-8994-bda300aec46a', // data와 동일
  'cat-research': '8dc40214-996b-401f-a8bd-fead730c4292',
  'cat-marketing': '0e430c24-8bfa-479d-a1aa-d99aefdee380',
  'cat-learning': '1e245fcd-2d55-4e02-89a1-1ed651d38aaf',
  'cat-presentation': 'c1670373-b4fb-4222-be2b-b490f7895d24',
  'cat-entertainment': '98d51ac5-bd69-45f6-8651-48346755cfc6',
};

async function main() {
  console.log('🔧 category_id 변환 시작...\n');

  // 1. 기존 seed.json에서 카테고리 목록 확인
  const seed = JSON.parse(fs.readFileSync(SEED_PATH, 'utf-8'));
  console.log('📂 기존 카테고리:');
  seed.categories.forEach(cat => {
    console.log(`  ${cat.slug} → ${cat.id}`);
  });
  console.log();

  // 2. ai-tools-500.json 읽기
  const newTools = JSON.parse(fs.readFileSync(AI_TOOLS_PATH, 'utf-8'));
  console.log(`📖 신규 도구: ${newTools.length}개\n`);

  // 3. category_id 변환
  console.log('🔄 category_id 변환 중...');
  let fixedCount = 0;
  let unknownCategories = new Set();

  const fixedTools = newTools.map(tool => {
    if (tool.category_id.startsWith('cat-')) {
      const uuid = CATEGORY_MAP[tool.category_id];
      if (uuid) {
        fixedCount++;
        return {
          ...tool,
          category_id: uuid,
        };
      } else {
        unknownCategories.add(tool.category_id);
        // 기본값: chat 카테고리
        return {
          ...tool,
          category_id: 'e052e3cb-1613-4dc3-95c9-8fb66fa1bda8',
        };
      }
    }
    return tool;
  });

  console.log(`✅ 변환 완료: ${fixedCount}개`);

  if (unknownCategories.size > 0) {
    console.log(`⚠️  알 수 없는 카테고리: ${Array.from(unknownCategories).join(', ')}`);
  }
  console.log();

  // 4. 저장
  fs.writeFileSync(AI_TOOLS_PATH, JSON.stringify(fixedTools, null, 2), 'utf-8');
  console.log(`💾 저장 완료: ${AI_TOOLS_PATH}\n`);

  // 5. 카테고리별 분포
  const categoryCount = {};
  fixedTools.forEach(t => {
    categoryCount[t.category_id] = (categoryCount[t.category_id] || 0) + 1;
  });

  console.log('📊 카테고리별 분포:');
  Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .forEach(([catId, count]) => {
      const cat = seed.categories.find(c => c.id === catId);
      const name = cat ? cat.name : 'Unknown';
      console.log(`  ${name}: ${count}개`);
    });

  console.log('\n✨ 완료!');
  console.log('\n다음 단계: node scripts/merge-with-existing.mjs');
}

main().catch(console.error);
