/**
 * AI 찾기 위자드 Step 2 동적 질문용 추천 데이터 추가
 *
 * 기존에 없던 조합 5개를 추가:
 *   music/beginner, music/freelancer,
 *   translation/beginner, translation/daily-user,
 *   chat/beginner
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const seedPath = join(__dirname, '..', 'data', 'seed.json');
const data = JSON.parse(readFileSync(seedPath, 'utf-8'));

const NEW_RECOMMENDATIONS = [
  // === music / beginner ===
  { id: 'ptr-music-beginner-1', purpose_slug: 'music', user_type_slug: 'beginner', tool_id: '550e8400-e29b-41d4-a716-446655440040', recommendation_level: 'essential', reason: '텍스트만 입력하면 보컬 포함 완성곡 생성', sort_order: 0, is_killer_pick: true },
  { id: 'ptr-music-beginner-2', purpose_slug: 'music', user_type_slug: 'beginner', tool_id: '550e8400-e29b-41d4-a716-446655440182', recommendation_level: 'essential', reason: '무료로 곡 생성 무제한, 스트리밍 배포 가능', sort_order: 1, is_killer_pick: true },
  { id: 'ptr-music-beginner-3', purpose_slug: 'music', user_type_slug: 'beginner', tool_id: '550e8400-e29b-41d4-a716-446655440180', recommendation_level: 'recommended', reason: '로열티프리 배경음악, 유튜브 영상에 바로 활용', sort_order: 2, is_killer_pick: false },
  { id: 'ptr-music-beginner-4', purpose_slug: 'music', user_type_slug: 'beginner', tool_id: '550e8400-e29b-41d4-a716-446655440183', recommendation_level: 'recommended', reason: '월 10곡 무료 다운로드, 간편한 배경음악 제작', sort_order: 3, is_killer_pick: false },
  { id: 'ptr-music-beginner-5', purpose_slug: 'music', user_type_slug: 'beginner', tool_id: '550e8400-e29b-41d4-a716-446655440185', recommendation_level: 'optional', reason: '소셜 미디어 콘텐츠용 음악 생성에 특화', sort_order: 4, is_killer_pick: false },

  // === music / freelancer ===
  { id: 'ptr-music-freelancer-1', purpose_slug: 'music', user_type_slug: 'freelancer', tool_id: '550e8400-e29b-41d4-a716-446655440040', recommendation_level: 'essential', reason: 'v4 모델로 프로급 보컬 트랙 생성, 구조 태그로 곡 구성 제어', sort_order: 0, is_killer_pick: true },
  { id: 'ptr-music-freelancer-2', purpose_slug: 'music', user_type_slug: 'freelancer', tool_id: '550e8400-e29b-41d4-a716-446655440149', recommendation_level: 'essential', reason: '최고 품질 AI 음성 합성, 29개 언어 음성 클론', sort_order: 1, is_killer_pick: true },
  { id: 'ptr-music-freelancer-3', purpose_slug: 'music', user_type_slug: 'freelancer', tool_id: '550e8400-e29b-41d4-a716-446655440041', recommendation_level: 'recommended', reason: '고음질 AI 음악 생성, Suno의 대안', sort_order: 2, is_killer_pick: false },
  { id: 'ptr-music-freelancer-4', purpose_slug: 'music', user_type_slug: 'freelancer', tool_id: '550e8400-e29b-41d4-a716-446655440042', recommendation_level: 'recommended', reason: '클래식·영화 음악 전문 AI 작곡', sort_order: 3, is_killer_pick: false },
  { id: 'ptr-music-freelancer-5', purpose_slug: 'music', user_type_slug: 'freelancer', tool_id: '550e8400-e29b-41d4-a716-446655440181', recommendation_level: 'optional', reason: '커스텀 배경음악을 세밀하게 편집 가능', sort_order: 4, is_killer_pick: false },

  // === translation / beginner ===
  { id: 'ptr-translation-beginner-1', purpose_slug: 'translation', user_type_slug: 'beginner', tool_id: '550e8400-e29b-41d4-a716-446655440062', recommendation_level: 'essential', reason: '133개 언어 지원, 완전 무료, 가장 범용적', sort_order: 0, is_killer_pick: true },
  { id: 'ptr-translation-beginner-2', purpose_slug: 'translation', user_type_slug: 'beginner', tool_id: '550e8400-e29b-41d4-a716-446655440061', recommendation_level: 'essential', reason: '한국어 번역 정확도 최고, 완전 무료', sort_order: 1, is_killer_pick: true },
  { id: 'ptr-translation-beginner-3', purpose_slug: 'translation', user_type_slug: 'beginner', tool_id: '550e8400-e29b-41d4-a716-446655440060', recommendation_level: 'recommended', reason: '자연스러운 번역 품질, 유럽어에 강점', sort_order: 2, is_killer_pick: false },
  { id: 'ptr-translation-beginner-4', purpose_slug: 'translation', user_type_slug: 'beginner', tool_id: '550e8400-e29b-41d4-a716-446655440204', recommendation_level: 'recommended', reason: '모바일 음성/카메라 번역, 여행에 편리', sort_order: 3, is_killer_pick: false },
  { id: 'ptr-translation-beginner-5', purpose_slug: 'translation', user_type_slug: 'beginner', tool_id: '550e8400-e29b-41d4-a716-446655440203', recommendation_level: 'optional', reason: '오픈소스 번역, 개인정보 보호 중시', sort_order: 4, is_killer_pick: false },

  // === translation / daily-user ===
  { id: 'ptr-translation-daily-1', purpose_slug: 'translation', user_type_slug: 'daily-user', tool_id: '550e8400-e29b-41d4-a716-446655440060', recommendation_level: 'essential', reason: '고품질 문서 번역, 레이아웃 유지, 업무용 최적', sort_order: 0, is_killer_pick: true },
  { id: 'ptr-translation-daily-2', purpose_slug: 'translation', user_type_slug: 'daily-user', tool_id: '550e8400-e29b-41d4-a716-446655440202', recommendation_level: 'essential', reason: '번역 메모리와 용어집으로 일관된 품질 유지', sort_order: 1, is_killer_pick: true },
  { id: 'ptr-translation-daily-3', purpose_slug: 'translation', user_type_slug: 'daily-user', tool_id: '550e8400-e29b-41d4-a716-446655440200', recommendation_level: 'recommended', reason: '번역 후 문체 개선, 비즈니스 이메일에 유용', sort_order: 2, is_killer_pick: false },
  { id: 'ptr-translation-daily-4', purpose_slug: 'translation', user_type_slug: 'daily-user', tool_id: '550e8400-e29b-41d4-a716-446655440201', recommendation_level: 'recommended', reason: 'AI 번역 + 전문 번역가 연결, 중요 문서에 적합', sort_order: 3, is_killer_pick: false },
  { id: 'ptr-translation-daily-5', purpose_slug: 'translation', user_type_slug: 'daily-user', tool_id: '550e8400-e29b-41d4-a716-446655440061', recommendation_level: 'optional', reason: '한국어 특화, 일상 업무 빠른 번역에 편리', sort_order: 4, is_killer_pick: false },

  // === chat / beginner ===
  { id: 'ptr-chat-beginner-1', purpose_slug: 'chat', user_type_slug: 'beginner', tool_id: '550e8400-e29b-41d4-a716-446655440001', recommendation_level: 'essential', reason: '가장 대중적인 AI 챗봇, 쉬운 인터페이스', sort_order: 0, is_killer_pick: true },
  { id: 'ptr-chat-beginner-2', purpose_slug: 'chat', user_type_slug: 'beginner', tool_id: '550e8400-e29b-41d4-a716-446655440002', recommendation_level: 'essential', reason: '정확한 답변, 긴 대화에 강점', sort_order: 1, is_killer_pick: true },
  { id: 'ptr-chat-beginner-3', purpose_slug: 'chat', user_type_slug: 'beginner', tool_id: '550e8400-e29b-41d4-a716-446655440003', recommendation_level: 'recommended', reason: 'Google 연동으로 최신 정보 검색과 대화를 동시에', sort_order: 2, is_killer_pick: false },
  { id: 'ptr-chat-beginner-4', purpose_slug: 'chat', user_type_slug: 'beginner', tool_id: '550e8400-e29b-41d4-a716-446655440070', recommendation_level: 'recommended', reason: '한국어 특화 AI, 한국 사용자에게 친숙', sort_order: 3, is_killer_pick: false },
  { id: 'ptr-chat-beginner-5', purpose_slug: 'chat', user_type_slug: 'beginner', tool_id: '550e8400-e29b-41d4-a716-446655440004', recommendation_level: 'optional', reason: '출처 포함 답변으로 정보 신뢰도가 높음', sort_order: 4, is_killer_pick: false },
];

// Avoid duplicates
const existingIds = new Set(data.purpose_tool_recommendations.map(r => r.id));
const toAdd = NEW_RECOMMENDATIONS.filter(r => !existingIds.has(r.id));

data.purpose_tool_recommendations.push(...toAdd);

console.log(`Added ${toAdd.length} new purpose_tool_recommendations`);
console.log(`Total: ${data.purpose_tool_recommendations.length}`);

// Verify coverage
const byPurpose = {};
data.purpose_tool_recommendations.forEach(r => {
  const key = `${r.purpose_slug}/${r.user_type_slug}`;
  byPurpose[key] = (byPurpose[key] || 0) + 1;
});
console.log('\nAll purpose/user_type combinations:');
Object.entries(byPurpose).sort().forEach(([k, v]) => console.log(`  ${k}: ${v}`));

writeFileSync(seedPath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
console.log('\nseed.json updated successfully!');
