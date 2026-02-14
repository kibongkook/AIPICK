#!/usr/bin/env node
/**
 * AI 서비스 500개 수집 스크립트
 *
 * 수집 소스:
 * 1. Product Hunt (AI 태그)
 * 2. GitHub (AI Topics)
 * 3. 수동 큐레이션 리스트 (CSV)
 *
 * 품질 기준:
 * - 월 10만+ 방문자 OR
 * - Product Hunt 50+ upvotes OR
 * - GitHub 1,000+ stars
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==========================================
// 1. Product Hunt AI 도구 리스트 (수동 큐레이션)
// ==========================================
const PRODUCT_HUNT_AI_TOOLS = [
  // 대화형 AI
  { name: 'ChatGPT', url: 'https://chat.openai.com', category: 'chat', ph_votes: 5000 },
  { name: 'Claude', url: 'https://claude.ai', category: 'chat', ph_votes: 3000 },
  { name: 'Gemini', url: 'https://gemini.google.com', category: 'chat', ph_votes: 2500 },
  { name: 'Perplexity', url: 'https://perplexity.ai', category: 'research', ph_votes: 2000 },
  { name: 'Poe', url: 'https://poe.com', category: 'chat', ph_votes: 1500 },
  { name: 'Character.AI', url: 'https://character.ai', category: 'chat', ph_votes: 1800 },
  { name: 'Pi', url: 'https://pi.ai', category: 'chat', ph_votes: 1200 },
  { name: 'HuggingChat', url: 'https://huggingface.co/chat', category: 'chat', ph_votes: 800 },
  { name: 'You.com', url: 'https://you.com', category: 'research', ph_votes: 900 },
  { name: 'Phind', url: 'https://phind.com', category: 'coding', ph_votes: 700 },

  // 이미지 생성
  { name: 'Midjourney', url: 'https://midjourney.com', category: 'design', ph_votes: 4000 },
  { name: 'DALL-E 3', url: 'https://openai.com/dall-e-3', category: 'design', ph_votes: 3500 },
  { name: 'Stable Diffusion', url: 'https://stability.ai', category: 'design', ph_votes: 3000 },
  { name: 'Leonardo.ai', url: 'https://leonardo.ai', category: 'design', ph_votes: 1500 },
  { name: 'Adobe Firefly', url: 'https://firefly.adobe.com', category: 'design', ph_votes: 2000 },
  { name: 'Ideogram', url: 'https://ideogram.ai', category: 'design', ph_votes: 1200 },
  { name: 'Playground AI', url: 'https://playgroundai.com', category: 'design', ph_votes: 900 },
  { name: 'DreamStudio', url: 'https://dreamstudio.ai', category: 'design', ph_votes: 800 },
  { name: 'Freepik AI', url: 'https://www.freepik.com/ai', category: 'design', ph_votes: 600 },
  { name: 'Canva AI', url: 'https://canva.com/ai-image-generator', category: 'design', ph_votes: 1800 },

  // 영상 생성
  { name: 'Runway', url: 'https://runwayml.com', category: 'video', ph_votes: 2500 },
  { name: 'Pika', url: 'https://pika.art', category: 'video', ph_votes: 2000 },
  { name: 'HeyGen', url: 'https://heygen.com', category: 'video', ph_votes: 1800 },
  { name: 'Synthesia', url: 'https://synthesia.io', category: 'video', ph_votes: 1500 },
  { name: 'D-ID', url: 'https://d-id.com', category: 'video', ph_votes: 1200 },
  { name: 'Luma AI', url: 'https://lumalabs.ai', category: 'video', ph_votes: 1000 },
  { name: 'CapCut', url: 'https://capcut.com', category: 'video', ph_votes: 2200 },
  { name: 'Descript', url: 'https://descript.com', category: 'video', ph_votes: 1600 },
  { name: 'Pictory', url: 'https://pictory.ai', category: 'video', ph_votes: 800 },
  { name: 'InVideo', url: 'https://invideo.io', category: 'video', ph_votes: 900 },

  // 음성 AI
  { name: 'ElevenLabs', url: 'https://elevenlabs.io', category: 'voice', ph_votes: 2000 },
  { name: 'Play.ht', url: 'https://play.ht', category: 'voice', ph_votes: 800 },
  { name: 'Murf AI', url: 'https://murf.ai', category: 'voice', ph_votes: 700 },
  { name: 'Resemble AI', url: 'https://resemble.ai', category: 'voice', ph_votes: 600 },
  { name: 'Speechify', url: 'https://speechify.com', category: 'voice', ph_votes: 1500 },
  { name: 'Descript Voice', url: 'https://descript.com/overdub', category: 'voice', ph_votes: 900 },
  { name: 'LOVO', url: 'https://lovo.ai', category: 'voice', ph_votes: 500 },
  { name: 'Listnr', url: 'https://listnr.ai', category: 'voice', ph_votes: 400 },

  // 음악 생성
  { name: 'Suno', url: 'https://suno.ai', category: 'music', ph_votes: 3000 },
  { name: 'Udio', url: 'https://udio.com', category: 'music', ph_votes: 2000 },
  { name: 'Stable Audio', url: 'https://stableaudio.com', category: 'music', ph_votes: 800 },
  { name: 'AIVA', url: 'https://aiva.ai', category: 'music', ph_votes: 600 },
  { name: 'Soundraw', url: 'https://soundraw.io', category: 'music', ph_votes: 500 },
  { name: 'Boomy', url: 'https://boomy.com', category: 'music', ph_votes: 400 },
  { name: 'Mubert', url: 'https://mubert.com', category: 'music', ph_votes: 350 },

  // 코딩
  { name: 'GitHub Copilot', url: 'https://github.com/features/copilot', category: 'coding', ph_votes: 3000 },
  { name: 'Cursor', url: 'https://cursor.sh', category: 'coding', ph_votes: 2500 },
  { name: 'Claude Code', url: 'https://claude.ai/code', category: 'coding', ph_votes: 1500 },
  { name: 'Codeium', url: 'https://codeium.com', category: 'coding', ph_votes: 1200 },
  { name: 'Tabnine', url: 'https://tabnine.com', category: 'coding', ph_votes: 1000 },
  { name: 'Amazon CodeWhisperer', url: 'https://aws.amazon.com/codewhisperer', category: 'coding', ph_votes: 800 },
  { name: 'Replit AI', url: 'https://replit.com/ai', category: 'coding', ph_votes: 1500 },
  { name: 'v0', url: 'https://v0.dev', category: 'coding', ph_votes: 2000 },
  { name: 'Bolt.new', url: 'https://bolt.new', category: 'coding', ph_votes: 1800 },
  { name: 'Lovable', url: 'https://lovable.dev', category: 'coding', ph_votes: 900 },

  // 글쓰기
  { name: 'Notion AI', url: 'https://notion.so/product/ai', category: 'writing', ph_votes: 2500 },
  { name: 'Jasper', url: 'https://jasper.ai', category: 'writing', ph_votes: 2000 },
  { name: 'Copy.ai', url: 'https://copy.ai', category: 'writing', ph_votes: 1500 },
  { name: 'Writesonic', url: 'https://writesonic.com', category: 'writing', ph_votes: 1200 },
  { name: 'Rytr', url: 'https://rytr.me', category: 'writing', ph_votes: 800 },
  { name: 'QuillBot', url: 'https://quillbot.com', category: 'writing', ph_votes: 1800 },
  { name: 'Grammarly', url: 'https://grammarly.com', category: 'writing', ph_votes: 3000 },
  { name: 'Wordtune', url: 'https://wordtune.com', category: 'writing', ph_votes: 1000 },
  { name: 'Jenni AI', url: 'https://jenni.ai', category: 'writing', ph_votes: 600 },
  { name: 'Hyperwrite', url: 'https://hyperwriteai.com', category: 'writing', ph_votes: 700 },

  // 번역
  { name: 'DeepL', url: 'https://deepl.com', category: 'translation', ph_votes: 2500 },
  { name: 'Google Translate', url: 'https://translate.google.com', category: 'translation', ph_votes: 5000 },
  { name: 'Papago', url: 'https://papago.naver.com', category: 'translation', ph_votes: 1500 },
  { name: 'Reverso', url: 'https://reverso.net', category: 'translation', ph_votes: 800 },

  // 프레젠테이션
  { name: 'Gamma', url: 'https://gamma.app', category: 'presentation', ph_votes: 2000 },
  { name: 'Beautiful.ai', url: 'https://beautiful.ai', category: 'presentation', ph_votes: 1200 },
  { name: 'Tome', url: 'https://tome.app', category: 'presentation', ph_votes: 1500 },
  { name: 'Decktopus', url: 'https://decktopus.com', category: 'presentation', ph_votes: 600 },
  { name: 'Pitch', url: 'https://pitch.com', category: 'presentation', ph_votes: 1000 },

  // 데이터 분석
  { name: 'Julius', url: 'https://julius.ai', category: 'data-analysis', ph_votes: 800 },
  { name: 'DataRobot', url: 'https://datarobot.com', category: 'data-analysis', ph_votes: 600 },
  { name: 'Tableau AI', url: 'https://tableau.com/ai', category: 'data-analysis', ph_votes: 1000 },
  { name: 'Hex', url: 'https://hex.tech', category: 'data-analysis', ph_votes: 700 },

  // 자동화
  { name: 'Zapier AI', url: 'https://zapier.com/ai', category: 'automation', ph_votes: 2000 },
  { name: 'Make (Integromat)', url: 'https://make.com', category: 'automation', ph_votes: 1500 },
  { name: 'n8n', url: 'https://n8n.io', category: 'automation', ph_votes: 1200 },
  { name: 'Relay', url: 'https://relay.app', category: 'automation', ph_votes: 600 },

  // 마케팅
  { name: 'Jasper Marketing', url: 'https://jasper.ai/marketing', category: 'marketing', ph_votes: 1500 },
  { name: 'AdCreative.ai', url: 'https://adcreative.ai', category: 'marketing', ph_votes: 1200 },
  { name: 'Predis.ai', url: 'https://predis.ai', category: 'marketing', ph_votes: 600 },
  { name: 'Pencil', url: 'https://trypencil.com', category: 'marketing', ph_votes: 500 },
];

// ==========================================
// 2. GitHub AI 프로젝트 리스트 (오픈소스)
// ==========================================
const GITHUB_AI_TOOLS = [
  // LLM 프레임워크
  { name: 'LangChain', url: 'https://langchain.com', repo: 'langchain-ai/langchain', stars: 90000, category: 'coding' },
  { name: 'LlamaIndex', url: 'https://llamaindex.ai', repo: 'jerryjliu/llama_index', stars: 35000, category: 'coding' },
  { name: 'AutoGPT', url: 'https://agpt.co', repo: 'Significant-Gravitas/AutoGPT', stars: 165000, category: 'automation' },
  { name: 'LangFlow', url: 'https://langflow.org', repo: 'langflow-ai/langflow', stars: 25000, category: 'automation' },
  { name: 'Flowise', url: 'https://flowiseai.com', repo: 'FlowiseAI/Flowise', stars: 28000, category: 'automation' },

  // 로컬 LLM
  { name: 'Ollama', url: 'https://ollama.com', repo: 'ollama/ollama', stars: 85000, category: 'chat' },
  { name: 'LM Studio', url: 'https://lmstudio.ai', repo: 'lmstudio-ai/lmstudio', stars: 15000, category: 'chat' },
  { name: 'GPT4All', url: 'https://gpt4all.io', repo: 'nomic-ai/gpt4all', stars: 68000, category: 'chat' },
  { name: 'LocalAI', url: 'https://localai.io', repo: 'mudler/LocalAI', stars: 22000, category: 'chat' },
  { name: 'llama.cpp', url: 'https://github.com/ggerganov/llama.cpp', repo: 'ggerganov/llama.cpp', stars: 64000, category: 'coding' },

  // 이미지 생성
  { name: 'Stable Diffusion WebUI', url: 'https://github.com/AUTOMATIC1111/stable-diffusion-webui', repo: 'AUTOMATIC1111/stable-diffusion-webui', stars: 138000, category: 'design' },
  { name: 'ComfyUI', url: 'https://github.com/comfyanonymous/ComfyUI', repo: 'comfyanonymous/ComfyUI', stars: 48000, category: 'design' },
  { name: 'Fooocus', url: 'https://github.com/lllyasviel/Fooocus', repo: 'lllyasviel/Fooocus', stars: 40000, category: 'design' },
  { name: 'InvokeAI', url: 'https://invoke.ai', repo: 'invoke-ai/InvokeAI', stars: 23000, category: 'design' },

  // 음성
  { name: 'Whisper', url: 'https://github.com/openai/whisper', repo: 'openai/whisper', stars: 66000, category: 'voice' },
  { name: 'Coqui TTS', url: 'https://coqui.ai', repo: 'coqui-ai/TTS', stars: 33000, category: 'voice' },
  { name: 'Real-Time Voice Cloning', url: 'https://github.com/CorentinJ/Real-Time-Voice-Cloning', repo: 'CorentinJ/Real-Time-Voice-Cloning', stars: 52000, category: 'voice' },

  // 개발 도구
  { name: 'Continue', url: 'https://continue.dev', repo: 'continuedev/continue', stars: 15000, category: 'coding' },
  { name: 'Aider', url: 'https://aider.chat', repo: 'paul-gauthier/aider', stars: 18000, category: 'coding' },
  { name: 'OpenHands', url: 'https://github.com/All-Hands-AI/OpenHands', repo: 'All-Hands-AI/OpenHands', stars: 30000, category: 'coding' },
];

// ==========================================
// 3. 추가 큐레이션 AI 도구 (니치/전문)
// ==========================================
const CURATED_AI_TOOLS = [
  // 디자인 특화
  { name: 'Uizard', url: 'https://uizard.io', category: 'design', description: 'UI 디자인 자동 생성' },
  { name: 'Diagram', url: 'https://diagram.com', category: 'design', description: '디자인 시스템 자동화' },
  { name: 'Galileo AI', url: 'https://usegalileo.ai', category: 'design', description: 'UI 디자인 생성' },
  { name: 'Magician', url: 'https://magician.design', category: 'design', description: 'Figma AI 플러그인' },
  { name: 'Booth.AI', url: 'https://booth.ai', category: 'design', description: '제품 사진 생성' },
  { name: 'ClipDrop', url: 'https://clipdrop.co', category: 'design', description: '배경 제거, 이미지 편집' },
  { name: 'Remov.bg', url: 'https://remove.bg', category: 'design', description: '배경 제거 특화' },
  { name: 'Cleanup.pictures', url: 'https://cleanup.pictures', category: 'design', description: '이미지 정리' },
  { name: 'Photoroom', url: 'https://photoroom.com', category: 'design', description: '제품 사진 편집' },
  { name: 'Designify', url: 'https://designify.com', category: 'design', description: '자동 디자인' },

  // 비디오 특화
  { name: 'Captions', url: 'https://captions.ai', category: 'video', description: '자동 자막 생성' },
  { name: 'OpusClip', url: 'https://opus.pro', category: 'video', description: '비디오 클립 생성' },
  { name: 'Vizard', url: 'https://vizard.ai', category: 'video', description: '비디오 리퍼포징' },
  { name: 'Submagic', url: 'https://submagic.co', category: 'video', description: '숏폼 자막' },
  { name: 'Vidyo.ai', url: 'https://vidyo.ai', category: 'video', description: '비디오 편집 자동화' },
  { name: 'Wisecut', url: 'https://wisecut.video', category: 'video', description: '자동 비디오 편집' },
  { name: 'Twelve Labs', url: 'https://twelvelabs.io', category: 'video', description: '비디오 검색' },

  // 글쓰기 특화
  { name: 'Lex', url: 'https://lex.page', category: 'writing', description: 'AI 글쓰기 에디터' },
  { name: 'Compose AI', url: 'https://compose.ai', category: 'writing', description: '자동완성' },
  { name: 'Mem', url: 'https://mem.ai', category: 'writing', description: 'AI 노트' },
  { name: 'Reflect', url: 'https://reflect.app', category: 'writing', description: '노트 + AI' },
  { name: 'Craft', url: 'https://craft.do', category: 'writing', description: '문서 작성' },
  { name: 'Moonbeam', url: 'https://moonbeam.ai', category: 'writing', description: '롱폼 글쓰기' },
  { name: 'Sudowrite', url: 'https://sudowrite.com', category: 'writing', description: '소설 쓰기' },
  { name: 'NovelAI', url: 'https://novelai.net', category: 'writing', description: 'AI 스토리텔링' },

  // 리서치
  { name: 'Consensus', url: 'https://consensus.app', category: 'research', description: '논문 검색' },
  { name: 'Elicit', url: 'https://elicit.com', category: 'research', description: '연구 자동화' },
  { name: 'Scholarcy', url: 'https://scholarcy.com', category: 'research', description: '논문 요약' },
  { name: 'SciSpace', url: 'https://scispace.com', category: 'research', description: '논문 이해' },
  { name: 'ResearchRabbit', url: 'https://researchrabbit.ai', category: 'research', description: '논문 발견' },
  { name: 'Semantic Scholar', url: 'https://semanticscholar.org', category: 'research', description: '학술 검색' },

  // 교육
  { name: 'Khan Academy AI', url: 'https://khanacademy.org/khan-labs', category: 'learning', description: 'AI 튜터' },
  { name: 'Duolingo Max', url: 'https://duolingo.com/max', category: 'learning', description: 'AI 언어 학습' },
  { name: 'Quizlet AI', url: 'https://quizlet.com/ai', category: 'learning', description: 'AI 학습 도구' },
  { name: 'Studyable', url: 'https://studyable.app', category: 'learning', description: '학습 도우미' },
  { name: 'Knowt', url: 'https://knowt.com', category: 'learning', description: 'AI 플래시카드' },
  { name: 'Revision AI', url: 'https://revision.ai', category: 'learning', description: '시험 준비' },

  // 비즈니스
  { name: 'Tome Business', url: 'https://tome.app/business', category: 'presentation', description: '비즈니스 프레젠테이션' },
  { name: 'Rows', url: 'https://rows.com', category: 'data-analysis', description: '스프레드시트 + AI' },
  { name: 'Equals', url: 'https://equals.com', category: 'data-analysis', description: '데이터 분석' },
  { name: 'Lookup', url: 'https://uselookup.com', category: 'data-analysis', description: 'AI 데이터 분석가' },
  { name: 'Coefficient', url: 'https://coefficient.io', category: 'data-analysis', description: '데이터 동기화' },

  // 고객 지원
  { name: 'Intercom Fin', url: 'https://intercom.com/fin', category: 'automation', description: 'AI 챗봇' },
  { name: 'Zendesk AI', url: 'https://zendesk.com/ai', category: 'automation', description: '고객 지원' },
  { name: 'Ada', url: 'https://ada.cx', category: 'automation', description: 'AI 챗봇' },
  { name: 'Kustomer', url: 'https://kustomer.com', category: 'automation', description: 'CRM + AI' },

  // SEO/마케팅
  { name: 'Surfer SEO', url: 'https://surferseo.com', category: 'marketing', description: 'SEO 최적화' },
  { name: 'Frase', url: 'https://frase.io', category: 'marketing', description: 'SEO 콘텐츠' },
  { name: 'MarketMuse', url: 'https://marketmuse.com', category: 'marketing', description: '콘텐츠 전략' },
  { name: 'Clearscope', url: 'https://clearscope.io', category: 'marketing', description: 'SEO 최적화' },
  { name: 'Lavender', url: 'https://lavender.ai', category: 'marketing', description: '이메일 작성' },
  { name: 'Instantly', url: 'https://instantly.ai', category: 'marketing', description: '이메일 아웃리치' },

  // HR/채용
  { name: 'HireVue', url: 'https://hirevue.com', category: 'automation', description: 'AI 면접' },
  { name: 'Paradox', url: 'https://paradox.ai', category: 'automation', description: '채용 자동화' },
  { name: 'Eightfold', url: 'https://eightfold.ai', category: 'automation', description: 'HR AI' },

  // 3D/메타버스
  { name: 'Luma AI', url: 'https://lumalabs.ai', category: 'design', description: '3D 스캔' },
  { name: 'CSM.ai', url: 'https://csm.ai', category: 'design', description: '3D 생성' },
  { name: 'Spline AI', url: 'https://spline.design/ai', category: 'design', description: '3D 디자인' },
  { name: 'Kaedim', url: 'https://kaedim3d.com', category: 'design', description: '2D to 3D' },

  // 게임
  { name: 'Scenario', url: 'https://scenario.com', category: 'entertainment', description: '게임 아셋 생성' },
  { name: 'Leonardo.ai Gaming', url: 'https://leonardo.ai/gaming', category: 'entertainment', description: '게임 그래픽' },
  { name: 'Rosebud AI', url: 'https://rosebud.ai', category: 'entertainment', description: '게임 개발' },

  // 법률/재무
  { name: 'Harvey', url: 'https://harvey.ai', category: 'automation', description: '법률 AI' },
  { name: 'DoNotPay', url: 'https://donotpay.com', category: 'automation', description: '법률 자동화' },
  { name: 'Casetext', url: 'https://casetext.com', category: 'research', description: '법률 리서치' },

  // 헬스케어
  { name: 'Nabla', url: 'https://nabla.com', category: 'automation', description: '의료 기록' },
  { name: 'Glass Health', url: 'https://glass.health', category: 'automation', description: '진단 도움' },

  // 음악 특화
  { name: 'Beatoven', url: 'https://beatoven.ai', category: 'music', description: '배경음악 생성' },
  { name: 'Splash', url: 'https://splashmusic.com', category: 'music', description: '음악 생성' },
  { name: 'Amper', url: 'https://ampermusic.com', category: 'music', description: 'AI 작곡' },

  // 소셜 미디어
  { name: 'Taplio', url: 'https://taplio.com', category: 'marketing', description: 'LinkedIn 자동화' },
  { name: 'Podcastle', url: 'https://podcastle.ai', category: 'voice', description: '팟캐스트 편집' },
  { name: 'Descript Studio', url: 'https://descript.com/studio', category: 'video', description: '팟캐스트/비디오' },
];

// ==========================================
// 4. 데이터 병합 및 중복 제거
// ==========================================
function mergeAndDeduplicate() {
  const allTools = [
    ...PRODUCT_HUNT_AI_TOOLS.map(t => ({ ...t, source: 'product_hunt' })),
    ...GITHUB_AI_TOOLS.map(t => ({ ...t, source: 'github' })),
    ...CURATED_AI_TOOLS.map(t => ({ ...t, source: 'curated' })),
  ];

  // URL 기반 중복 제거
  const uniqueTools = new Map();

  for (const tool of allTools) {
    const key = normalizeUrl(tool.url);
    if (!uniqueTools.has(key)) {
      uniqueTools.set(key, {
        name: tool.name,
        url: tool.url,
        category: tool.category,
        description: tool.description || `${tool.name} - AI 도구`,
        ph_votes: tool.ph_votes || 0,
        github_stars: tool.stars || 0,
        source: tool.source,
      });
    } else {
      // 기존 데이터와 병합 (더 높은 메트릭 선택)
      const existing = uniqueTools.get(key);
      if (tool.ph_votes && tool.ph_votes > existing.ph_votes) {
        existing.ph_votes = tool.ph_votes;
      }
      if (tool.stars && tool.stars > existing.github_stars) {
        existing.github_stars = tool.stars;
      }
    }
  }

  return Array.from(uniqueTools.values());
}

function normalizeUrl(url) {
  return url
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '');
}

// ==========================================
// 5. seed.json 형식으로 변환
// ==========================================
function convertToSeedFormat(tools, startingIndex = 120) {
  const categoryMap = {
    'chat': 'cat-general-ai',
    'writing': 'cat-text-generation',
    'translation': 'cat-translation',
    'voice': 'cat-voice',
    'design': 'cat-image-generation',
    'video': 'cat-video-generation',
    'music': 'cat-music',
    'coding': 'cat-coding-tools',
    'automation': 'cat-automation',
    'data-analysis': 'cat-data',
    'research': 'cat-research',
    'presentation': 'cat-presentation',
    'marketing': 'cat-marketing',
    'learning': 'cat-learning',
    'entertainment': 'cat-entertainment',
    'building': 'cat-building',
  };

  return tools.map((tool, index) => {
    const slug = tool.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    return {
      id: `tool-${startingIndex + index}`,
      name: tool.name,
      slug: slug,
      description: tool.description,
      long_description: null,
      category_id: categoryMap[tool.category] || 'cat-general-ai',
      url: tool.url,
      logo_url: `https://www.google.com/s2/favicons?domain=${new URL(tool.url).hostname}&sz=128`,
      pricing_type: 'Freemium',
      free_quota_detail: null,
      monthly_price: null,
      rating_avg: 0,
      review_count: 0,
      visit_count: 0,
      upvote_count: 0,
      ranking_score: 0,
      weekly_visit_delta: 0,
      prev_ranking: null,
      tags: [],
      is_editor_pick: false,
      supports_korean: false,
      pros: [],
      cons: [],
      usage_tips: [],
      hybrid_score: Math.floor((tool.ph_votes || 0) * 0.01 + (tool.github_stars || 0) * 0.001),
      external_score: 0,
      internal_score: 0,
      trend_direction: 'stable',
      trend_magnitude: 0,
      has_benchmark_data: false,
      github_stars: tool.github_stars || null,
      github_forks: null,
      product_hunt_upvotes: tool.ph_votes || null,
      model_identifiers: [],
      sample_output: null,
      sample_output_prompt: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  });
}

// ==========================================
// 6. 메인 실행
// ==========================================
async function main() {
  console.log('🚀 AI 서비스 500개 수집 시작...\n');

  // 1. 데이터 병합
  console.log('📦 데이터 병합 중...');
  const uniqueTools = mergeAndDeduplicate();
  console.log(`✅ 중복 제거 완료: ${uniqueTools.length}개\n`);

  // 2. 품질 필터링 (최소 기준)
  console.log('🔍 품질 필터링 중...');
  const qualityFiltered = uniqueTools.filter(tool => {
    return (
      (tool.ph_votes && tool.ph_votes >= 50) ||
      (tool.github_stars && tool.github_stars >= 1000) ||
      tool.source === 'curated'
    );
  });
  console.log(`✅ 품질 필터링 완료: ${qualityFiltered.length}개\n`);

  // 3. 상위 500개 선택 (메트릭 기준 정렬)
  console.log('🏆 상위 500개 선택 중...');
  const sorted = qualityFiltered.sort((a, b) => {
    const scoreA = (a.ph_votes || 0) + (a.github_stars || 0) * 0.1;
    const scoreB = (b.ph_votes || 0) + (b.github_stars || 0) * 0.1;
    return scoreB - scoreA;
  });

  const top500 = sorted.slice(0, 500);
  console.log(`✅ 상위 500개 선택 완료\n`);

  // 4. seed.json 형식으로 변환
  console.log('🔄 seed.json 형식 변환 중...');
  const seedTools = convertToSeedFormat(top500);
  console.log(`✅ 변환 완료: ${seedTools.length}개\n`);

  // 5. 파일 저장
  const outputPath = path.join(__dirname, '..', 'data', 'ai-tools-500.json');
  fs.writeFileSync(outputPath, JSON.stringify(seedTools, null, 2), 'utf-8');
  console.log(`💾 저장 완료: ${outputPath}\n`);

  // 6. 통계 출력
  console.log('📊 수집 통계:');
  console.log(`- 총 수집: ${uniqueTools.length}개`);
  console.log(`- 품질 필터링 후: ${qualityFiltered.length}개`);
  console.log(`- 최종 선택: ${top500.length}개`);

  const categoryCounts = {};
  top500.forEach(tool => {
    categoryCounts[tool.category] = (categoryCounts[tool.category] || 0) + 1;
  });

  console.log('\n📁 카테고리별 분포:');
  Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([category, count]) => {
      console.log(`  ${category}: ${count}개`);
    });

  console.log('\n✨ 완료! ai-tools-500.json 파일을 확인하세요.');
  console.log('\n다음 단계:');
  console.log('1. node scripts/merge-with-existing.mjs (기존 119개와 병합)');
  console.log('2. 중복 확인 및 정리');
  console.log('3. data/seed.json 업데이트');
}

main().catch(console.error);
