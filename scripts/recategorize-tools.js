/**
 * AI 서비스 카테고리 재분류
 * 10개 → 16개 카테고리로 세분화
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SEED_PATH = path.join(__dirname, '../data/seed.json');
const OUTPUT_PATH = path.join(__dirname, '../data/seed.json');

// 새로운 카테고리 정의
const NEW_CATEGORIES = [
  {
    slug: 'chat',
    name: '대화형 AI',
    description: 'ChatGPT, Claude 등 범용 AI 챗봇',
    icon: '💬',
    order: 1,
  },
  {
    slug: 'writing',
    name: '글쓰기 · 문서 작성',
    description: '블로그, 보고서, 노트 작성',
    icon: '✍️',
    order: 2,
  },
  {
    slug: 'translation',
    name: '번역',
    description: '다국어 번역 및 언어 학습',
    icon: '🌍',
    order: 3,
  },
  {
    slug: 'voice',
    name: '음성 AI',
    description: 'TTS, STT, 음성 클로닝',
    icon: '🎤',
    order: 4,
  },
  {
    slug: 'design',
    name: '디자인 · 이미지',
    description: '로고, 썸네일, 일러스트 생성',
    icon: '🎨',
    order: 5,
  },
  {
    slug: 'video',
    name: '영상 생성 · 편집',
    description: '영상 제작, 편집, AI 아바타',
    icon: '🎬',
    order: 6,
  },
  {
    slug: 'music',
    name: '음악 생성',
    description: 'AI 음악, 배경음, 효과음 제작',
    icon: '🎵',
    order: 7,
  },
  {
    slug: 'coding',
    name: '코딩 · 개발',
    description: '코드 생성, 디버깅, 리뷰',
    icon: '💻',
    order: 8,
  },
  {
    slug: 'automation',
    name: '업무 자동화',
    description: '반복 작업 줄이고 효율 높이기',
    icon: '⚡',
    order: 9,
  },
  {
    slug: 'data-analysis',
    name: '데이터 분석',
    description: 'BI, 데이터 시각화, 분석',
    icon: '📊',
    order: 10,
  },
  {
    slug: 'research',
    name: '조사 · 리서치',
    description: '정보 검색, 자료 조사',
    icon: '🔍',
    order: 11,
  },
  {
    slug: 'presentation',
    name: '발표자료 · PPT',
    description: '슬라이드, 프레젠테이션 자동 생성',
    icon: '📊',
    order: 12,
  },
  {
    slug: 'marketing',
    name: '마케팅 · 홍보',
    description: 'SNS, 광고, SEO, 카피라이팅',
    icon: '📢',
    order: 13,
  },
  {
    slug: 'building',
    name: '서비스 · 제품 만들기',
    description: '프로토타입, MVP, 노코드 개발',
    icon: '🏗️',
    order: 14,
  },
  {
    slug: 'learning',
    name: '교육 · 학습',
    description: '학습 도구, 과제 도우미',
    icon: '📚',
    order: 15,
  },
  {
    slug: 'entertainment',
    name: '엔터테인먼트',
    description: '게임, 대화, 재미',
    icon: '🎮',
    order: 16,
  },
];

// 도구별 새 카테고리 매핑
const TOOL_CATEGORY_MAPPING = {
  // 대화형 AI (chat)
  'chatgpt': 'chat',
  'claude': 'chat',
  'gemini': 'chat',
  'wrtn': 'chat',
  'microsoft-copilot': 'chat',
  'grok': 'chat',
  'poe': 'chat',
  'huggingchat': 'chat',
  'you-com': 'chat',
  'coze': 'chat',
  'dwijibgi': 'chat',
  'kimi': 'chat',
  'perplexity': 'chat',

  // 글쓰기 (writing)
  'notion-ai': 'writing',
  'grammarly': 'writing',
  'wordtune': 'writing',
  'sudowrite': 'writing',
  'lex': 'writing',
  'perplexity-pages': 'writing',
  'quillbot': 'writing',

  // 번역 (translation)
  'deepl': 'translation',
  'papago': 'translation',
  'google-translate': 'translation',
  'deepl-write': 'translation',
  'flitto': 'translation',
  'smartcat': 'translation',
  'lingva-translate': 'translation',
  'itranslate': 'translation',

  // 음성 AI (voice)
  'elevenlabs': 'voice',
  'otter-ai': 'voice',
  'fireflies-ai': 'voice',
  'tldv': 'voice',
  'clova-note': 'voice',
  'typecast': 'voice',

  // 디자인 (design) - 유지
  'midjourney': 'design',
  'dall-e-3': 'design',
  'stable-diffusion': 'design',
  'leonardo-ai': 'design',
  'ideogram': 'design',
  'adobe-firefly': 'design',
  'krea-ai': 'design',
  'playground-ai': 'design',
  'bing-image-creator': 'design',
  'flux': 'design',
  'remove-bg': 'design',
  'photoroom': 'design',
  'clipdrop': 'design',
  'canva-ai': 'design',

  // 영상 (video)
  'runway-ml': 'video',
  'capcut': 'video',
  'vrew': 'video',
  'pika': 'video',
  'sora': 'video',
  'luma-dream-machine': 'video',
  'kling-ai': 'video',
  'heygen': 'video',
  'synthesia': 'video',
  'd-id': 'video',
  'descript': 'video',
  'opus-clip': 'video',
  'fliki': 'video',
  'invideo-ai': 'video',
  'topaz-video-ai': 'video',

  // 음악 (music)
  'suno-ai': 'music',
  'udio': 'music',
  'aiva': 'music',
  'mubert': 'music',
  'soundraw': 'music',
  'boomy': 'music',
  'soundful': 'music',
  'beatoven-ai': 'music',
  'loudly': 'music',

  // 코딩 (coding) - 유지
  'github-copilot': 'coding',
  'cursor': 'coding',
  'tabnine': 'coding',
  'windsurf': 'coding',
  'amazon-q-developer': 'coding',
  'continue': 'coding',
  'pieces': 'coding',
  'cody': 'coding',
  'blackbox-ai': 'coding',
  'devin': 'coding',
  'claude-code': 'coding',

  // 업무 자동화 (automation) - 유지
  'zapier-ai': 'automation',
  'make': 'automation',
  'loom-ai': 'automation',
  'miro-ai': 'automation',
  'tally': 'automation',
  'scribe': 'automation',
  'reclaim-ai': 'automation',
  'superhuman': 'automation',
  'coda-ai': 'automation',
  'mem-ai': 'automation',
  'krisp': 'automation',

  // 데이터 분석 (data-analysis)
  'tableau': 'data-analysis',
  'power-bi': 'data-analysis',
  'rows-ai': 'data-analysis',
  'obviously-ai': 'data-analysis',
  'monkeylearn': 'data-analysis',
  'hex': 'data-analysis',

  // 조사 · 리서치 (research)
  'julius-ai': 'research',
  'google-notebooklm': 'research',

  // 발표자료 (presentation) - 유지
  'gamma': 'presentation',
  'beautiful-ai': 'presentation',
  'slidesai': 'presentation',
  'tome': 'presentation',
  'prezi-ai': 'presentation',
  'napkin-ai': 'presentation',

  // 마케팅 (marketing) - 유지
  'jasper': 'marketing',
  'copy-ai': 'marketing',
  'writesonic': 'marketing',
  'rytr': 'marketing',
  'typeform': 'marketing',

  // 서비스 만들기 (building) - 유지
  'replit': 'building',
  'bolt-new': 'building',
  'v0': 'building',
  'lovable': 'building',
  'whimsical-ai': 'building',

  // 엔터테인먼트 (entertainment)
  'character-ai': 'entertainment',
};

function main() {
  console.log('🔧 카테고리 재분류 시작\n');

  const data = JSON.parse(fs.readFileSync(SEED_PATH, 'utf-8'));

  // 1. 새로운 카테고리 생성
  console.log('📂 새 카테고리 생성 중...');
  const categoryMap = {};

  data.categories = NEW_CATEGORIES.map(cat => {
    const id = crypto.randomUUID();
    categoryMap[cat.slug] = id;
    return {
      id,
      slug: cat.slug,
      name: cat.name,
      description: cat.description,
      icon: cat.icon,
      order: cat.order,
      created_at: new Date().toISOString(),
    };
  });

  console.log(`✅ ${data.categories.length}개 카테고리 생성 완료\n`);

  // 2. 도구들 재분류
  console.log('🔄 도구 재분류 중...');
  let updated = 0;
  let notMapped = [];

  data.tools.forEach(tool => {
    const newCategorySlug = TOOL_CATEGORY_MAPPING[tool.slug];
    if (newCategorySlug) {
      const newCategoryId = categoryMap[newCategorySlug];
      if (newCategoryId) {
        tool.category_id = newCategoryId;
        updated++;
      } else {
        console.error(`❌ 카테고리 ID를 찾을 수 없음: ${newCategorySlug}`);
        notMapped.push(tool.slug);
      }
    } else {
      console.warn(`⚠️  매핑 없음: ${tool.name} (${tool.slug})`);
      notMapped.push(tool.slug);
    }
  });

  console.log(`\n📊 결과:`);
  console.log(`   재분류 완료: ${updated}개`);
  console.log(`   매핑 없음: ${notMapped.length}개`);

  if (notMapped.length > 0) {
    console.log(`\n⚠️  매핑되지 않은 도구들:`);
    notMapped.forEach(slug => {
      const tool = data.tools.find(t => t.slug === slug);
      console.log(`   - ${tool.name} (${slug})`);
    });
  }

  // 3. 카테고리별 통계
  console.log(`\n📈 카테고리별 도구 수:`);
  data.categories.forEach(cat => {
    const count = data.tools.filter(t => t.category_id === cat.id).length;
    console.log(`   ${count.toString().padStart(3)}개 - ${cat.name} (${cat.slug})`);
  });

  // 4. 저장
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`\n💾 저장 완료: ${OUTPUT_PATH}`);
}

main();
