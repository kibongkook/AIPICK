#!/usr/bin/env node
/**
 * 기존 seed.json과 새로 수집한 AI 서비스 병합
 *
 * 기존: 119개
 * 신규: 178개
 * 목표: 중복 제거 후 최대한 많은 서비스 확보
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 파일 경로
const EXISTING_SEED_PATH = path.join(__dirname, '..', 'data', 'seed.json');
const NEW_TOOLS_PATH = path.join(__dirname, '..', 'data', 'ai-tools-500.json');
const OUTPUT_PATH = path.join(__dirname, '..', 'data', 'seed-merged.json');

function normalizeUrl(url) {
  try {
    const u = new URL(url);
    return u.hostname
      .toLowerCase()
      .replace(/^www\./, '')
      .replace(/\/$/, '');
  } catch {
    return url.toLowerCase();
  }
}

function normalizeName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

async function main() {
  console.log('🔄 기존 데이터와 신규 데이터 병합 시작...\n');

  // 1. 기존 seed.json 읽기
  console.log('📖 기존 seed.json 읽는 중...');
  const existingSeed = JSON.parse(fs.readFileSync(EXISTING_SEED_PATH, 'utf-8'));
  const existingTools = existingSeed.tools || [];
  console.log(`✅ 기존 도구: ${existingTools.length}개\n`);

  // 2. 신규 도구 읽기
  console.log('📖 신규 도구 읽는 중...');
  const newTools = JSON.parse(fs.readFileSync(NEW_TOOLS_PATH, 'utf-8'));
  console.log(`✅ 신규 도구: ${newTools.length}개\n`);

  // 3. 중복 체크 (URL과 이름 기반)
  console.log('🔍 중복 체크 중...');
  const existingUrls = new Set(existingTools.map(t => normalizeUrl(t.url)));
  const existingNames = new Set(existingTools.map(t => normalizeName(t.name)));

  const trulyNewTools = newTools.filter(newTool => {
    const urlNorm = normalizeUrl(newTool.url);
    const nameNorm = normalizeName(newTool.name);

    // URL 또는 이름이 이미 존재하면 중복
    if (existingUrls.has(urlNorm) || existingNames.has(nameNorm)) {
      return false;
    }

    return true;
  });

  console.log(`✅ 중복 제거 완료:`);
  console.log(`  - 중복 제거됨: ${newTools.length - trulyNewTools.length}개`);
  console.log(`  - 실제 신규: ${trulyNewTools.length}개\n`);

  // 4. ID 재할당 (기존 마지막 ID 다음부터)
  console.log('🔢 ID 재할당 중...');
  const lastExistingId = Math.max(...existingTools.map(t => {
    const match = t.id.match(/tool-(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }));

  const reassignedNewTools = trulyNewTools.map((tool, index) => ({
    ...tool,
    id: `tool-${lastExistingId + index + 1}`,
  }));

  console.log(`✅ ID 재할당 완료 (tool-${lastExistingId + 1} ~ tool-${lastExistingId + trulyNewTools.length})\n`);

  // 5. 병합
  console.log('🔗 병합 중...');
  const mergedTools = [...existingTools, ...reassignedNewTools];
  console.log(`✅ 병합 완료: 총 ${mergedTools.length}개\n`);

  // 6. seed.json 구조 유지하며 저장
  const mergedSeed = {
    ...existingSeed,
    tools: mergedTools,
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(mergedSeed, null, 2), 'utf-8');
  console.log(`💾 저장 완료: ${OUTPUT_PATH}\n`);

  // 7. 통계
  console.log('📊 최종 통계:');
  console.log(`  기존: ${existingTools.length}개`);
  console.log(`  신규: ${trulyNewTools.length}개`);
  console.log(`  합계: ${mergedTools.length}개`);

  // 카테고리별 분포
  const categoryCount = {};
  mergedTools.forEach(t => {
    categoryCount[t.category_id] = (categoryCount[t.category_id] || 0) + 1;
  });

  console.log('\n📁 카테고리별 분포:');
  Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
      const catName = cat.replace('cat-', '').replace(/-/g, ' ');
      console.log(`  ${catName}: ${count}개`);
    });

  console.log('\n✨ 완료!');
  console.log('\n다음 단계:');
  console.log('1. seed-merged.json 검토');
  console.log('2. cp data/seed-merged.json data/seed.json (백업 권장)');
  console.log('3. npm run build로 확인');
}

main().catch(console.error);
