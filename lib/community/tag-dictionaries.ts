/**
 * 태그 자동 추출을 위한 매칭 사전
 */

// ==========================================
// AI 서비스 Alias 매핑
// ==========================================
export const AI_TOOL_ALIASES: Record<string, string[]> = {
  // 대화형 AI
  'chatgpt': [
    'chatgpt', 'chat gpt', 'chat-gpt',
    'gpt', 'gpt-4', 'gpt4', 'gpt-3.5', 'gpt3.5',
    '챗gpt', '챗지피티', '지피티', '챗 지피티',
    'openai', 'open ai',
  ],
  'claude': [
    'claude', 'claude ai', 'claude-ai',
    '클로드', '쿨루드', '클로드ai',
    'claude code', 'claudecode', 'claude-code',
    '클로드코드', '클로드 code', '클로드 코드',
    'anthropic',
  ],
  'gemini': [
    'gemini', 'gemini ai', 'gemini-ai',
    '제미나이', '제미니', '지미나이', '지미니',
    'bard', '바드',
    'google ai', 'google gemini', '구글 제미나이', '구글 지미니',
  ],
  'copilot': [
    'copilot', 'co-pilot', 'co pilot',
    '코파일럿', '코-파일럿', '코 파일럿',
    'bing chat', '빙챗', '빙 챗',
    'microsoft copilot', '마이크로소프트 코파일럿', 'ms copilot',
  ],

  // 이미지 생성
  'midjourney': [
    'midjourney', 'mid-journey', 'mid journey',
    '미드저니', '미드-저니', '미드 저니',
    'mj',
  ],
  'dalle': [
    'dall-e', 'dalle', 'dall e', 'dalle-2', 'dalle-3',
    '달리', '달-리', '달 리', '달리2', '달리3',
  ],
  'stable-diffusion': [
    'stable diffusion', 'stablediffusion', 'stable-diffusion',
    '스테이블 디퓨전', '스테이블디퓨전', '스테이블-디퓨전',
    'sd', 'sd1.5', 'sdxl',
  ],
  'leonardo-ai': [
    'leonardo', 'leonardo ai', 'leonardo-ai',
    '레오나르도', '레오나르도ai', '레오나르도 ai',
  ],

  // 영상 생성
  'runway': [
    'runway', 'runway ml', 'runwayml',
    '런웨이', '런웨이ml', '런웨이 ml',
  ],
  'pika': [
    'pika', 'pika labs', 'pikalabs',
    '피카', '피카랩스', '피카 랩스',
  ],
  'synthesia': [
    'synthesia',
    '신세시아', '신시시아', '신테시아',
  ],

  // 음악 생성
  'suno': [
    'suno', 'suno ai', 'sunoai',
    '수노', '수노ai', '수노 ai', '슈노',
  ],
  'udio': [
    'udio', 'udio ai', 'udioai',
    '우디오', '유디오', '우디오ai',
  ],

  // 코딩 도구
  'github-copilot': [
    'github copilot', 'github-copilot', 'githubcopilot',
    '깃허브 코파일럿', '깃허브코파일럿', '깃헙 코파일럿',
    'gh copilot',
  ],
  'cursor': [
    'cursor', 'cursor ai', 'cursor-ai', 'cursorai',
    '커서', '커서ai', '커서 ai',
  ],
  'v0': [
    'v0', 'v0.dev', 'v0dev',
    'vercel v0', '버셀 v0', '버셀v0',
    '브이제로', 'v제로',
  ],
  'replit': [
    'replit', 'repl.it', 'repl',
    '레플릿', '레플', '리플릿',
  ],

  // 번역/글쓰기
  'deepl': [
    'deepl', 'deep l',
    '딥엘', '디플', '딥 엘',
  ],
  'notion-ai': [
    'notion ai', 'notion-ai', 'notionai', 'notion',
    '노션 ai', '노션ai', '노션',
  ],
  'jasper': [
    'jasper', 'jasper ai', 'jasper-ai', 'jasperai',
    '재스퍼', '재스퍼ai', '재스퍼 ai',
  ],

  // 한국 서비스
  'wrtn': [
    '뤼튼', 'wrtn', 'riton', '라이튼', '류튼',
    '뤼튼ai', '뤼튼 ai',
  ],
  'clova-x': [
    '클로바x', '클로바 x', 'clova x', 'clovax', 'clova-x',
    'naver clova', '네이버 클로바', '네이버클로바',
  ],
  'askup': [
    'askup', 'ask up', 'ask-up',
    '애스크업', '에스크업', '아스크업', '애스크 업',
  ],
};

// ==========================================
// 목적(Goal) 키워드 매핑
// ==========================================
export const GOAL_KEYWORDS: Record<string, string[]> = {
  'writing': [
    // 문서 작성
    '글쓰기', '작성', '문서', '보고서', '리포트', '기획서',
    // 번역/요약
    '번역', '요약', '정리', '축약',
    // 글 종류
    '이메일', '메일', '블로그', '포스팅', '게시글',
    '콘텐츠', '카피', '카피라이팅',
    // 동사
    '쓰다', '적다', '작성하다',
  ],

  'design': [
    // 이미지
    '이미지', '그림', '사진', '포스터',
    // 디자인 작업
    '로고', '썸네일', '배너', '일러스트', '아이콘',
    // 디자인 동사
    '디자인', '꾸미다', '만들다',
    // 스타일
    '그래픽', '비주얼',
  ],

  'video': [
    // 영상
    '영상', '비디오', '동영상', '쇼츠', '릴스',
    // 편집
    '편집', '컷', '자막', '썸네일',
    // 음악
    '음악', '소리', '사운드', '오디오', 'bgm',
  ],

  'automation': [
    // 자동화
    '자동화', '자동', '반복', '효율',
    // 업무
    '업무', '작업', '프로세스', '워크플로우',
    // 도구
    '스크립트', '매크로', '봇',
  ],

  'coding': [
    // 코딩
    '코드', '코딩', '프로그래밍', '개발',
    // 작업
    '디버깅', '리뷰', '리팩토링', '테스트',
    // 언어
    'python', 'javascript', 'java', 'react', 'next',
  ],

  'data': [
    // 조사/리서치
    '조사', '리서치', '분석', '연구',
    // 자료/데이터
    '자료', '정보', '데이터', '논문',
    // 동사
    '찾다', '검색', '알아보다',
    // 분석
    '시각화', '대시보드', '통계',
  ],

  'presentation': [
    // 발표
    '발표', '프레젠테이션', 'ppt', '슬라이드',
    // 자료
    '발표자료', '피티', '파워포인트',
  ],

  'marketing': [
    // 마케팅
    '마케팅', '홍보', '광고', 'seo',
    // SNS
    'sns', '소셜', '인스타', '페이스북', '트위터',
    // 콘텐츠
    '카피', '헤드라인', '제목', '캠페인',
  ],

  'building': [
    // 제품
    '제품', '서비스', '앱', '웹사이트',
    // 개발
    '만들기', '구축', '개발', '빌드',
    // 방법
    '노코드', '프로토타입', 'mvp',
  ],
};

// ==========================================
// 기능(Feature) 키워드 매핑
// ==========================================
export const FEATURE_KEYWORDS: Record<string, string[]> = {
  'text': ['텍스트', '글', '문장', '단어', '내용'],
  'image': ['이미지', '사진', '그림', '이미지'],
  'video': ['영상', '비디오', '동영상'],
  'code': ['코드', '프로그램', '스크립트'],
  'audio': ['음악', '소리', '오디오', '사운드'],
};

// ==========================================
// 불용어 (Stopwords)
// ==========================================
export const STOP_WORDS = new Set([
  // 조사
  '은', '는', '이', '가', '을', '를', '에', '에서', '으로', '로', '와', '과',
  '의', '도', '만', '까지', '부터', '께서', '에게', '한테', '보다',
  // 대명사
  '이', '그', '저', '나', '너', '우리', '저희', '자신',
  // 동사/형용사
  '있다', '없다', '하다', '되다', '이다', '아니다',
  // 부사
  '정말', '진짜', '너무', '매우', '아주', '조금', '많이',
  // 기타
  '때문', '같다', '것', '거', '수', '등',
]);

// ==========================================
// 헬퍼 함수
// ==========================================

/**
 * 텍스트 정규화 (소문자 + 공백 제거)
 */
export function normalizeText(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '');
}

/**
 * AI 서비스 슬러그 → 표시 이름
 */
export function getAIToolDisplay(slug: string): string {
  const displayMap: Record<string, string> = {
    'chatgpt': 'ChatGPT',
    'claude': 'Claude',
    'gemini': 'Gemini',
    'copilot': 'Copilot',
    'midjourney': 'Midjourney',
    'dalle': 'DALL-E',
    'stable-diffusion': 'Stable Diffusion',
    'leonardo-ai': 'Leonardo AI',
    'runway': 'Runway',
    'pika': 'Pika',
    'synthesia': 'Synthesia',
    'suno': 'Suno',
    'udio': 'Udio',
    'github-copilot': 'GitHub Copilot',
    'cursor': 'Cursor',
    'v0': 'v0',
    'replit': 'Replit',
    'deepl': 'DeepL',
    'notion-ai': 'Notion AI',
    'jasper': 'Jasper',
    'wrtn': '뤼튼',
    'clova-x': '클로바X',
    'askup': 'AskUp',
  };
  return displayMap[slug] || slug;
}

/**
 * 목적 슬러그 → 표시 이름
 */
export function getGoalDisplay(slug: string): string {
  const displayMap: Record<string, string> = {
    'chat': '아이디어·브레인스토밍',
    'writing': '글쓰기',
    'design': '디자인',
    'video': '영상',
    'music': '음악·오디오',
    'coding': '코딩',
    'automation': '자동화',
    'translation': '번역',
    'data': '데이터·리서치',
    'presentation': '발표',
    'marketing': '마케팅',
    'building': '제품만들기',
  };
  return displayMap[slug] || slug;
}

/**
 * 기능 슬러그 → 표시 이름
 */
export function getFeatureDisplay(slug: string): string {
  const displayMap: Record<string, string> = {
    'text': '텍스트',
    'image': '이미지',
    'video': '영상',
    'code': '코드',
    'audio': '오디오',
  };
  return displayMap[slug] || slug;
}
