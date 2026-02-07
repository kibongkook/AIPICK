/**
 * enhance-recommendations.mjs
 *
 * 1. 페르소나별 킬러 서비스 지정 (is_killer_pick: true)
 * 2. 약한 페르소나 보강 (부족한 추천 추가)
 * 3. 누락된 등급 채우기 (edu-college/teacher guided 등급)
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const seedPath = resolve(__dirname, '../data/seed.json');
const seed = JSON.parse(readFileSync(seedPath, 'utf-8'));

const tools = seed.tools;
const jobRecs = seed.job_tool_recommendations;
const eduRecs = seed.edu_tool_recommendations;

// 도구 slug → id 매핑
const toolMap = {};
for (const t of tools) {
  toolMap[t.slug] = t.id;
}

// ── 1. 직군별 킬러 서비스 지정 ──
const JOB_KILLER_PICKS = {
  'job-ai-dev': ['cursor', 'claude'],                    // AI 개발의 핵심: 코드 에디터 + AI 파트너
  'job-uiux': ['midjourney', 'canva-ai'],                // 디자인 영감 + 실무 제작
  'job-graphic': ['midjourney', 'canva-ai'],             // 이미지 생성 + 디자인 통합
  'job-marketer': ['chatgpt', 'canva-ai'],               // 카피 + 비주얼
  'job-video': ['runway-ml', 'capcut'],                   // AI 생성 + 편집
  'job-writer': ['claude', 'grammarly'],                  // 장문 작성 + 교정
  'job-data': ['julius-ai', 'chatgpt'],                   // 데이터 분석 + 종합 AI
  'job-music': ['suno-ai', 'udio'],                       // 음악 생성 양대 산맥
  'job-biz': ['chatgpt', 'notion-ai'],                    // 기획 + 문서화
  'job-pm': ['notion-ai', 'chatgpt'],                     // 프로젝트 관리 + AI 보조
};

// ── 2. 학년별 킬러 서비스 지정 ──
const EDU_KILLER_PICKS = {
  'edu-elementary-low': ['google-translate', 'papago'],    // 언어 학습 도우미
  'edu-elementary-high': ['canva-ai', 'google-translate'], // 창작 + 언어
  'edu-middle': ['chatgpt', 'canva-ai'],                   // 학습 + 창작
  'edu-high': ['chatgpt', 'perplexity'],                   // 학습 + 리서치
  'edu-college': ['chatgpt', 'claude'],                    // 리서치 + 작문
  'edu-teacher': ['chatgpt', 'gamma'],                     // 수업 준비 + 프레젠테이션
  'edu-parent': ['chatgpt', 'canva-ai'],                   // 자녀 교육 + 활동
  'edu-academy': ['chatgpt', 'gamma'],                     // 강의 + 자료 제작
  'edu-coding': ['cursor', 'replit'],                      // 코딩 학습 + 실습
};

// ── 3. 부족한 추천 보강 데이터 ──
const NEW_JOB_RECS = [
  // job-biz 보강: essential 2→4
  { job: 'job-biz', slug: 'gamma', level: 'essential', reason: '프레젠테이션 자동 생성으로 보고서/제안서 제작 시간 90% 단축' },
  { job: 'job-biz', slug: 'claude', level: 'essential', reason: '복잡한 비즈니스 분석과 전략 문서 작성에 최적화' },

  // job-uiux 보강: essential 2→3, 총 9→11
  { job: 'job-uiux', slug: 'midjourney', level: 'essential', reason: 'UI 컨셉 아트와 디자인 영감 무한 생성' },
  { job: 'job-uiux', slug: 'cursor', level: 'recommended', reason: 'AI 코드 지원으로 프로토타입 빠르게 구현' },

  // job-music 보강: 총 7→10
  { job: 'job-music', slug: 'elevenlabs', level: 'recommended', reason: '보컬 합성과 음성 생성으로 음악에 보이스 추가' },
  { job: 'job-music', slug: 'canva-ai', level: 'optional', reason: '앨범 커버와 뮤직 비주얼 콘텐츠 제작' },
  { job: 'job-music', slug: 'runway-ml', level: 'optional', reason: 'AI 뮤직비디오 생성과 비주얼 이펙트' },
];

const NEW_EDU_RECS = [
  // edu-coding 보강: safe/guided 추가
  { edu: 'edu-coding', slug: 'canva-ai', safety: 'safe', useCase: '코딩 프로젝트 포스터와 발표 자료 만들기' },
  { edu: 'edu-coding', slug: 'gamma', safety: 'safe', useCase: '코딩 프로젝트 발표용 슬라이드 자동 제작' },
  { edu: 'edu-coding', slug: 'wrtn', safety: 'guided', useCase: '한국어로 코딩 개념 설명 받기' },
  { edu: 'edu-coding', slug: 'perplexity', safety: 'guided', useCase: '프로그래밍 문제 검색과 풀이 참고' },

  // edu-academy 보강: 총 5→9
  { edu: 'edu-academy', slug: 'midjourney', safety: 'advanced', useCase: '수업 자료용 고품질 이미지 생성' },
  { edu: 'edu-academy', slug: 'vrew', safety: 'advanced', useCase: '강의 영상에 자동 자막 생성' },
  { edu: 'edu-academy', slug: 'suno-ai', safety: 'advanced', useCase: '수업 도입부 배경 음악 제작' },
  { edu: 'edu-academy', slug: 'deepl', safety: 'safe', useCase: '외국어 수업 자료 번역' },

  // edu-elementary-low 보강: 총 4→7
  { edu: 'edu-elementary-low', slug: 'canva-ai', safety: 'safe', useCase: '그림 일기와 포스터 만들기' },
  { edu: 'edu-elementary-low', slug: 'suno-ai', safety: 'guided', useCase: '간단한 동요 만들기 체험' },
  { edu: 'edu-elementary-low', slug: 'character-ai', safety: 'guided', useCase: '캐릭터와 대화하며 영어 연습' },

  // edu-college guided 등급 추가
  { edu: 'edu-college', slug: 'notion-ai', safety: 'guided', useCase: '강의 노트 정리와 리서치 메모 구조화' },
  { edu: 'edu-college', slug: 'wrtn', safety: 'guided', useCase: '한국어 리포트 작성 보조' },
  { edu: 'edu-college', slug: 'gamma', safety: 'guided', useCase: '팀 프로젝트 발표 자료 제작' },
  { edu: 'edu-college', slug: 'deepl', safety: 'guided', useCase: '외국 논문 번역과 영어 리포트 작성' },

  // edu-teacher guided 등급 추가
  { edu: 'edu-teacher', slug: 'notion-ai', safety: 'guided', useCase: '수업 계획서와 평가 기준표 작성' },
  { edu: 'edu-teacher', slug: 'midjourney', safety: 'guided', useCase: '수업 자료용 삽화 생성' },
  { edu: 'edu-teacher', slug: 'deepl', safety: 'guided', useCase: '다문화 학생 소통용 번역 도구' },

  // edu-parent 보강: 총 5→8
  { edu: 'edu-parent', slug: 'gamma', safety: 'safe', useCase: '학교 발표 자료 도와주기' },
  { edu: 'edu-parent', slug: 'deepl', safety: 'safe', useCase: '자녀 영어 숙제 번역 도움' },
  { edu: 'edu-parent', slug: 'suno-ai', safety: 'guided', useCase: '자녀와 함께 동요 만들기 체험' },
];

// ── 적용 ──
let killerCount = 0;
let newJobCount = 0;
let newEduCount = 0;

// 1. 킬러 서비스 플래그 설정 (직군)
for (const rec of jobRecs) {
  const jobId = rec.job_category_id;
  const killers = JOB_KILLER_PICKS[jobId];
  if (!killers) continue;

  const tool = tools.find(t => t.id === rec.tool_id);
  if (tool && killers.includes(tool.slug)) {
    rec.is_killer_pick = true;
    killerCount++;
  }
}

// 2. 킬러 서비스 플래그 설정 (학년)
for (const rec of eduRecs) {
  const eduId = rec.edu_level_id;
  const killers = EDU_KILLER_PICKS[eduId];
  if (!killers) continue;

  const tool = tools.find(t => t.id === rec.tool_id);
  if (tool && killers.includes(tool.slug)) {
    rec.is_killer_pick = true;
    killerCount++;
  }
}

// 3. 새 직군 추천 추가 (중복 체크)
for (const r of NEW_JOB_RECS) {
  const toolId = toolMap[r.slug];
  if (!toolId) {
    console.warn(`Tool not found: ${r.slug}`);
    continue;
  }
  // 중복 체크
  const exists = jobRecs.find(jr => jr.job_category_id === r.job && jr.tool_id === toolId);
  if (exists) {
    console.log(`Skip duplicate: ${r.job} + ${r.slug}`);
    continue;
  }
  const maxSort = Math.max(0, ...jobRecs.filter(jr => jr.job_category_id === r.job).map(jr => jr.sort_order));
  jobRecs.push({
    id: randomUUID(),
    job_category_id: r.job,
    tool_id: toolId,
    recommendation_level: r.level,
    reason: r.reason,
    sort_order: maxSort + 1,
    is_killer_pick: (JOB_KILLER_PICKS[r.job] || []).includes(r.slug),
  });
  newJobCount++;
}

// 4. 새 학년 추천 추가 (중복 체크)
for (const r of NEW_EDU_RECS) {
  const toolId = toolMap[r.slug];
  if (!toolId) {
    console.warn(`Tool not found: ${r.slug}`);
    continue;
  }
  const exists = eduRecs.find(er => er.edu_level_id === r.edu && er.tool_id === toolId);
  if (exists) {
    console.log(`Skip duplicate: ${r.edu} + ${r.slug}`);
    continue;
  }
  const maxSort = Math.max(0, ...eduRecs.filter(er => er.edu_level_id === r.edu).map(er => er.sort_order));
  eduRecs.push({
    id: randomUUID(),
    edu_level_id: r.edu,
    tool_id: toolId,
    safety_level: r.safety,
    use_case: r.useCase,
    sort_order: maxSort + 1,
    is_killer_pick: (EDU_KILLER_PICKS[r.edu] || []).includes(r.slug),
  });
  newEduCount++;
}

// 저장
writeFileSync(seedPath, JSON.stringify(seed, null, 2), 'utf-8');

console.log('=== Recommendation Enhancement Summary ===');
console.log(`Killer picks flagged: ${killerCount}`);
console.log(`New job recommendations: ${newJobCount}`);
console.log(`New edu recommendations: ${newEduCount}`);
console.log(`Total job recs: ${jobRecs.length}`);
console.log(`Total edu recs: ${eduRecs.length}`);
console.log('Done!');
