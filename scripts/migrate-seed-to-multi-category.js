/**
 * Seed 데이터를 다중 카테고리 구조로 마이그레이션
 * - tools[].category_id → tool_categories[] 배열로 변환
 * - 기존 category_id는 primary category로 설정
 */

const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, '../data/seed.json');
const seed = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

console.log(`🔄 Migrating ${seed.tools.length} tools to multi-category structure...`);

// tool_categories 배열 생성
const toolCategories = [];

seed.tools.forEach(tool => {
  if (tool.category_id) {
    // 기존 category_id를 primary category로 추가
    toolCategories.push({
      tool_id: tool.id,
      category_id: tool.category_id,
      is_primary: true,
      sort_order: 0,
      created_at: tool.created_at || new Date().toISOString()
    });

    // 특정 도구에 추가 카테고리 매핑 (수동으로 추가할 수 있음)
    const additionalCategories = getAdditionalCategories(tool);
    additionalCategories.forEach((categoryId, index) => {
      toolCategories.push({
        tool_id: tool.id,
        category_id: categoryId,
        is_primary: false,
        sort_order: index + 1,
        created_at: tool.created_at || new Date().toISOString()
      });
    });

    // tools에서 category_id 제거 (주석처리만)
    // delete tool.category_id;
  }
});

// seed.json에 tool_categories 추가
seed.tool_categories = toolCategories;

// 백업 생성
const backupPath = path.join(__dirname, '../data/seed.backup.json');
if (!fs.existsSync(backupPath)) {
  fs.writeFileSync(backupPath, JSON.stringify(seed, null, 2));
  console.log('✅ Backup created:', backupPath);
}

// 업데이트된 seed.json 저장
fs.writeFileSync(seedPath, JSON.stringify(seed, null, 2));
console.log('✅ Updated seed.json with tool_categories array');
console.log(`📊 Created ${toolCategories.length} tool-category mappings`);

/**
 * 특정 도구에 추가 카테고리를 매핑 (수동 정의)
 * @param {Object} tool
 * @returns {Array<string>} category IDs
 */
function getAdditionalCategories(tool) {
  const additionalCategories = [];

  // 카테고리 ID 상수
  const CATEGORIES = {
    chat: 'e052e3cb-1613-4dc3-95c9-8fb66fa1bda8',
    writing: '7fbbbeb2-d3c7-4920-af6b-4680f78f1a61',
    translation: '5025a911-0505-4394-a778-587445327ade',
    voice: 'abdcd10c-02d6-4830-bb06-f0db65093353',
    design: '63191d5a-af82-4c95-b7b6-ebb1cb5e33d3',
    video: 'a0a4d567-c8a5-4b6f-b135-b13b558b6e6f',
    automation: 'd83f8a62-2f56-43a6-8c8b-3f40c4d8f6d0',
    coding: 'e9f8c3a1-4b6d-4f2e-9c5a-7e8d9f0a1b2c',
    research: 'f1a2b3c4-5d6e-4f7a-8b9c-0d1e2f3a4b5c',
    learning: 'a1b2c3d4-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
    marketing: 'b2c3d4e5-6f7a-4b8c-9d0e-1f2a3b4c5d6e',
    music: 'c3d4e5f6-7a8b-4c9d-0e1f-2a3b4c5d6e7f'
  };

  // 도구별 추가 카테고리 정의
  const multiCategoryTools = {
    'ChatGPT': [CATEGORIES.writing, CATEGORIES.coding, CATEGORIES.research],
    'Claude': [CATEGORIES.writing, CATEGORIES.coding, CATEGORIES.research],
    'Gemini': [CATEGORIES.writing, CATEGORIES.coding, CATEGORIES.research],
    'Copilot': [CATEGORIES.writing, CATEGORIES.research],
    'Perplexity': [CATEGORIES.research],
    'Notion AI': [CATEGORIES.writing],
    'Midjourney': [CATEGORIES.design],
    'DALL-E': [CATEGORIES.design],
    'Stable Diffusion': [CATEGORIES.design],
    'Leonardo AI': [CATEGORIES.design],
    'Runway': [CATEGORIES.video],
    'Synthesia': [CATEGORIES.video],
    'ElevenLabs': [CATEGORIES.voice],
    'Descript': [CATEGORIES.video, CATEGORIES.voice],
    'Canva': [CATEGORIES.design, CATEGORIES.marketing],
    'Gamma': [CATEGORIES.design],
    'Beautiful.ai': [CATEGORIES.design],
    'Zapier': [CATEGORIES.automation],
    'Make': [CATEGORIES.automation],
    'GitHub Copilot': [CATEGORIES.coding],
    'Cursor': [CATEGORIES.coding],
    'Replit': [CATEGORIES.coding],
    'v0': [CATEGORIES.coding],
    'Bolt': [CATEGORIES.coding],
    'Wordtune': [CATEGORIES.writing],
    'Grammarly': [CATEGORIES.writing],
    'QuillBot': [CATEGORIES.writing, CATEGORIES.translation],
    'DeepL': [CATEGORIES.translation],
    'Papago': [CATEGORIES.translation],
    'Duolingo': [CATEGORIES.learning, CATEGORIES.translation],
    'Khan Academy': [CATEGORIES.learning],
    'Suno': [CATEGORIES.music],
    'Udio': [CATEGORIES.music]
  };

  if (multiCategoryTools[tool.name]) {
    multiCategoryTools[tool.name].forEach(categoryId => {
      // primary category가 아닌 경우만 추가
      if (categoryId !== tool.category_id) {
        additionalCategories.push(categoryId);
      }
    });
  }

  return additionalCategories;
}
