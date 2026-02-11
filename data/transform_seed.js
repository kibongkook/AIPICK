/**
 * Transformation script to migrate seed.json from old 9-category system
 * to new 10 purpose-based category system.
 *
 * Changes:
 * 1. Replace categories array with 10 new purpose-based categories
 * 2. Update all tool category_ids (basic mapping + intelligent remapping)
 * 3. Replace job_categories with user_types
 * 4. Set edu_levels to empty array
 * 5. Replace job_tool_recommendations with purpose_tool_recommendations
 * 6. Set edu_tool_recommendations to empty array
 * 7. Update category_showcases slug references
 */

const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, 'seed.json');
const data = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

console.log(`Original tool count: ${data.tools.length}`);
console.log(`Original categories: ${data.categories.length}`);

// ============================================================
// 1. NEW CATEGORIES
// ============================================================
const newCategories = [
  { id: "cat-writing", name: "글쓰기 · 문서 · 요약", slug: "writing", icon: "PenTool", description: "블로그, 보고서, 번역, 요약까지", color: "from-blue-500 to-blue-600", sort_order: 0 },
  { id: "cat-design", name: "디자인 · 이미지", slug: "design", icon: "Image", description: "로고, 썸네일, 일러스트 생성", color: "from-purple-500 to-pink-600", sort_order: 1 },
  { id: "cat-video", name: "영상 · 콘텐츠 제작", slug: "video", icon: "Video", description: "영상 편집, 자막, 음악까지", color: "from-red-500 to-orange-600", sort_order: 2 },
  { id: "cat-automation", name: "업무 자동화", slug: "automation", icon: "Zap", description: "반복 작업 줄이고 효율 높이기", color: "from-amber-500 to-yellow-600", sort_order: 3 },
  { id: "cat-coding", name: "코딩 · 개발", slug: "coding", icon: "Code", description: "코드 생성, 디버깅, 리뷰", color: "from-emerald-500 to-teal-600", sort_order: 4 },
  { id: "cat-research", name: "조사 · 리서치", slug: "research", icon: "Search", description: "자료 조사, 논문 분석, 정리", color: "from-cyan-500 to-blue-600", sort_order: 5 },
  { id: "cat-learning", name: "학습 · 공부", slug: "learning", icon: "GraduationCap", description: "과제, 시험 준비, 언어 학습", color: "from-indigo-500 to-purple-600", sort_order: 6 },
  { id: "cat-presentation", name: "발표자료 · PPT", slug: "presentation", icon: "Presentation", description: "슬라이드, 프레젠테이션 자동 생성", color: "from-pink-500 to-rose-600", sort_order: 7 },
  { id: "cat-marketing", name: "마케팅 · 홍보", slug: "marketing", icon: "Megaphone", description: "SNS, 광고, SEO, 카피라이팅", color: "from-orange-500 to-red-600", sort_order: 8 },
  { id: "cat-building", name: "서비스 · 제품 만들기", slug: "building", icon: "Rocket", description: "프로토타입, MVP, 노코드 개발", color: "from-violet-500 to-indigo-600", sort_order: 9 }
];

// ============================================================
// 2. CATEGORY ID MAPPING
// ============================================================

// Basic mapping (old category_id -> new category_id)
const basicMapping = {
  "cat-general-ai": "cat-writing",
  "cat-text-gen": "cat-writing",
  "cat-image-gen": "cat-design",
  "cat-video-edit": "cat-video",
  "cat-coding": "cat-coding",
  "cat-music-gen": "cat-video",
  "cat-data": "cat-research",
  "cat-translation": "cat-writing",
  "cat-others": "cat-automation"  // default for cat-others
};

// Intelligent remapping overrides (tool_id -> new category_id)
const intelligentOverrides = {
  // cat-others tools with specific remapping
  "550e8400-e29b-41d4-a716-446655440051": "cat-presentation",   // Gamma → presentation (PPT)
  "550e8400-e29b-41d4-a716-446655440071": "cat-design",         // Canva AI → design
  "550e8400-e29b-41d4-a716-446655440072": "cat-automation",     // Zapier AI → automation
  "550e8400-e29b-41d4-a716-446655440210": "cat-automation",     // Make → automation
  "550e8400-e29b-41d4-a716-446655440211": "cat-automation",     // Loom AI → automation (productivity)
  "550e8400-e29b-41d4-a716-446655440212": "cat-automation",     // Miro AI → automation (collaboration)
  "550e8400-e29b-41d4-a716-446655440213": "cat-automation",     // Tally → automation (forms)
  "550e8400-e29b-41d4-a716-446655440214": "cat-marketing",      // Typeform → marketing (surveys)
  "550e8400-e29b-41d4-a716-446655440215": "cat-automation",     // Scribe → automation (process docs)
  "550e8400-e29b-41d4-a716-446655440216": "cat-automation",     // Reclaim AI → automation (scheduling)
  "550e8400-e29b-41d4-a716-446655440217": "cat-automation",     // Superhuman → automation (email)
  "550e8400-e29b-41d4-a716-446655440218": "cat-writing",        // Lex → writing (AI writing editor)
  "550e8400-e29b-41d4-a716-446655440220": "cat-automation",     // Coda AI → automation (doc automation)
  "550e8400-e29b-41d4-a716-446655440221": "cat-automation",     // Mem AI → automation (notes)
  "550e8400-e29b-41d4-a716-446655440222": "cat-presentation",   // Napkin AI → presentation (diagrams)
  "550e8400-e29b-41d4-a716-446655440223": "cat-building",       // Whimsical AI → building (wireframes)
  "550e8400-e29b-41d4-a716-446655440224": "cat-automation",     // Krisp → automation (meeting tool)

  // cat-data tools that are actually presentation tools
  "550e8400-e29b-41d4-a716-446655440193": "cat-presentation",   // Beautiful.ai → presentation
  "550e8400-e29b-41d4-a716-446655440194": "cat-presentation",   // SlidesAI → presentation
  "550e8400-e29b-41d4-a716-446655440195": "cat-presentation",   // Tome → presentation
  "550e8400-e29b-41d4-a716-446655440196": "cat-presentation",   // Prezi AI → presentation

  // cat-general-ai tool that should be research
  "550e8400-e29b-41d4-a716-446655440190": "cat-research",       // Google NotebookLM → research

  // Perplexity should be research (it's a search/research tool)
  "550e8400-e29b-41d4-a716-446655440004": "cat-research",       // Perplexity → research

  // Perplexity Pages should stay writing
  "550e8400-e29b-41d4-a716-446655440219": "cat-writing",        // Perplexity Pages → writing
};

// Apply category_id updates to all tools
let changeCount = 0;
data.tools.forEach(tool => {
  const override = intelligentOverrides[tool.id];
  if (override) {
    if (tool.category_id !== override) changeCount++;
    tool.category_id = override;
  } else {
    const mapped = basicMapping[tool.category_id];
    if (mapped) {
      if (tool.category_id !== mapped) changeCount++;
      tool.category_id = mapped;
    }
  }
});

console.log(`Category IDs updated: ${changeCount} tools changed`);

// Replace categories
data.categories = newCategories;

// ============================================================
// 3. USER TYPES (replacing job_categories)
// ============================================================
const userTypes = [
  { id: "ut-beginner", name: "완전 처음이에요", slug: "beginner", icon: "Sparkles", description: "AI를 처음 써보는 분", group: "skill", sort_order: 0 },
  { id: "ut-intermediate", name: "조금 써봤어요", slug: "intermediate", icon: "Zap", description: "기본은 알지만 더 잘 쓰고 싶은 분", group: "skill", sort_order: 1 },
  { id: "ut-daily-user", name: "업무에 자주 써요", slug: "daily-user", icon: "Briefcase", description: "매일 업무에 AI를 활용하는 분", group: "skill", sort_order: 2 },
  { id: "ut-expert", name: "전문가 · 고급", slug: "expert", icon: "Crown", description: "AI를 깊이 있게 활용하는 분", group: "skill", sort_order: 3 },
  { id: "ut-student", name: "학생", slug: "student", icon: "GraduationCap", description: "중·고·대학생", group: "role", sort_order: 4 },
  { id: "ut-teacher", name: "선생님 · 강사", slug: "teacher", icon: "Users", description: "교사, 교수, 학원 강사", group: "role", sort_order: 5 },
  { id: "ut-parent", name: "학부모", slug: "parent", icon: "Heart", description: "자녀 교육에 AI를 활용하는 분", group: "role", sort_order: 6 },
  { id: "ut-freelancer", name: "1인 사업자 · 프리랜서", slug: "freelancer", icon: "User", description: "혼자서 다 해야 하는 분", group: "role", sort_order: 7 },
  { id: "ut-team", name: "팀 · 회사", slug: "team", icon: "Building", description: "팀 단위로 AI를 도입하는 분", group: "role", sort_order: 8 }
];

data.user_types = userTypes;
delete data.job_categories;

// ============================================================
// 4. EMPTY edu_levels
// ============================================================
data.edu_levels = [];

// ============================================================
// 5. PURPOSE TOOL RECOMMENDATIONS (replacing job_tool_recommendations)
// ============================================================
const purposeToolRecommendations = [
  // ---- writing x beginner ----
  { id: "ptr-writing-beginner-1", purpose_slug: "writing", user_type_slug: "beginner", tool_id: "550e8400-e29b-41d4-a716-446655440001", recommendation_level: "essential", reason: "가장 쉽고 범용적인 AI 글쓰기 도구, 한국어 지원 우수", sort_order: 0, is_killer_pick: true },
  { id: "ptr-writing-beginner-2", purpose_slug: "writing", user_type_slug: "beginner", tool_id: "550e8400-e29b-41d4-a716-446655440002", recommendation_level: "essential", reason: "긴 글 작성과 문서 분석에 탁월한 성능", sort_order: 1, is_killer_pick: true },
  { id: "ptr-writing-beginner-3", purpose_slug: "writing", user_type_slug: "beginner", tool_id: "550e8400-e29b-41d4-a716-446655440070", recommendation_level: "recommended", reason: "한국어에 특화된 AI, 템플릿으로 쉽게 시작 가능", sort_order: 2, is_killer_pick: false },
  { id: "ptr-writing-beginner-4", purpose_slug: "writing", user_type_slug: "beginner", tool_id: "550e8400-e29b-41d4-a716-446655440113", recommendation_level: "recommended", reason: "영어 글쓰기 교정에 최적, 문법·스타일 자동 수정", sort_order: 3, is_killer_pick: false },
  { id: "ptr-writing-beginner-5", purpose_slug: "writing", user_type_slug: "beginner", tool_id: "550e8400-e29b-41d4-a716-446655440114", recommendation_level: "optional", reason: "문장 다듬기와 패러프레이징에 유용", sort_order: 4, is_killer_pick: false },

  // ---- writing x daily-user ----
  { id: "ptr-writing-daily-1", purpose_slug: "writing", user_type_slug: "daily-user", tool_id: "550e8400-e29b-41d4-a716-446655440002", recommendation_level: "essential", reason: "업무 보고서, 기획서, 이메일 작성에 가장 정확한 AI", sort_order: 0, is_killer_pick: true },
  { id: "ptr-writing-daily-2", purpose_slug: "writing", user_type_slug: "daily-user", tool_id: "550e8400-e29b-41d4-a716-446655440005", recommendation_level: "essential", reason: "Notion 내에서 바로 글 작성·요약·번역 가능", sort_order: 1, is_killer_pick: true },
  { id: "ptr-writing-daily-3", purpose_slug: "writing", user_type_slug: "daily-user", tool_id: "550e8400-e29b-41d4-a716-446655440110", recommendation_level: "recommended", reason: "마케팅 카피, 블로그 글 대량 생성에 효율적", sort_order: 2, is_killer_pick: false },
  { id: "ptr-writing-daily-4", purpose_slug: "writing", user_type_slug: "daily-user", tool_id: "550e8400-e29b-41d4-a716-446655440218", recommendation_level: "recommended", reason: "집중 글쓰기 환경과 AI 편집 지원", sort_order: 3, is_killer_pick: false },
  { id: "ptr-writing-daily-5", purpose_slug: "writing", user_type_slug: "daily-user", tool_id: "550e8400-e29b-41d4-a716-446655440060", recommendation_level: "recommended", reason: "전문 번역 품질, 업무용 다국어 문서 작성에 필수", sort_order: 4, is_killer_pick: false },
  { id: "ptr-writing-daily-6", purpose_slug: "writing", user_type_slug: "daily-user", tool_id: "550e8400-e29b-41d4-a716-446655440116", recommendation_level: "optional", reason: "회의록 자동 작성으로 업무 시간 절약", sort_order: 5, is_killer_pick: false },

  // ---- writing x student ----
  { id: "ptr-writing-student-1", purpose_slug: "writing", user_type_slug: "student", tool_id: "550e8400-e29b-41d4-a716-446655440001", recommendation_level: "essential", reason: "리포트, 에세이 초안 작성과 아이디어 정리에 최적", sort_order: 0, is_killer_pick: true },
  { id: "ptr-writing-student-2", purpose_slug: "writing", user_type_slug: "student", tool_id: "550e8400-e29b-41d4-a716-446655440113", recommendation_level: "essential", reason: "영어 과제 문법 교정과 글쓰기 실력 향상", sort_order: 1, is_killer_pick: true },
  { id: "ptr-writing-student-3", purpose_slug: "writing", user_type_slug: "student", tool_id: "550e8400-e29b-41d4-a716-446655440060", recommendation_level: "recommended", reason: "외국어 자료 번역과 다국어 과제 작성 지원", sort_order: 2, is_killer_pick: false },

  // ---- design x beginner ----
  { id: "ptr-design-beginner-1", purpose_slug: "design", user_type_slug: "beginner", tool_id: "550e8400-e29b-41d4-a716-446655440071", recommendation_level: "essential", reason: "디자인 경험 없어도 템플릿으로 전문가급 결과물 가능", sort_order: 0, is_killer_pick: true },
  { id: "ptr-design-beginner-2", purpose_slug: "design", user_type_slug: "beginner", tool_id: "550e8400-e29b-41d4-a716-446655440011", recommendation_level: "essential", reason: "텍스트만 입력하면 이미지 생성, ChatGPT에서 바로 사용", sort_order: 1, is_killer_pick: true },
  { id: "ptr-design-beginner-3", purpose_slug: "design", user_type_slug: "beginner", tool_id: "550e8400-e29b-41d4-a716-446655440135", recommendation_level: "recommended", reason: "무료로 쉽게 이미지 생성, 별도 설치 불필요", sort_order: 2, is_killer_pick: false },
  { id: "ptr-design-beginner-4", purpose_slug: "design", user_type_slug: "beginner", tool_id: "550e8400-e29b-41d4-a716-446655440137", recommendation_level: "recommended", reason: "배경 제거 한 번에 해결, 초보자도 쉽게 사용", sort_order: 3, is_killer_pick: false },
  { id: "ptr-design-beginner-5", purpose_slug: "design", user_type_slug: "beginner", tool_id: "550e8400-e29b-41d4-a716-446655440131", recommendation_level: "optional", reason: "텍스트가 포함된 이미지 생성에 강점", sort_order: 4, is_killer_pick: false },

  // ---- design x freelancer ----
  { id: "ptr-design-freelancer-1", purpose_slug: "design", user_type_slug: "freelancer", tool_id: "550e8400-e29b-41d4-a716-446655440010", recommendation_level: "essential", reason: "최고 품질 이미지 생성, 포트폴리오급 결과물", sort_order: 0, is_killer_pick: true },
  { id: "ptr-design-freelancer-2", purpose_slug: "design", user_type_slug: "freelancer", tool_id: "550e8400-e29b-41d4-a716-446655440071", recommendation_level: "essential", reason: "SNS 콘텐츠, 로고, 배너 한 번에 제작", sort_order: 1, is_killer_pick: true },
  { id: "ptr-design-freelancer-3", purpose_slug: "design", user_type_slug: "freelancer", tool_id: "550e8400-e29b-41d4-a716-446655440132", recommendation_level: "recommended", reason: "상업적 사용 안전한 이미지 생성, Adobe 생태계 연동", sort_order: 2, is_killer_pick: false },
  { id: "ptr-design-freelancer-4", purpose_slug: "design", user_type_slug: "freelancer", tool_id: "550e8400-e29b-41d4-a716-446655440130", recommendation_level: "recommended", reason: "다양한 스타일의 고품질 이미지 생성 가능", sort_order: 3, is_killer_pick: false },
  { id: "ptr-design-freelancer-5", purpose_slug: "design", user_type_slug: "freelancer", tool_id: "550e8400-e29b-41d4-a716-446655440138", recommendation_level: "optional", reason: "제품 사진 배경 교체, 이커머스 상품 이미지 제작", sort_order: 4, is_killer_pick: false },

  // ---- video x beginner ----
  { id: "ptr-video-beginner-1", purpose_slug: "video", user_type_slug: "beginner", tool_id: "550e8400-e29b-41d4-a716-446655440021", recommendation_level: "essential", reason: "무료에 직관적인 영상 편집, 자동 자막 기능 포함", sort_order: 0, is_killer_pick: true },
  { id: "ptr-video-beginner-2", purpose_slug: "video", user_type_slug: "beginner", tool_id: "550e8400-e29b-41d4-a716-446655440022", recommendation_level: "essential", reason: "AI 자막과 편집 기능으로 초보자도 쉽게 영상 제작", sort_order: 1, is_killer_pick: true },
  { id: "ptr-video-beginner-3", purpose_slug: "video", user_type_slug: "beginner", tool_id: "550e8400-e29b-41d4-a716-446655440150", recommendation_level: "recommended", reason: "텍스트만 입력하면 영상 자동 생성", sort_order: 2, is_killer_pick: false },
  { id: "ptr-video-beginner-4", purpose_slug: "video", user_type_slug: "beginner", tool_id: "550e8400-e29b-41d4-a716-446655440151", recommendation_level: "recommended", reason: "프롬프트 기반으로 마케팅 영상 쉽게 제작", sort_order: 3, is_killer_pick: false },
  { id: "ptr-video-beginner-5", purpose_slug: "video", user_type_slug: "beginner", tool_id: "550e8400-e29b-41d4-a716-446655440040", recommendation_level: "optional", reason: "텍스트로 음악 생성, 영상 배경음악 제작에 유용", sort_order: 4, is_killer_pick: false },

  // ---- video x freelancer ----
  { id: "ptr-video-freelancer-1", purpose_slug: "video", user_type_slug: "freelancer", tool_id: "550e8400-e29b-41d4-a716-446655440020", recommendation_level: "essential", reason: "프로급 AI 영상 생성, 독창적인 비주얼 콘텐츠 제작", sort_order: 0, is_killer_pick: true },
  { id: "ptr-video-freelancer-2", purpose_slug: "video", user_type_slug: "freelancer", tool_id: "550e8400-e29b-41d4-a716-446655440149", recommendation_level: "essential", reason: "자연스러운 AI 음성 생성, 나레이션과 더빙에 활용", sort_order: 1, is_killer_pick: true },
  { id: "ptr-video-freelancer-3", purpose_slug: "video", user_type_slug: "freelancer", tool_id: "550e8400-e29b-41d4-a716-446655440144", recommendation_level: "recommended", reason: "AI 아바타로 다국어 영상 제작, 발표 영상에 최적", sort_order: 2, is_killer_pick: false },
  { id: "ptr-video-freelancer-4", purpose_slug: "video", user_type_slug: "freelancer", tool_id: "550e8400-e29b-41d4-a716-446655440148", recommendation_level: "recommended", reason: "긴 영상을 자동으로 쇼츠/릴스로 편집", sort_order: 3, is_killer_pick: false },

  // ---- coding x beginner ----
  { id: "ptr-coding-beginner-1", purpose_slug: "coding", user_type_slug: "beginner", tool_id: "550e8400-e29b-41d4-a716-446655440032", recommendation_level: "essential", reason: "브라우저에서 바로 코딩, AI가 단계별로 도와줌", sort_order: 0, is_killer_pick: true },
  { id: "ptr-coding-beginner-2", purpose_slug: "coding", user_type_slug: "beginner", tool_id: "550e8400-e29b-41d4-a716-446655440163", recommendation_level: "essential", reason: "프롬프트만 입력하면 웹사이트 자동 생성", sort_order: 1, is_killer_pick: true },
  { id: "ptr-coding-beginner-3", purpose_slug: "coding", user_type_slug: "beginner", tool_id: "550e8400-e29b-41d4-a716-446655440164", recommendation_level: "recommended", reason: "UI 디자인을 코드로 자동 변환, 프론트엔드 입문에 최적", sort_order: 2, is_killer_pick: false },
  { id: "ptr-coding-beginner-4", purpose_slug: "coding", user_type_slug: "beginner", tool_id: "550e8400-e29b-41d4-a716-446655440165", recommendation_level: "recommended", reason: "자연어로 설명하면 앱을 만들어주는 노코드 AI", sort_order: 3, is_killer_pick: false },
  { id: "ptr-coding-beginner-5", purpose_slug: "coding", user_type_slug: "beginner", tool_id: "550e8400-e29b-41d4-a716-446655440001", recommendation_level: "optional", reason: "코드 설명, 오류 해결, 학습 질문에 활용", sort_order: 4, is_killer_pick: false },

  // ---- coding x expert ----
  { id: "ptr-coding-expert-1", purpose_slug: "coding", user_type_slug: "expert", tool_id: "550e8400-e29b-41d4-a716-446655440031", recommendation_level: "essential", reason: "AI 코드 편집기 최강자, 코드베이스 전체 이해 기반 코딩", sort_order: 0, is_killer_pick: true },
  { id: "ptr-coding-expert-2", purpose_slug: "coding", user_type_slug: "expert", tool_id: "550e8400-e29b-41d4-a716-446655440030", recommendation_level: "essential", reason: "IDE 내장 AI 어시스턴트, 코드 자동완성의 업계 표준", sort_order: 1, is_killer_pick: true },
  { id: "ptr-coding-expert-3", purpose_slug: "coding", user_type_slug: "expert", tool_id: "550e8400-e29b-41d4-a716-446655440171", recommendation_level: "essential", reason: "터미널 기반 AI 코딩, 대규모 리팩토링과 복잡한 작업에 강점", sort_order: 2, is_killer_pick: true },
  { id: "ptr-coding-expert-4", purpose_slug: "coding", user_type_slug: "expert", tool_id: "550e8400-e29b-41d4-a716-446655440161", recommendation_level: "recommended", reason: "Codeium 기반 AI IDE, 빠른 코드 자동완성과 리팩토링", sort_order: 3, is_killer_pick: false },
  { id: "ptr-coding-expert-5", purpose_slug: "coding", user_type_slug: "expert", tool_id: "550e8400-e29b-41d4-a716-446655440170", recommendation_level: "recommended", reason: "자율형 AI 개발 에이전트, 복잡한 작업 자동 수행", sort_order: 4, is_killer_pick: false },
  { id: "ptr-coding-expert-6", purpose_slug: "coding", user_type_slug: "expert", tool_id: "550e8400-e29b-41d4-a716-446655440162", recommendation_level: "optional", reason: "AWS 환경 최적화, 클라우드 인프라 코딩 지원", sort_order: 5, is_killer_pick: false },

  // ---- automation x daily-user ----
  { id: "ptr-automation-daily-1", purpose_slug: "automation", user_type_slug: "daily-user", tool_id: "550e8400-e29b-41d4-a716-446655440072", recommendation_level: "essential", reason: "수백 개 앱 연동으로 반복 업무 자동화의 표준", sort_order: 0, is_killer_pick: true },
  { id: "ptr-automation-daily-2", purpose_slug: "automation", user_type_slug: "daily-user", tool_id: "550e8400-e29b-41d4-a716-446655440210", recommendation_level: "essential", reason: "복잡한 워크플로우도 시각적으로 설계 가능", sort_order: 1, is_killer_pick: true },
  { id: "ptr-automation-daily-3", purpose_slug: "automation", user_type_slug: "daily-user", tool_id: "550e8400-e29b-41d4-a716-446655440100", recommendation_level: "recommended", reason: "Office 365와 완벽 통합, 문서·이메일 업무 자동화", sort_order: 2, is_killer_pick: false },
  { id: "ptr-automation-daily-4", purpose_slug: "automation", user_type_slug: "daily-user", tool_id: "550e8400-e29b-41d4-a716-446655440216", recommendation_level: "recommended", reason: "AI 일정 관리로 회의·집중 시간 자동 최적화", sort_order: 3, is_killer_pick: false },
  { id: "ptr-automation-daily-5", purpose_slug: "automation", user_type_slug: "daily-user", tool_id: "550e8400-e29b-41d4-a716-446655440217", recommendation_level: "optional", reason: "이메일 처리 시간 대폭 단축, AI 우선순위 분류", sort_order: 4, is_killer_pick: false },

  // ---- automation x freelancer ----
  { id: "ptr-automation-freelancer-1", purpose_slug: "automation", user_type_slug: "freelancer", tool_id: "550e8400-e29b-41d4-a716-446655440072", recommendation_level: "essential", reason: "고객 응대부터 인보이스까지 1인 비즈니스 자동화", sort_order: 0, is_killer_pick: true },
  { id: "ptr-automation-freelancer-2", purpose_slug: "automation", user_type_slug: "freelancer", tool_id: "550e8400-e29b-41d4-a716-446655440005", recommendation_level: "essential", reason: "프로젝트 관리와 문서 작성을 한 곳에서 해결", sort_order: 1, is_killer_pick: true },
  { id: "ptr-automation-freelancer-3", purpose_slug: "automation", user_type_slug: "freelancer", tool_id: "550e8400-e29b-41d4-a716-446655440220", recommendation_level: "recommended", reason: "문서 기반 자동화로 데이터 관리와 업무 프로세스 구축", sort_order: 2, is_killer_pick: false },
  { id: "ptr-automation-freelancer-4", purpose_slug: "automation", user_type_slug: "freelancer", tool_id: "550e8400-e29b-41d4-a716-446655440215", recommendation_level: "recommended", reason: "업무 프로세스 자동 문서화로 체계적 관리", sort_order: 3, is_killer_pick: false },

  // ---- research x beginner ----
  { id: "ptr-research-beginner-1", purpose_slug: "research", user_type_slug: "beginner", tool_id: "550e8400-e29b-41d4-a716-446655440004", recommendation_level: "essential", reason: "검색과 답변을 한 번에, 출처 포함 정확한 정보 제공", sort_order: 0, is_killer_pick: true },
  { id: "ptr-research-beginner-2", purpose_slug: "research", user_type_slug: "beginner", tool_id: "550e8400-e29b-41d4-a716-446655440190", recommendation_level: "essential", reason: "PDF·영상 자료를 올리면 AI가 분석·요약·질문 답변", sort_order: 1, is_killer_pick: true },
  { id: "ptr-research-beginner-3", purpose_slug: "research", user_type_slug: "beginner", tool_id: "550e8400-e29b-41d4-a716-446655440003", recommendation_level: "recommended", reason: "Google 검색 연동으로 최신 정보 리서치에 유용", sort_order: 2, is_killer_pick: false },
  { id: "ptr-research-beginner-4", purpose_slug: "research", user_type_slug: "beginner", tool_id: "550e8400-e29b-41d4-a716-446655440104", recommendation_level: "optional", reason: "여러 AI를 동시에 검색, 다양한 관점의 정보 수집", sort_order: 3, is_killer_pick: false },

  // ---- research x student ----
  { id: "ptr-research-student-1", purpose_slug: "research", user_type_slug: "student", tool_id: "550e8400-e29b-41d4-a716-446655440004", recommendation_level: "essential", reason: "논문 검색과 학술 자료 분석에 출처 포함 답변 제공", sort_order: 0, is_killer_pick: true },
  { id: "ptr-research-student-2", purpose_slug: "research", user_type_slug: "student", tool_id: "550e8400-e29b-41d4-a716-446655440190", recommendation_level: "essential", reason: "강의 자료와 교재를 업로드하면 학습 도우미로 활용", sort_order: 1, is_killer_pick: true },
  { id: "ptr-research-student-3", purpose_slug: "research", user_type_slug: "student", tool_id: "550e8400-e29b-41d4-a716-446655440050", recommendation_level: "recommended", reason: "데이터 분석 과제에 코드 없이 차트와 분석 제공", sort_order: 2, is_killer_pick: false },

  // ---- learning x student ----
  { id: "ptr-learning-student-1", purpose_slug: "learning", user_type_slug: "student", tool_id: "550e8400-e29b-41d4-a716-446655440001", recommendation_level: "essential", reason: "어떤 과목이든 AI 과외 선생님처럼 활용 가능", sort_order: 0, is_killer_pick: true },
  { id: "ptr-learning-student-2", purpose_slug: "learning", user_type_slug: "student", tool_id: "550e8400-e29b-41d4-a716-446655440002", recommendation_level: "essential", reason: "복잡한 개념 설명과 단계별 학습에 탁월", sort_order: 1, is_killer_pick: true },
  { id: "ptr-learning-student-3", purpose_slug: "learning", user_type_slug: "student", tool_id: "550e8400-e29b-41d4-a716-446655440115", recommendation_level: "recommended", reason: "캐릭터 대화로 영어 회화 연습 가능", sort_order: 2, is_killer_pick: false },
  { id: "ptr-learning-student-4", purpose_slug: "learning", user_type_slug: "student", tool_id: "550e8400-e29b-41d4-a716-446655440003", recommendation_level: "recommended", reason: "Google 연동으로 최신 학습 자료 검색에 유용", sort_order: 3, is_killer_pick: false },

  // ---- learning x parent ----
  { id: "ptr-learning-parent-1", purpose_slug: "learning", user_type_slug: "parent", tool_id: "550e8400-e29b-41d4-a716-446655440001", recommendation_level: "essential", reason: "자녀 학습 질문에 쉽고 정확한 설명 제공", sort_order: 0, is_killer_pick: true },
  { id: "ptr-learning-parent-2", purpose_slug: "learning", user_type_slug: "parent", tool_id: "550e8400-e29b-41d4-a716-446655440062", recommendation_level: "recommended", reason: "자녀 영어 학습 도우미로 안전하게 활용", sort_order: 1, is_killer_pick: false },
  { id: "ptr-learning-parent-3", purpose_slug: "learning", user_type_slug: "parent", tool_id: "550e8400-e29b-41d4-a716-446655440070", recommendation_level: "recommended", reason: "한국어 특화 AI로 자녀 학습 지원에 편리", sort_order: 2, is_killer_pick: false },

  // ---- presentation x beginner ----
  { id: "ptr-pres-beginner-1", purpose_slug: "presentation", user_type_slug: "beginner", tool_id: "550e8400-e29b-41d4-a716-446655440051", recommendation_level: "essential", reason: "텍스트만 입력하면 완성도 높은 PPT 자동 생성", sort_order: 0, is_killer_pick: true },
  { id: "ptr-pres-beginner-2", purpose_slug: "presentation", user_type_slug: "beginner", tool_id: "550e8400-e29b-41d4-a716-446655440193", recommendation_level: "essential", reason: "AI 디자인 제안으로 초보자도 전문가급 발표자료 제작", sort_order: 1, is_killer_pick: true },
  { id: "ptr-pres-beginner-3", purpose_slug: "presentation", user_type_slug: "beginner", tool_id: "550e8400-e29b-41d4-a716-446655440194", recommendation_level: "recommended", reason: "Google Slides 연동, 텍스트를 PPT로 자동 변환", sort_order: 2, is_killer_pick: false },
  { id: "ptr-pres-beginner-4", purpose_slug: "presentation", user_type_slug: "beginner", tool_id: "550e8400-e29b-41d4-a716-446655440195", recommendation_level: "recommended", reason: "스토리텔링형 발표자료를 AI가 자동 구성", sort_order: 3, is_killer_pick: false },

  // ---- presentation x daily-user ----
  { id: "ptr-pres-daily-1", purpose_slug: "presentation", user_type_slug: "daily-user", tool_id: "550e8400-e29b-41d4-a716-446655440051", recommendation_level: "essential", reason: "업무 보고용 PPT를 몇 분 만에 완성", sort_order: 0, is_killer_pick: true },
  { id: "ptr-pres-daily-2", purpose_slug: "presentation", user_type_slug: "daily-user", tool_id: "550e8400-e29b-41d4-a716-446655440222", recommendation_level: "recommended", reason: "복잡한 아이디어를 시각적 다이어그램으로 표현", sort_order: 1, is_killer_pick: false },
  { id: "ptr-pres-daily-3", purpose_slug: "presentation", user_type_slug: "daily-user", tool_id: "550e8400-e29b-41d4-a716-446655440196", recommendation_level: "recommended", reason: "동적 프레젠테이션으로 발표 효과 극대화", sort_order: 2, is_killer_pick: false },

  // ---- marketing x beginner ----
  { id: "ptr-marketing-beginner-1", purpose_slug: "marketing", user_type_slug: "beginner", tool_id: "550e8400-e29b-41d4-a716-446655440001", recommendation_level: "essential", reason: "SNS 카피, 광고 문구, 마케팅 아이디어 생성", sort_order: 0, is_killer_pick: true },
  { id: "ptr-marketing-beginner-2", purpose_slug: "marketing", user_type_slug: "beginner", tool_id: "550e8400-e29b-41d4-a716-446655440071", recommendation_level: "essential", reason: "한국어 마케팅 카피에 특화, 템플릿 풍부", sort_order: 1, is_killer_pick: true },
  { id: "ptr-marketing-beginner-3", purpose_slug: "marketing", user_type_slug: "beginner", tool_id: "550e8400-e29b-41d4-a716-446655440111", recommendation_level: "recommended", reason: "마케팅 전문 AI, 광고 카피 대량 생성에 최적", sort_order: 2, is_killer_pick: false },
  { id: "ptr-marketing-beginner-4", purpose_slug: "marketing", user_type_slug: "beginner", tool_id: "550e8400-e29b-41d4-a716-446655440071", recommendation_level: "optional", reason: "SNS 콘텐츠 디자인과 편집을 한 번에 해결", sort_order: 3, is_killer_pick: false },

  // ---- marketing x freelancer ----
  { id: "ptr-marketing-freelancer-1", purpose_slug: "marketing", user_type_slug: "freelancer", tool_id: "550e8400-e29b-41d4-a716-446655440110", recommendation_level: "essential", reason: "브랜드 톤에 맞는 마케팅 콘텐츠 대량 생산", sort_order: 0, is_killer_pick: true },
  { id: "ptr-marketing-freelancer-2", purpose_slug: "marketing", user_type_slug: "freelancer", tool_id: "550e8400-e29b-41d4-a716-446655440112", recommendation_level: "essential", reason: "SEO 최적화 콘텐츠와 랜딩 페이지 카피 자동 생성", sort_order: 1, is_killer_pick: true },
  { id: "ptr-marketing-freelancer-3", purpose_slug: "marketing", user_type_slug: "freelancer", tool_id: "550e8400-e29b-41d4-a716-446655440214", recommendation_level: "recommended", reason: "대화형 설문으로 고객 피드백과 리드 수집", sort_order: 2, is_killer_pick: false },

  // ---- building x beginner ----
  { id: "ptr-building-beginner-1", purpose_slug: "building", user_type_slug: "beginner", tool_id: "550e8400-e29b-41d4-a716-446655440163", recommendation_level: "essential", reason: "코딩 없이 프롬프트로 웹사이트와 앱 제작", sort_order: 0, is_killer_pick: true },
  { id: "ptr-building-beginner-2", purpose_slug: "building", user_type_slug: "beginner", tool_id: "550e8400-e29b-41d4-a716-446655440165", recommendation_level: "essential", reason: "아이디어를 설명하면 실제 동작하는 앱으로 변환", sort_order: 1, is_killer_pick: true },
  { id: "ptr-building-beginner-3", purpose_slug: "building", user_type_slug: "beginner", tool_id: "550e8400-e29b-41d4-a716-446655440164", recommendation_level: "recommended", reason: "UI 컴포넌트를 AI가 자동 생성, 디자인부터 코드까지", sort_order: 2, is_killer_pick: false },
  { id: "ptr-building-beginner-4", purpose_slug: "building", user_type_slug: "beginner", tool_id: "550e8400-e29b-41d4-a716-446655440105", recommendation_level: "recommended", reason: "챗봇과 AI 앱을 노코드로 빌드 가능", sort_order: 3, is_killer_pick: false },

  // ---- building x expert ----
  { id: "ptr-building-expert-1", purpose_slug: "building", user_type_slug: "expert", tool_id: "550e8400-e29b-41d4-a716-446655440031", recommendation_level: "essential", reason: "전체 프로젝트를 AI와 함께 빌드, 코드베이스 이해 기반", sort_order: 0, is_killer_pick: true },
  { id: "ptr-building-expert-2", purpose_slug: "building", user_type_slug: "expert", tool_id: "550e8400-e29b-41d4-a716-446655440171", recommendation_level: "essential", reason: "CLI 기반 AI로 복잡한 프로젝트 구축과 배포 자동화", sort_order: 1, is_killer_pick: true },
  { id: "ptr-building-expert-3", purpose_slug: "building", user_type_slug: "expert", tool_id: "550e8400-e29b-41d4-a716-446655440223", recommendation_level: "recommended", reason: "서비스 설계 단계에서 와이어프레임과 플로우차트 빠르게 생성", sort_order: 2, is_killer_pick: false },
  { id: "ptr-building-expert-4", purpose_slug: "building", user_type_slug: "expert", tool_id: "550e8400-e29b-41d4-a716-446655440032", recommendation_level: "recommended", reason: "브라우저에서 바로 프로토타입 빌드와 배포 가능", sort_order: 3, is_killer_pick: false },

  // ---- automation x team ----
  { id: "ptr-automation-team-1", purpose_slug: "automation", user_type_slug: "team", tool_id: "550e8400-e29b-41d4-a716-446655440072", recommendation_level: "essential", reason: "팀 전체 워크플로우 자동화, 수백 개 앱 연동", sort_order: 0, is_killer_pick: true },
  { id: "ptr-automation-team-2", purpose_slug: "automation", user_type_slug: "team", tool_id: "550e8400-e29b-41d4-a716-446655440210", recommendation_level: "essential", reason: "복잡한 비즈니스 프로세스를 시각적으로 자동화", sort_order: 1, is_killer_pick: true },
  { id: "ptr-automation-team-3", purpose_slug: "automation", user_type_slug: "team", tool_id: "550e8400-e29b-41d4-a716-446655440100", recommendation_level: "recommended", reason: "Microsoft 365 환경 팀에 최적화된 AI 어시스턴트", sort_order: 2, is_killer_pick: false },
  { id: "ptr-automation-team-4", purpose_slug: "automation", user_type_slug: "team", tool_id: "550e8400-e29b-41d4-a716-446655440212", recommendation_level: "recommended", reason: "팀 브레인스토밍과 협업을 AI가 지원", sort_order: 3, is_killer_pick: false },
  { id: "ptr-automation-team-5", purpose_slug: "automation", user_type_slug: "team", tool_id: "550e8400-e29b-41d4-a716-446655440224", recommendation_level: "optional", reason: "팀 화상회의 노이즈 제거와 녹음 관리", sort_order: 4, is_killer_pick: false },

  // ---- research x daily-user ----
  { id: "ptr-research-daily-1", purpose_slug: "research", user_type_slug: "daily-user", tool_id: "550e8400-e29b-41d4-a716-446655440004", recommendation_level: "essential", reason: "업무용 리서치에 출처 포함 정확한 답변 제공", sort_order: 0, is_killer_pick: true },
  { id: "ptr-research-daily-2", purpose_slug: "research", user_type_slug: "daily-user", tool_id: "550e8400-e29b-41d4-a716-446655440190", recommendation_level: "essential", reason: "회의 자료와 보고서를 업로드하면 핵심 분석 제공", sort_order: 1, is_killer_pick: true },
  { id: "ptr-research-daily-3", purpose_slug: "research", user_type_slug: "daily-user", tool_id: "550e8400-e29b-41d4-a716-446655440050", recommendation_level: "recommended", reason: "데이터 분석을 자연어로 요청, 차트 자동 생성", sort_order: 2, is_killer_pick: false },
  { id: "ptr-research-daily-4", purpose_slug: "research", user_type_slug: "daily-user", tool_id: "550e8400-e29b-41d4-a716-446655440198", recommendation_level: "optional", reason: "비즈니스 데이터 시각화와 대시보드 제작", sort_order: 3, is_killer_pick: false },
];

data.purpose_tool_recommendations = purposeToolRecommendations;
delete data.job_tool_recommendations;

// ============================================================
// 6. EMPTY edu_tool_recommendations
// ============================================================
data.edu_tool_recommendations = [];

// ============================================================
// 7. UPDATE CATEGORY SHOWCASES
// ============================================================
const showcaseSlugMapping = {
  "general-ai": "writing",
  "text-generation": "writing",
  "image-generation": "design",
  "video-editing": "video",
  "coding-tools": "coding",
  "music-generation": "video",
  "data-analysis": "research",
  "translation": "writing",
  "others": "presentation"
};

// We need to deduplicate showcases since multiple old slugs map to same new slug.
// We'll keep the most relevant showcase per new slug.
const newShowcases = [];
const usedSlugs = new Set();

// Define the preferred source showcase for each new slug
const preferredSource = {
  "writing": "cs-text-generation",     // text-generation showcase is more specific
  "design": "cs-image-generation",
  "video": "cs-video-editing",         // video-editing is more relevant than music
  "coding": "cs-coding-tools",
  "research": "cs-data-analysis",
  "presentation": "cs-others"          // others showcase was about PPT
};

data.category_showcases.forEach(cs => {
  const newSlug = showcaseSlugMapping[cs.category_slug];
  if (!newSlug) return;

  // Only include this showcase if it's the preferred one for the new slug,
  // or if no preferred one has been added yet
  if (usedSlugs.has(newSlug)) return;

  const preferred = preferredSource[newSlug];
  if (preferred && cs.id !== preferred) {
    // Check if the preferred one exists in the data
    const preferredExists = data.category_showcases.some(c => c.id === preferred);
    if (preferredExists) return; // Skip, wait for preferred
  }

  usedSlugs.add(newSlug);
  newShowcases.push({
    ...cs,
    id: `cs-${newSlug}`,
    category_slug: newSlug,
    sort_order: newShowcases.length + 1
  });
});

// If any preferred showcases haven't been added yet, add them now
Object.entries(preferredSource).forEach(([newSlug, preferredId]) => {
  if (usedSlugs.has(newSlug)) return;

  const source = data.category_showcases.find(cs => cs.id === preferredId);
  if (source) {
    usedSlugs.add(newSlug);
    newShowcases.push({
      ...source,
      id: `cs-${newSlug}`,
      category_slug: newSlug,
      sort_order: newShowcases.length + 1
    });
  }
});

// Add showcases for new categories that don't have old equivalents (learning, automation, marketing, building)
if (!usedSlugs.has("automation")) {
  newShowcases.push({
    id: "cs-automation",
    category_slug: "automation",
    prompt: "Connect my Google Calendar to Slack and send daily schedule summary",
    prompt_ko: "Google 캘린더와 Slack을 연동해서 매일 일정 요약 보내줘",
    description: "업무 자동화 도구의 연동 능력을 비교하세요",
    media_type: "text",
    sort_order: newShowcases.length + 1
  });
}

if (!usedSlugs.has("learning")) {
  newShowcases.push({
    id: "cs-learning",
    category_slug: "learning",
    prompt: "Explain quantum computing to a high school student in simple terms",
    prompt_ko: "양자 컴퓨팅을 고등학생도 이해할 수 있게 쉽게 설명해줘",
    description: "AI 학습 도우미의 설명 능력을 비교하세요",
    media_type: "text",
    sort_order: newShowcases.length + 1
  });
}

if (!usedSlugs.has("marketing")) {
  newShowcases.push({
    id: "cs-marketing",
    category_slug: "marketing",
    prompt: "Write 5 Instagram captions for a new coffee shop opening",
    prompt_ko: "새로 오픈하는 카페의 인스타그램 홍보 문구 5개 작성해줘",
    description: "마케팅 카피 생성 능력을 비교하세요",
    media_type: "text",
    sort_order: newShowcases.length + 1
  });
}

if (!usedSlugs.has("building")) {
  newShowcases.push({
    id: "cs-building",
    category_slug: "building",
    prompt: "Build a simple landing page for a SaaS product with signup form",
    prompt_ko: "SaaS 제품의 랜딩 페이지를 가입 폼 포함해서 만들어줘",
    description: "AI 빌딩 도구의 프로토타이핑 능력을 비교하세요",
    media_type: "code",
    sort_order: newShowcases.length + 1
  });
}

data.category_showcases = newShowcases;

// ============================================================
// 8. REORDER TOP-LEVEL KEYS FOR CLEAN OUTPUT
// ============================================================
const orderedData = {
  categories: data.categories,
  tools: data.tools,
  user_types: data.user_types,
  edu_levels: data.edu_levels,
  purpose_tool_recommendations: data.purpose_tool_recommendations,
  edu_tool_recommendations: data.edu_tool_recommendations,
  news: data.news,
  guides: data.guides,
  collections: data.collections,
  tool_benchmark_scores: data.tool_benchmark_scores,
  category_showcases: data.category_showcases,
  tool_showcases: data.tool_showcases,
  role_showcases: data.role_showcases,
  role_use_cases: data.role_use_cases
};

// ============================================================
// WRITE OUTPUT
// ============================================================
const output = JSON.stringify(orderedData, null, 2);
fs.writeFileSync(seedPath, output, 'utf8');

// Verification
const verify = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
console.log('\n=== VERIFICATION ===');
console.log(`Categories: ${verify.categories.length} (expected 10)`);
console.log(`Tools: ${verify.tools.length} (expected 119)`);
console.log(`User types: ${verify.user_types.length} (expected 9)`);
console.log(`Edu levels: ${verify.edu_levels.length} (expected 0)`);
console.log(`Purpose recommendations: ${verify.purpose_tool_recommendations.length}`);
console.log(`Edu recommendations: ${verify.edu_tool_recommendations.length} (expected 0)`);
console.log(`Category showcases: ${verify.category_showcases.length}`);
console.log(`News: ${verify.news.length}`);
console.log(`Guides: ${verify.guides.length}`);
console.log(`Collections: ${verify.collections.length}`);
console.log(`Tool benchmarks: ${verify.tool_benchmark_scores.length}`);
console.log(`Tool showcases: ${verify.tool_showcases.length}`);
console.log(`Role showcases: ${verify.role_showcases.length}`);
console.log(`Role use cases: ${verify.role_use_cases.length}`);

// Check category distribution
const catDist = {};
verify.tools.forEach(t => {
  catDist[t.category_id] = (catDist[t.category_id] || 0) + 1;
});
console.log('\n=== CATEGORY DISTRIBUTION ===');
Object.entries(catDist).sort().forEach(([cat, count]) => {
  console.log(`  ${cat}: ${count} tools`);
});

// Check that no old category IDs remain
const oldCats = ['cat-general-ai', 'cat-text-gen', 'cat-image-gen', 'cat-video-edit', 'cat-music-gen', 'cat-data', 'cat-translation', 'cat-others'];
const remaining = verify.tools.filter(t => oldCats.includes(t.category_id));
if (remaining.length > 0) {
  console.log(`\nERROR: ${remaining.length} tools still have old category IDs!`);
  remaining.forEach(t => console.log(`  ${t.name}: ${t.category_id}`));
} else {
  console.log('\nAll tools successfully migrated to new categories!');
}

// Verify showcases
console.log('\n=== CATEGORY SHOWCASES ===');
verify.category_showcases.forEach(cs => {
  console.log(`  ${cs.id}: ${cs.category_slug}`);
});

console.log('\nTransformation complete!');
