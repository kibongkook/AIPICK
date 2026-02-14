/**
 * 2026년 2월 기준 AI 도구 전수 조사 업데이트 스크립트
 * 모든 도구의 버전, 무료 정책, 설명 등을 최신 정보로 업데이트
 */
import { readFileSync, writeFileSync } from 'fs';

const seedPath = new URL('../data/seed.json', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
const data = JSON.parse(readFileSync(seedPath, 'utf-8'));

// slug -> update map
const updates = {
  // ========== 1. 대화형 AI / LLM ==========
  'chatgpt': {
    description: 'OpenAI의 최신 AI 챗봇. GPT-4o, o3, GPT-5.2 모델 지원. 이미지 생성, 웹 검색, 파일 분석 통합',
    long_description: 'OpenAI가 개발한 대화형 AI로, GPT-4o mini(무료 기본), GPT-4o, o3, o4-mini, GPT-5.2 등 다양한 모델을 지원합니다. GPT-4o의 이미지 생성이 DALL-E 3를 대체하며, 웹 검색, 파일 업로드, 코드 실행(Advanced Data Analysis), 플러그인 등 풍부한 기능을 제공합니다. Plus($20/월) 구독 시 o3, o4-mini 등 추론 모델도 사용 가능합니다.',
    free_quota_detail: 'GPT-4o mini 무제한 무료(기본), GPT-5.2 제한적 무료(5시간 윈도우), 파일·이미지 업로드, 웹 검색, GPT Store 접근, 시간당 30턴',
    model_identifiers: ['gpt-4o', 'gpt-4o-mini', 'o3', 'o4-mini', 'gpt-5.2', 'openai/gpt-4o'],
    monthly_price: 20,
  },
  'claude': {
    description: 'Anthropic의 최신 AI. Claude Opus 4.6(최상위), Sonnet 4.5, Haiku 4.5 모델 제공',
    long_description: 'Anthropic이 개발한 AI 어시스턴트로, Claude Opus 4.6(2026년 2월 출시), Sonnet 4.5, Haiku 4.5 모델을 제공합니다. 200K 토큰 컨텍스트 윈도우로 장문서 처리에 강하며, Projects 기능으로 맞춤형 지식 기반 구축이 가능합니다. 코딩, 분석, 창작 글쓰기에서 뛰어난 성능을 보이며, Claude Code로 터미널 기반 코딩 에이전트도 지원합니다.',
    free_quota_detail: 'Claude Sonnet 4.5 일일 약 30회 무료, 파일 업로드 5개/대화, Projects 기능 제한적 사용 가능',
    model_identifiers: ['claude-opus-4-6', 'claude-sonnet-4-5', 'claude-haiku-4-5', 'anthropic/claude-sonnet-4-5'],
    monthly_price: 20,
  },
  // Gemini already updated
  'perplexity': {
    description: '실시간 웹 검색 기반 AI. 출처 링크 제공, 최신 정보 검색에 최적화',
    free_quota_detail: '기본 검색 무제한, Pro Search 소량 무료 할당, 파일 업로드 제한적, 검색 히스토리 무료',
    monthly_price: 20,
  },
  'wrtn': {
    description: '한국형 AI 플랫폼. GPT-4o 무제한 무료, 이미지 생성, 캐릭터 챗 등 다양한 기능 제공',
    free_quota_detail: 'GPT-4o 무제한 무료, 이미지 생성 무료, 캐릭터 챗 무료, 광고 기반 수익 모델',
  },
  'microsoft-copilot': {
    description: 'Microsoft의 AI 어시스턴트. GPT-4o 기반, 웹 검색·Office 365 연동, 이미지 생성 통합',
    long_description: 'Microsoft가 개발한 AI 어시스턴트로, OpenAI GPT-4o 모델을 기반으로 합니다. Bing 검색과 연동되어 실시간 정보 접근이 가능하며, DALL-E 3 이미지 생성, Office 365 통합을 제공합니다. Windows, Edge 브라우저에 내장되어 접근성이 뛰어나며, Copilot Pro($20/월)는 GPT-4o, o1 모델과 Office 앱 내 AI 기능을 제공합니다.',
    free_quota_detail: 'GPT-4o 기반 무료 채팅, 이미지 생성(DALL-E 3) 하루 15회, 웹 검색 연동 무료',
    monthly_price: 20,
  },
  'grok': {
    description: 'xAI의 최신 AI. Grok 3 모델, X(트위터) 실시간 데이터 연동, 이미지 생성(Aurora) 지원',
    long_description: 'Elon Musk의 xAI가 개발한 AI 챗봇으로, Grok 3 모델을 탑재하고 있습니다. X(트위터) 플랫폼의 실시간 데이터에 접근 가능하며, Aurora로 이미지 생성도 지원합니다. 131K 토큰 컨텍스트 윈도우를 제공하며, THINK 모드로 심층 추론이 가능합니다.',
    free_quota_detail: '텍스트 질문 10회/2시간 무료, 이미지 생성 10회/2시간, 이미지 분석 3회/일, THINK 모드 10회/24시간',
    model_identifiers: ['grok-3', 'grok-2', 'x-ai/grok-3'],
    monthly_price: 8,
  },
  'character-ai': {
    description: 'AI 캐릭터와 대화할 수 있는 플랫폼. 캐릭터 생성·공유, 롤플레이, c1+ 고급 모델',
    free_quota_detail: '기본 캐릭터 대화 무제한 무료, 캐릭터 생성 무료, c1+ 고급 모델은 유료(c.ai+ $9.99/월)',
  },
  'notion-ai': {
    description: 'Notion에 내장된 AI. 문서 작성·요약·번역, AI 에이전트 기능 제공',
    free_quota_detail: 'Free/Plus 플랜에서 AI 제한적 체험 가능, 전체 AI 기능은 Business($20/user/월) 이상',
    monthly_price: 10,
  },

  // ========== 2. 이미지 생성 ==========
  'midjourney': {
    description: 'V7 출시. 최고 수준의 이미지 생성 AI. 스타일 레퍼런스, 캐릭터 일관성 등 프로 기능',
    long_description: '고품질 이미지 생성 AI로, 최신 V7 모델을 제공합니다. Discord 기반으로 운영되며, --sref(스타일 레퍼런스), --cref(캐릭터 레퍼런스) 등 고급 기능을 지원합니다. 포토리얼리즘부터 일러스트까지 다양한 스타일에 강하며, 웹 인터페이스도 제공합니다.',
    free_quota_detail: '무료 플랜 없음(2023년 중단). Basic $10/월(3.3시간 Fast GPU), Standard $30/월(15시간+무제한 Relax)',
    monthly_price: 10,
  },
  'dall-e-3': {
    description: 'OpenAI의 이미지 생성 AI. GPT-4o 네이티브 이미지 생성으로 전환 중(2026년 5월 DALL-E 3 API 종료)',
    long_description: 'OpenAI의 이미지 생성 AI입니다. ChatGPT에서 GPT-4o 네이티브 이미지 생성이 DALL-E 3를 대체하고 있으며, DALL-E 3 API는 2026년 5월 종료 예정입니다. GPT-4o의 이미지 생성은 텍스트 렌더링, 프롬프트 이해도가 크게 향상되었습니다.',
    free_quota_detail: 'ChatGPT 무료 플랜에서 GPT-4o 이미지 생성 제한적 무료, Plus 구독 시 확대, API는 이미지당 $0.04~$0.08',
  },
  'stable-diffusion': {
    description: 'Stability AI의 오픈소스 이미지 생성. SD 3.5(Large/Turbo/Medium) 최신, 로컬 무료 실행 가능',
    long_description: 'Stability AI가 개발한 오픈소스 이미지 생성 AI입니다. 최신 SD 3.5는 Large(8B), Large Turbo(8B), Medium(2.6B) 세 가지 모델을 제공합니다. 로컬 GPU에서 완전 무료로 실행 가능하며, ComfyUI, Automatic1111 등 다양한 인터페이스를 지원합니다. 포토리얼리즘, 텍스트 렌더링이 크게 개선되었습니다.',
    free_quota_detail: '오픈소스 모델 완전 무료(로컬 GPU 필요), DreamStudio 웹에서 신규 가입 시 25크레딧 제공',
    model_identifiers: ['stabilityai/stable-diffusion-3.5-large', 'stabilityai/sd3.5-large-turbo', 'stabilityai/sd3.5-medium'],
  },
  'leonardo-ai': {
    description: '고품질 AI 이미지 생성. 다양한 파인튜닝 모델, 캐릭터 레퍼런스, 실시간 캔버스 제공',
    free_quota_detail: '일일 150토큰 무료(리셋 UTC 자정, 이월 불가), 대기 시간 8-20분, 다양한 모델 무료 사용',
    monthly_price: 15,
  },
  'ideogram': {
    description: 'Ideogram 3.0 출시(2026.2). 텍스트 정확도 최고, Magic Fill/Extend, Canvas 기능 제공',
    long_description: 'Ideogram 3.0이 2026년 2월 출시되었습니다. 텍스트가 포함된 이미지 생성에서 최고 수준의 정확도를 자랑하며, Canvas의 Magic Fill, Extend, Describe 기능이 추가되었습니다. 긴 텍스트 처리와 손 렌더링이 크게 개선되었습니다.',
    free_quota_detail: '무료 플랜 제공(일일 생성 횟수 제한), Basic $11.99/월, Pro $85.99/월',
  },
  'adobe-firefly': {
    description: 'Adobe의 상업적 안전 AI. 2026년 무제한 생성 도입, Runway Gen-4 등 서드파티 모델 통합',
    long_description: 'Adobe의 상업적으로 안전한 AI 이미지/영상 생성 도구입니다. 2026년 초 유료 구독자 대상 무제한 생성이 도입되었으며, Google, Runway Gen-4, GPT Image Generation 등 서드파티 모델도 통합되었습니다. Photoshop, Illustrator 등 Creative Cloud와 네이티브 연동됩니다.',
    free_quota_detail: '무료 체험 크레딧 제공, 유료 구독자($9.99/월~) 무제한 AI 이미지·영상 생성, 2K 해상도',
    monthly_price: 9.99,
  },
  'krea-ai': {
    description: '실시간 AI 이미지 생성. 캔버스에서 즉시 결과 확인, 업스케일, 스타일 전환 지원',
    free_quota_detail: '일일 50장 무료 생성, 실시간 캔버스 무료 사용, 업스케일 기능 일부 무료',
  },
  'flux': {
    description: 'Black Forest Labs의 Flux.2 시리즈. 4MP 이미지 3-5초 생성, 10배 속도 향상',
    long_description: 'Black Forest Labs가 개발한 최신 이미지 생성 AI입니다. Flux.2 시리즈(Pro, Flex, Dev, Klein)를 제공하며, 최대 4메가픽셀 이미지를 3-5초 만에 생성합니다. Klein 모델은 Apache 2.0 라이선스로 무료 사용 가능하며, 포토리얼리즘에서 최고 수준 성능을 보입니다.',
    free_quota_detail: 'Flux.2 Klein/Dev 모델 오픈소스 무료(로컬 실행), Pro 모델은 API 과금($0.01/이미지~)',
  },
  'bing-image-creator': {
    description: 'Microsoft의 무료 이미지 생성. GPT-4o/DALL-E 기반, Microsoft 계정으로 무료 무제한',
    free_quota_detail: 'GPT-4o/DALL-E 기반 이미지 생성 무료, Microsoft 계정 필요, 부스트 포인트로 빠른 생성',
  },

  // ========== 3. 영상 생성 ==========
  'runway-ml': {
    description: 'AI 영상 생성 선두주자. Gen-4.5(최신), Gen-4 Turbo, Act-Two 등 다양한 모델',
    long_description: 'AI 영상 생성 분야의 선두주자로, Gen-4.5 모델이 세계 최고 수준의 영상 생성 성능을 제공합니다. Gen-4 Turbo(이미지→영상), Gen-4(텍스트→이미지), Act-Two(모션 전환) 등 다양한 모델을 지원합니다. 영상 에디터, 그린 스크린 등 후처리 도구도 내장되어 있습니다.',
    free_quota_detail: '무료 125크레딧(일회성, 갱신 없음). Gen-4 Turbo·텍스트→이미지만 가능, Gen-4 영상은 유료',
    monthly_price: 15,
  },
  'pika': {
    description: 'Pika 2.5 출시. 물리 기반 영상 생성, Pikaswaps/Pikaffects, AI 사운드 자동 생성',
    long_description: 'Pika 2.5가 출시되어 물리 기반 인터랙션 영상 생성이 가능해졌습니다. Pikaswaps(객체 교체), Pikaffects(이펙트), Pikaframes(프레임 제어) 도구를 제공하며, 영상 속 액션에 맞는 사운드 이펙트를 자동 생성합니다.',
    free_quota_detail: '무료 플랜 제공(월 크레딧 제한, 480p, 워터마크). 유료 $8/월부터, 상업 사용은 유료만',
    monthly_price: 8,
  },
  'sora': {
    description: 'OpenAI의 AI 영상 생성. Sora 2 출시, ChatGPT Plus 이상 구독 필요',
    long_description: 'OpenAI가 개발한 AI 영상 생성 도구로, Sora 2 모델을 제공합니다. 텍스트·이미지에서 고품질 영상을 생성하며, ChatGPT Plus($20/월) 구독으로 480p 무제한, Pro($200/월)로 1080p까지 지원합니다. API는 초당 $0.10부터.',
    free_quota_detail: '무료 플랜 없음. ChatGPT Plus($20/월) 구독 시 480p 영상 무제한. Pro($200/월) 시 10,000크레딧·1080p',
    monthly_price: 20,
  },
  'luma-dream-machine': {
    description: 'Luma AI의 영상 생성. Ray3.14 모델, 네이티브 1080p, 4배 빠른 생성 속도',
    long_description: 'Luma AI의 Dream Machine으로, 최신 Ray3.14 모델을 제공합니다. 네이티브 1080p 생성, 4배 빠른 성능, 향상된 프롬프트 준수도가 특징입니다. Extend 기능으로 장편 영상 제작도 가능합니다.',
    free_quota_detail: '월 30크레딧 무료(약 10개 영상), 5초 클립, Standard $9.99/월(120크레딧), Pro $49.99/월(400크레딧)',
    monthly_price: 9.99,
  },
  'kling-ai': {
    description: 'Kuaishou의 AI 영상 생성. Kling 2.6/3.0 모델, 동시 오디오-비주얼 생성, 일일 무료 크레딧',
    long_description: 'Kuaishou가 개발한 AI 영상 생성 도구로, Kling 2.6 모델과 3.0(베타)을 제공합니다. Video O1(통합 멀티모달), Image O1, 동시 오디오-비주얼 생성 등 혁신적 기능을 갖추고 있습니다. 2025년 12월 ARR $2.4억 달러를 달성했습니다.',
    free_quota_detail: '일일 66크레딧 무료(24시간 리셋, 이월 불가), 720p, 워터마크, 대기 시간 5-30분. 유료 $6.99/월~',
    monthly_price: 6.99,
  },
  'heygen': {
    description: 'AI 아바타 영상 생성. 텍스트→영상, 음성 클론, 다국어 립싱크, Avatar IV 최신',
    free_quota_detail: '월 3개 영상 무료(크레딧 제한). Creator $29/월(200크레딧), Business $149/월',
    monthly_price: 29,
  },
  'capcut': {
    description: 'ByteDance의 무료 영상 편집. AI 자막, 배경 제거, 음악 생성, 모든 기능 무료(Pro 제외)',
    free_quota_detail: '모든 기능 완전 무료(Pro 제외), 워터마크 없음, AI 자막·배경 제거·음악 생성 포함',
  },

  // ========== 4. 음악 생성 ==========
  'suno-ai': {
    description: 'AI 음악 생성 1위. v4.5(무료)/v5(유료), 보컬 포함 풀 트랙, 일일 50크레딧(약 10곡)',
    long_description: 'AI 음악 생성 분야의 선두주자로, v4.5(무료 사용자)와 v5(유료 사용자) 모델을 제공합니다. 텍스트 프롬프트로 보컬 포함 풀 트랙을 생성하며, 다양한 장르와 언어를 지원합니다. [Verse], [Chorus], [Bridge] 등 구조 태그로 곡 구성을 제어할 수 있습니다.',
    free_quota_detail: '일일 50크레딧(약 10곡, UTC 자정 리셋, 이월 불가), v4.5 모델, 개인 사용만 가능. Pro $10/월(v5, 상업 사용)',
    monthly_price: 10,
  },
  'udio': {
    description: 'AI 음악 생성. 고음질 트랙 생성, 다양한 장르 지원. 2025년 말 라이선싱 전환으로 다운로드 제한',
    long_description: 'AI 음악 생성 도구로, 고음질 트랙을 생성합니다. 2025년 말 주요 음반사와의 라이선싱 전환으로 대부분 사용자의 다운로드(WAV, 영상, 스템)가 일시 중단된 상태입니다. 짧은 다운로드 윈도우가 간헐적으로 제공됩니다.',
    free_quota_detail: '일일 10크레딧+월 100 백업 크레딧(약 3곡/일), 다운로드 현재 제한적. Standard $10/월(2,400크레딧)',
    monthly_price: 10,
  },

  // ========== 5. 코딩/개발 도구 ==========
  'github-copilot': {
    description: 'GitHub의 AI 코딩 도우미. Claude Sonnet 4.5, GPT-4o 등 멀티모델, 무료 플랜 제공',
    long_description: 'GitHub의 AI 코딩 어시스턴트로, Claude Sonnet 4.5, GPT-4o 등 다양한 모델을 지원합니다. 무료 플랜으로 월 2,000회 자동완성과 50회 채팅이 가능하며, Pro+($39/월)는 Claude Opus 4, o3 등 모든 모델에 접근할 수 있습니다. VS Code, JetBrains 등 주요 IDE를 지원합니다.',
    free_quota_detail: '월 2,000회 코드 자동완성+50회 프리미엄 채팅 무료. Pro $10/월, Pro+ $39/월(모든 모델)',
    model_identifiers: ['claude-sonnet-4-5', 'gpt-4o', 'claude-opus-4', 'o3'],
    monthly_price: 10,
  },
  'cursor': {
    description: 'AI 네이티브 코드 에디터. 크레딧 기반 과금, Claude/GPT 모델 지원, Agent 모드',
    long_description: 'AI 네이티브 코드 에디터로, 2025년 6월 크레딧 기반 과금으로 전환했습니다. Claude Sonnet 4.5, GPT-4o 등 다양한 모델을 지원하며, Agent 모드로 자율적 코드 작성이 가능합니다. VS Code 기반으로 기존 확장 프로그램과 호환됩니다.',
    free_quota_detail: 'Hobby 무료: 2,000회 자동완성+50회 슬로우 요청/월, 7일 Pro 체험. Pro $20/월(크레딧 $20 풀)',
    model_identifiers: ['claude-sonnet-4-5', 'gpt-4o', 'claude-opus-4-6', 'o3'],
    monthly_price: 20,
  },
  'windsurf': {
    description: 'AI 코드 에디터(구 Codeium). 무료 탭 자동완성 무제한, Cascade AI 에이전트',
    long_description: 'Codeium에서 리브랜딩한 AI 코드 에디터로, 무료 플랜에서 탭 자동완성 무제한, 프리뷰·배포 무제한을 제공합니다. Cascade AI 에이전트로 복잡한 코딩 작업을 자율 수행할 수 있으며, Pro($15/월)는 Cursor보다 25% 저렴합니다.',
    free_quota_detail: '무료: 25 프롬프트 크레딧/월+탭 자동완성 무제한+프리뷰·배포 무제한. Pro $15/월',
    monthly_price: 15,
  },
  'bolt-new': {
    description: 'StackBlitz의 풀스택 AI 앱 빌더. 브라우저에서 즉시 앱 생성·배포, 무료 플랜 제공',
    free_quota_detail: '무료 플랜 제공(일일 토큰 제한), 풀스택 앱 자동 생성·배포, 유료 플랜 더 많은 토큰',
  },
  'v0': {
    description: 'Vercel의 AI UI 생성기. React/Next.js 컴포넌트 자동 생성, GitHub 연동, Design Mode',
    free_quota_detail: '무료 $5 크레딧/월(기본 AI 사용), Premium $20/월, Team $30/user/월',
    monthly_price: 20,
  },
  'devin': {
    description: 'Cognition의 자율 코딩 AI 에이전트. 독립적으로 코드 작성·디버깅·배포 수행',
    free_quota_detail: '무료 플랜 없음. 월 $500 구독 필요. 자율 코딩 AI 에이전트.',
    monthly_price: 500,
  },
  'claude-code': {
    description: 'Anthropic의 터미널 코딩 에이전트. Claude API 기반, 자율 코드 작성·리팩토링·디버깅',
    free_quota_detail: 'API 기반 과금(Claude Sonnet 4.5 사용 시 입력 $3/출력 $15 per 1M토큰). Max 구독으로도 사용 가능',
  },

  // ========== 6. 번역 ==========
  'deepl': {
    description: '고품질 AI 번역. 33개 언어 지원, 문서 번역, Write 기능으로 글쓰기 보조',
    free_quota_detail: '웹 번역기 1회 1,500자 제한, API Free 월 500,000자, 문서 번역 월 3개, 용어집 1개',
  },

  // ========== 7. 음성/TTS ==========
  'elevenlabs': {
    description: '최고 품질 AI 음성 합성. 29개 언어, 음성 클론, 텍스트→음성 변환',
    free_quota_detail: '월 10,000 크레딧(~20분 오디오), 커스텀 음성 3개 생성, 기본 TTS 무료',
  },

  // ========== 8. 디자인/프레젠테이션 ==========
  'canva-ai': {
    description: 'Canva의 AI 디자인 도구. Magic Write, AI 이미지 생성, 배경 제거, 2.1M+ 무료 템플릿',
    free_quota_detail: 'AI 디자인 일 3회, Magic Write 프로젝트당 2회, 배경 제거 월 5회, 5GB 저장소. Pro $12.99/월',
    monthly_price: 12.99,
  },

  // ========== 9. 자동화 ==========
  'zapier-ai': {
    description: '노코드 자동화 플랫폼. 7,000+ 앱 연동, AI 챗봇, Zap 자동화 워크플로우',
    free_quota_detail: '월 100 작업 무료, Zap 5개, AI 챗봇 2개, 단일 스텝 자동화만 가능',
  },
};

let updateCount = 0;
let updatedTools = [];

for (const tool of data.tools) {
  const upd = updates[tool.slug];
  if (!upd) continue;

  const changes = [];
  for (const [key, value] of Object.entries(upd)) {
    const oldValue = tool[key];
    if (JSON.stringify(oldValue) !== JSON.stringify(value)) {
      changes.push(key);
      tool[key] = value;
    }
  }

  if (changes.length > 0) {
    updateCount++;
    updatedTools.push({ name: tool.name, slug: tool.slug, changes });
  }
}

writeFileSync(seedPath, JSON.stringify(data, null, 2), 'utf-8');

console.log(`\n✅ ${updateCount}개 도구 업데이트 완료\n`);
updatedTools.forEach(t => {
  console.log(`  ${t.name} (${t.slug}): ${t.changes.join(', ')}`);
});
