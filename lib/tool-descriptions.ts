/**
 * AI 도구 한 줄 설명 매핑
 * 랭킹 테이블 등에서 각 도구의 주요 역할을 간략히 보여주기 위한 용도
 */

const TOOL_SHORT_DESCRIPTIONS: Record<string, string> = {
  // ── 아이디어 · 브레인스토밍 (Chat) ──
  'chatgpt': '대화·이미지·영상·음성·코딩·에이전트 올인원 AI 플랫폼',
  'gemini': 'Google 검색 연동 멀티모달 AI',
  'claude': '장문 분석·코딩에 강한 안전 중심 AI',
  'microsoft-copilot': 'Microsoft 365 통합 AI 어시스턴트',
  'poe': '여러 AI 모델 통합 비교 플랫폼',
  'grok': '실시간 정보 기반 xAI 대화형 AI',
  'wrtn': '한국어 특화 AI 콘텐츠 플랫폼',
  'coze': '노코드 AI 챗봇 빌더 플랫폼',
  'perplexity': 'AI 기반 실시간 검색·리서치 엔진',
  'character-ai': '캐릭터 기반 대화 AI 플랫폼',
  'pi': '감성적 대화에 특화된 개인 AI',
  'you-com': 'AI 검색 + 챗봇 통합 플랫폼',
  'huggingchat': '오픈소스 모델 기반 무료 AI 챗봇',
  'dwijibgi': '한국어 특화 AI 콘텐츠 생성 플랫폼',
  'kimi': '중국 Moonshot AI 장문 처리 챗봇',
  'perplexity-pages': 'AI 리서치 결과를 웹페이지로 정리',

  // ── 글쓰기 · 문서 · 요약 ──
  'notion-ai': 'Notion 내장 AI 글쓰기·정리 도우미',
  'jasper': '마케팅 콘텐츠 자동 생성 AI',
  'jasper-marketing': '마케팅 캠페인 특화 AI 카피라이팅',
  'copy-ai': '광고·마케팅 카피 자동 생성',
  'writesonic': 'SEO 최적화 콘텐츠 생성 AI',
  'grammarly': '영문 문법 교정·문체 개선 AI',
  'quillbot': '문장 재구성·패러프레이징 도구',
  'rytr': '블로그·이메일 등 다목적 글쓰기 AI',
  'hyperwrite': '실시간 글쓰기 어시스턴트',
  'sudowrite': '소설·창작 글쓰기 특화 AI',
  'wordtune': '문장 리라이팅·톤 조절 AI 도구',
  'otter-ai': '회의록 자동 작성·음성 텍스트 변환',
  'fireflies-ai': 'AI 회의록 자동 요약·분석 도구',
  'tldv': '화상 회의 녹화·AI 요약 도구',
  'clova-note': '네이버 AI 음성 기록·요약 도구',
  'lex': 'AI 보조 미니멀 글쓰기 에디터',
  'jenni-ai': '학술 논문·에세이 작성 AI 도우미',
  'moonbeam': '장문 블로그·아티클 작성 AI',
  'compose-ai': '이메일·메시지 자동 완성 AI',
  'mem': 'AI 기반 스마트 노트·지식 관리',
  'mem-ai': 'AI 기반 자동 정리 노트 앱',
  'reflect': 'AI 연결 기반 사고 노트 도구',
  'craft': 'AI 통합 문서·노트 편집 도구',
  'novelai': 'AI 소설·스토리 생성 플랫폼',
  'coda-ai': 'AI 내장 문서·워크플로우 도구',
  'napkin-ai': '텍스트→다이어그램 AI 시각화 도구',

  // ── 번역 · 언어 ──
  'deepl': '고품질 AI 번역 서비스',
  'deepl-write': 'AI 기반 다국어 문체 교정 도구',
  'google-translate': 'Google AI 기반 다국어 번역',
  'papago': '네이버 AI 한국어 특화 번역',
  'reverso': 'AI 번역 + 문맥 사전 + 문법 교정',
  'flitto': '크라우드소싱 + AI 번역 플랫폼',
  'smartcat': 'AI 통합 전문 번역 관리 플랫폼',
  'lingva-translate': '오픈소스 프라이버시 중심 번역 도구',
  'itranslate': '실시간 음성·텍스트 번역 앱',

  // ── 디자인 · 이미지 ──
  'midjourney': '고품질 AI 이미지 생성의 대명사',
  'dall-e-3': 'OpenAI의 텍스트→이미지 생성 AI',
  'stable-diffusion': '오픈소스 이미지 생성 AI 모델',
  'stable-diffusion-webui': 'Stable Diffusion 로컬 실행 웹 UI',
  'canva-ai': 'AI 기반 올인원 디자인 플랫폼',
  'adobe-firefly': 'Adobe 생태계 AI 이미지 생성',
  'leonardo-ai': '게임·디자인 특화 AI 이미지 생성',
  'ideogram': '텍스트 포함 이미지 생성에 강한 AI',
  'playground-ai': '다양한 AI 모델 기반 이미지 편집',
  'remov-bg': 'AI 배경 자동 제거 도구',
  'remove-bg': 'AI 배경 자동 제거 도구',
  'clipdrop': 'AI 이미지 편집·배경 제거·업스케일',
  'photoroom': '상품 사진 AI 편집·배경 생성',
  'designify': 'AI 상품 사진 자동 배경 디자인',
  'cleanup-pictures': 'AI 사진 불필요한 객체 제거 도구',
  'freepik-ai': 'AI 이미지 생성 + 디자인 리소스',
  'krea-ai': '실시간 AI 이미지 생성·편집 도구',
  'bing-image-creator': 'Microsoft AI 이미지 생성 (DALL-E)',
  'flux': '초고품질 오픈소스 이미지 생성 AI',
  'fooocus': 'Stable Diffusion 간편 이미지 생성 UI',
  'comfyui': '노드 기반 AI 이미지 생성 워크플로우',
  'invokeai': '로컬 AI 이미지 생성·편집 인터페이스',
  'dreamstudio': 'Stability AI 공식 이미지 생성 플랫폼',
  'booth-ai': 'AI 제품 사진 촬영·배경 생성 도구',
  'scenario': '게임 에셋 특화 AI 이미지 생성',
  'uizard': 'AI 기반 UI/UX 프로토타입 도구',
  'diagram': 'AI 기반 Figma 디자인 자동화',
  'galileo-ai': 'AI UI 디자인 자동 생성 도구',
  'magician': 'Figma용 AI 디자인 어시스턴트',
  'whimsical-ai': 'AI 마인드맵·와이어프레임 도구',

  // ── 영상 · 콘텐츠 제작 ──
  'runway': 'AI 영상 생성·편집 올인원 플랫폼',
  'runway-ml': 'AI 영상 생성·편집 올인원 플랫폼',
  'synthesia': 'AI 아바타 기반 영상 자동 제작',
  'heygen': 'AI 아바타로 다국어 영상 생성',
  'descript': 'AI 기반 영상·팟캐스트 편집 도구',
  'descript-voice': 'AI 음성 클로닝 기반 영상 편집',
  'descript-studio': 'AI 영상 제작·편집 스튜디오',
  'pictory': '텍스트에서 짧은 영상 자동 생성',
  'invideo': 'AI 기반 빠른 영상 제작 플랫폼',
  'invideo-ai': 'AI 텍스트→영상 자동 제작 도구',
  'pika': 'AI 영상 생성·편집 크리에이티브 도구',
  'capcut': 'TikTok 연동 AI 영상 편집 앱',
  'vrew': 'AI 자막·편집 국산 영상 도구',
  'opusclip': '긴 영상에서 숏폼 자동 추출 AI',
  'opus-clip': '긴 영상에서 숏폼 자동 추출 AI',
  'sora': 'OpenAI의 텍스트→영상 생성 AI',
  'luma-ai': 'AI 3D 캡처·영상 생성 도구',
  'luma-dream-machine': 'AI 텍스트/이미지→영상 생성',
  'kling-ai': '고품질 AI 영상 생성 중국 플랫폼',
  'd-id': 'AI 아바타 기반 대화형 영상 생성',
  'captions': 'AI 자막 자동 생성·영상 편집 앱',
  'fliki': '텍스트→음성+영상 자동 제작 AI',
  'vizard': 'AI 영상 자동 편집·리사이징 도구',
  'submagic': 'AI 숏폼 자막·캡션 자동 생성',
  'vidyo-ai': '긴 영상 AI 숏폼 변환 도구',
  'wisecut': 'AI 기반 영상 자동 편집 도구',
  'twelve-labs': '영상 내용 AI 검색·분석 엔진',
  'topaz-video-ai': 'AI 영상 화질 개선·업스케일링',
  'loom-ai': 'AI 요약 기능 화면 녹화 도구',

  // ── 코딩 · 개발 ──
  'github-copilot': '코드 자동 완성·생성 AI 어시스턴트',
  'cursor': 'AI 기반 코드 에디터 (VS Code 포크)',
  'replit': 'AI 코딩 + 클라우드 개발 환경',
  'replit-ai': 'Replit 내장 AI 코딩 어시스턴트',
  'tabnine': '코드 자동 완성 AI 플러그인',
  'codeium': '무료 AI 코드 자동 완성 도구',
  'v0': 'Vercel의 AI UI 컴포넌트 생성기',
  'bolt-new': 'AI로 풀스택 웹앱 빠르게 생성',
  'lovable': 'AI 자연어→풀스택 웹앱 생성 도구',
  'claude-code': 'Anthropic의 터미널 AI 코딩 도구',
  'aider': '터미널 기반 AI 페어 프로그래밍',
  'continue': 'VS Code/JetBrains AI 코딩 확장',
  'windsurf': 'AI 기반 코드 에디터 (Codeium)',
  'amazon-q-developer': 'AWS 특화 AI 코딩 어시스턴트',
  'amazon-codewhisperer': 'AWS 특화 AI 코드 자동 완성',
  'devin': '자율형 AI 소프트웨어 엔지니어',
  'phind': '개발자 특화 AI 검색·코딩 도우미',
  'blackbox-ai': 'AI 코드 검색·자동 완성 도구',
  'pieces': 'AI 코드 스니펫 관리·어시스턴트',
  'cody': '코드베이스 이해 기반 AI 코딩 도우미',
  'openhands': '오픈소스 AI 소프트웨어 개발 에이전트',

  // ── 업무 자동화 ──
  'zapier-ai': '5000+ 앱 연결 AI 업무 자동화',
  'make': '비주얼 워크플로우 자동화 도구',
  'make-integromat': '비주얼 워크플로우 자동화 도구',
  'n8n': '오픈소스 워크플로우 자동화 플랫폼',
  'bardeen': '브라우저 기반 반복 작업 자동화 AI',
  'relay': 'AI + 사람 협업 워크플로우 자동화',
  'miro-ai': 'AI 통합 온라인 화이트보드 협업 도구',
  'tally': 'AI 기반 간편 폼 빌더',
  'typeform': 'AI 대화형 설문·폼 빌더',
  'scribe': 'AI 업무 프로세스 자동 문서화 도구',
  'reclaim-ai': 'AI 일정 자동 최적화 캘린더 도구',
  'superhuman': 'AI 기반 초고속 이메일 클라이언트',

  // ── 음악 · 오디오 ──
  'suno': '텍스트로 노래 자동 작곡·생성 AI',
  'suno-ai': '텍스트로 노래 자동 작곡·생성 AI',
  'udio': '고품질 AI 음악 생성 플랫폼',
  'elevenlabs': '초현실적 AI 음성 합성·클로닝',
  'murf-ai': 'AI 보이스오버·음성 합성 도구',
  'soundraw': 'AI 배경 음악 자동 생성 도구',
  'aiva': 'AI 클래식·영화 음악 자동 작곡',
  'mubert': 'AI 실시간 배경 음악 생성 스트리밍',
  'boomy': '누구나 30초 만에 AI 작곡',
  'soundful': 'AI 로열티 프리 배경 음악 생성',
  'beatoven': 'AI 맞춤 배경 음악 자동 생성',
  'beatoven-ai': 'AI 맞춤 배경 음악 자동 생성',
  'loudly': 'AI 음악 생성 + 배포 플랫폼',
  'stable-audio': 'Stability AI 오디오·음악 생성',
  'play-ht': 'AI 텍스트→음성 변환 플랫폼',
  'listnr': 'AI 텍스트→음성 + 팟캐스트 생성',
  'lovo': 'AI 음성 합성·비디오 더빙 도구',
  'resemble-ai': 'AI 음성 클로닝·합성 API',
  'coqui-tts': '오픈소스 AI 음성 합성 엔진',
  'speechify': 'AI 텍스트 읽어주기·음성 변환',
  'typecast': 'AI 가상 성우 보이스 생성 플랫폼',
  'podcastle': 'AI 팟캐스트 녹음·편집 올인원',
  'splash': 'AI 음악 생성 + 가사 작성 도구',
  'amper': 'AI 맞춤 음악 자동 작곡 도구',
  'krisp': 'AI 소음 제거·회의 녹음 도구',
  'real-time-voice-cloning': '오픈소스 실시간 AI 음성 클로닝',
  'whisper': 'OpenAI 오픈소스 음성→텍스트 변환',

  // ── 데이터 · 리서치 ──
  'elicit': '논문 검색·분석 특화 AI 리서치 도구',
  'consensus': '학술 논문 AI 검색·요약 엔진',
  'scholarcy': '논문 핵심 요약 AI 도구',
  'scispace': 'AI 논문 검색·이해·요약 플랫폼',
  'researchrabbit': 'AI 논문 추천·연구 탐색 도구',
  'semantic-scholar': 'AI 기반 학술 논문 검색 엔진',
  'google-notebooklm': 'Google AI 문서 분석·요약 노트북',
  'julius-ai': 'AI 데이터 분석·시각화 도구',
  'julius': 'AI 데이터 분석·시각화 도구',
  'tableau': 'AI 통합 데이터 시각화·분석 플랫폼',
  'tableau-ai': 'AI 데이터 인사이트 자동 도출',
  'obviously-ai': '노코드 AI 예측 분석 플랫폼',
  'rows': 'AI 기반 스프레드시트 데이터 분석',
  'rows-ai': 'AI 기반 스프레드시트 데이터 분석',
  'equals': 'AI 스프레드시트 + BI 분석 도구',
  'lookup': 'AI 데이터 조회·분석 자동화',
  'coefficient': '스프레드시트 AI 데이터 연동 도구',
  'hex': 'AI 데이터 분석·시각화 노트북',
  'datarobot': '엔터프라이즈 AI 머신러닝 자동화',
  'power-bi': 'Microsoft AI 비즈니스 인텔리전스',
  'monkeylearn': '노코드 텍스트 AI 분석 도구',

  // ── 발표자료 · PPT ──
  'gamma': 'AI로 프레젠테이션 자동 생성',
  'beautiful-ai': 'AI 기반 슬라이드 디자인 자동화',
  'tome': 'AI 스토리텔링 프레젠테이션 도구',
  'tome-business': 'AI 비즈니스 프레젠테이션 도구',
  'slidesai': 'Google 슬라이드 AI 자동 생성',
  'pitch': 'AI 통합 팀 프레젠테이션 도구',
  'decktopus': 'AI 프레젠테이션 빠른 생성 도구',
  'prezi-ai': 'AI 기반 동적 프레젠테이션 도구',

  // ── 마케팅 · 홍보 ──
  'surfer-seo': 'AI 기반 SEO 콘텐츠 최적화 도구',
  'frase': 'AI SEO 콘텐츠 리서치·최적화',
  'marketmuse': 'AI 콘텐츠 전략·SEO 계획 도구',
  'clearscope': 'AI SEO 콘텐츠 최적화 분석 도구',
  'adcreative-ai': 'AI 광고 크리에이티브 자동 생성',
  'predis-ai': 'AI SNS 콘텐츠 자동 생성 도구',
  'pencil': 'AI 광고 영상·이미지 자동 생성',
  'lavender': 'AI 이메일 마케팅 코칭·최적화',
  'instantly': 'AI 이메일 아웃바운드 자동화 도구',
  'taplio': 'AI LinkedIn 콘텐츠 자동 생성',

  // ── 서비스 · 제품 만들기 ──
  'spline-ai': 'AI 3D 디자인·인터랙티브 웹 도구',
  'csm-ai': 'AI 3D 모델 자동 생성 도구',
  'kaedim': '2D→3D 자동 변환 AI 모델링',

  // ── 교육 ──
  'khan-academy-ai': 'AI 개인 튜터 Khanmigo 학습 도우미',
  'duolingo-max': 'AI 기반 대화형 언어 학습 앱',
  'quizlet-ai': 'AI 학습 카드·시험 대비 도구',
  'studyable': 'AI 시험 대비·학습 계획 도우미',
  'knowt': 'AI 노트→플래시카드 자동 변환',
  'revision-ai': 'AI 시험 복습·학습 도구',

  // ── 고객 지원 ──
  'intercom-fin': 'AI 고객 상담 자동 응대 챗봇',
  'zendesk-ai': 'AI 통합 고객 서비스 자동화',
  'ada': 'AI 고객 서비스 자동화 플랫폼',
  'kustomer': 'AI 옴니채널 고객 지원 플랫폼',

  // ── HR · 채용 ──
  'hirevue': 'AI 영상 면접·채용 평가 플랫폼',
  'paradox': 'AI 채용 프로세스 자동화 도구',
  'eightfold': 'AI 인재 매칭·채용 인텔리전스',

  // ── 법률 ──
  'harvey': 'AI 법률 리서치·문서 분석 도구',
  'donotpay': 'AI 법률 상담·자동 서류 작성',
  'casetext': 'AI 법률 검색·소송 분석 도구',

  // ── 의료 ──
  'nabla': 'AI 의료 기록·진료 보조 도구',
  'glass-health': 'AI 임상 의사결정 지원 시스템',

  // ── 게임 ──
  'leonardo-ai-gaming': '게임 에셋 특화 AI 이미지 생성',
  'rosebud-ai': 'AI 게임 개발·코드 생성 도구',

  // ── 개발 프레임워크 ──
  'autogpt': '자율형 AI 에이전트 오픈소스 프레임워크',
  'langchain': 'LLM 앱 개발 오픈소스 프레임워크',
  'llamaindex': 'LLM 데이터 연결 프레임워크',
  'flowise': '노코드 LLM 앱 빌더 (드래그&드롭)',
  'langflow': '비주얼 LLM 워크플로우 빌더',
  'ollama': '로컬 LLM 실행 오픈소스 도구',
  'gpt4all': '로컬에서 실행하는 오픈소스 LLM',
  'localai': '로컬 AI 모델 실행 API 서버',
  'lm-studio': '로컬 LLM 관리·실행 데스크톱 앱',
  'llama-cpp': '로컬 LLM 실행 C++ 추론 엔진',
  'open-interpreter': '자연어로 코드 실행하는 AI 도구',
  'hugging-face': 'AI 모델 허브·오픈소스 ML 플랫폼',
};

/**
 * 도구의 한 줄 설명을 반환
 * 매핑에 없으면 카테고리 기반 기본 설명 또는 빈 문자열 반환
 */
export function getToolShortDescription(slug: string, categoryName?: string): string {
  const mapped = TOOL_SHORT_DESCRIPTIONS[slug];
  if (mapped) return mapped;

  // 카테고리 기반 기본 설명
  if (categoryName) return `${categoryName} AI 도구`;

  return '';
}

export default TOOL_SHORT_DESCRIPTIONS;
