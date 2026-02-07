# AIPICK - 다음 할일 (Next Tasks)

> 마지막 업데이트: 2026-02-07
> 현재 상태: Phase 6 완료 + 피드백 개선 Phase A~C 완료, Phase D 진행중

---

## 완료된 작업 요약

### 기본 개발 (Phase 1~6) ✅
- Phase 1: 프로젝트 셋업 + 메인 UI
- Phase 2: Supabase 연동 + DB 스키마 + 상세/랭킹/직군/학년 페이지
- Phase 3: 검색 + 필터 + 카테고리 + 추천 위자드
- Phase 4: 인증/리뷰/댓글/북마크/업보트
- Phase 5: 뉴스/컬렉션/가이드/트렌딩/관리자 대시보드
- Phase 6: PWA/SEO/JSON-LD/하단탭바/뉴스레터

### 추가 개선 작업 ✅
- 10단계 데이터 정확성 개선 (seed.json 119개 도구 검증)
- 외부 데이터 파이프라인 (Product Hunt, 벤치마크, 가격, 트렌드 크론잡)
- 네비게이션 심플화 (AI찾기 통합 페이지)
- 커뮤니티 시스템 통합 (평가/자유글/팁/질문 → 탭 없이 통합 피드)
- 비교 페이지 (`/compare/[...slugs]`) + 인기 비교 쌍

### 4대 피드백 개선 (진행중)

| Phase | 상태 | 내용 |
|-------|------|------|
| Phase A | ✅ 완료 | 서비스 아이콘 고품질 교체 (큐레이션 30 + Google Favicon 89) |
| Phase B | ✅ 완료 | 벤치마크 점수 해석 (한글 설명 + 등급 뱃지 + 색상 코딩) |
| Phase C | ✅ 완료 | 전체 119개 도구 결과 미리보기 (sample_output) |
| Phase D | 🔄 진행중 | 홈페이지 킬러 콘텐츠 + 페르소나 카드 |

---

## 🔥 즉시 해야 할 일 (Phase D 완료)

### 1. PersonaCards 컴포넌트 생성
- **파일**: `components/home/PersonaCards.tsx`
- **내용**: 4개 페르소나 카드 그리드 (직장인, 크리에이터, 학생, 개발자)
- **상수**: `lib/constants.ts`의 `PERSONA_CARDS` 이미 정의됨
- **디자인**: 그라데이션 배경 + 아이콘 + 킬러 도구 3개 + CTA 링크

### 2. FeaturedShowcase 데이터 연결
- **파일**: `components/home/FeaturedShowcase.tsx` (이미 생성됨)
- **할일**: 홈페이지에서 showcase 데이터 fetch하여 props로 전달
- **쿼리**: `getShowcaseForHomepage()` 같은 함수 필요 (queries.ts에 추가)

### 3. 홈페이지(app/page.tsx) 재구성
- **현재 구조**: Hero → HOT → RoleShowcase → 2컬럼(에디터픽+5카테고리+직군+신규+비교+뉴스 | 랭킹+카테고리+위저드+뉴스레터)
- **변경할 구조**:
  ```
  1. HeroSection (기존 유지)
  2. TrendingBar (기존 HOT 유지)
  3. ★ FeaturedShowcase (NEW — 킬러 콘텐츠 히어로)
  4. ★ PersonaCards (NEW — 4개 페르소나 진입점)
  5. 2컬럼:
     메인: EditorPicks + 3개 CategorySection + Comparisons
     사이드: Rankings + Wizard + Categories + Newsletter
  6. RoleShowcaseRotation (기존, 하단으로 이동)
  7. FeaturedJobs + NewTools + News (풀 폭)
  ```
- **카테고리 축소**: `MAIN_PAGE_CATEGORIES` 5개 → `MAIN_PAGE_CATEGORIES_REDUCED` 3개 (이미 상수 정의됨)

### 4. 빌드 검증
- `npm run build` 실행하여 235개 정적 페이지 에러 없이 생성 확인
- 모바일/데스크탑 반응형 확인

---

## 📋 배포 전 필수 작업

### Supabase 연동
- [ ] Supabase 프로젝트 생성 및 환경변수 설정
- [ ] `supabase/migrations/` SQL 실행 (001~004)
- [ ] `data/seed.json` → Supabase 시딩 스크립트 실행
- [ ] RLS 정책 확인

### 인증 시스템 활성화
- [ ] Google OAuth Provider 설정
- [ ] GitHub OAuth Provider 설정
- [ ] Kakao OAuth Provider 설정
- [ ] OAuth 콜백 URL 설정

### 크론잡 설정
- [ ] Vercel Cron 또는 GitHub Actions으로 크론잡 등록
  - `/api/cron/ranking` — 랭킹 점수 갱신
  - `/api/cron/trends` — 주간 트렌드 계산
  - `/api/cron/product-hunt` — Product Hunt 데이터
  - `/api/cron/benchmarks` — AI 벤치마크 수집
  - `/api/cron/pricing` — 가격 변동 추적
  - `/api/cron/artificial-analysis` — 외부 분석 데이터
  - `/api/cron/category-popularity` — 카테고리 인기도

### Vercel 배포
- [ ] Vercel 프로젝트 연결
- [ ] 환경변수 설정 (SUPABASE_URL, ANON_KEY, ADMIN_EMAILS)
- [ ] 도메인 연결 (aipick.kr)
- [ ] Lighthouse 성능 검증 (90+ 목표)

---

## 🎯 배포 후 개선 작업

### 우선순위 높음
- [ ] Service Worker 오프라인 캐시 (PWA 완성)
- [ ] `next/image` 이미지 최적화 적용
- [ ] ISR (Incremental Static Regeneration) 설정
- [ ] 뉴스레터 Resend 연동
- [ ] 실제 사용자 데이터 기반 랭킹 조정

### 우선순위 중간
- [ ] 앱 설치 유도 배너
- [ ] 푸시 알림 기반 구조
- [ ] 직군/학년 관리자 페이지 (admin)
- [ ] 댓글/리뷰 신고 관리
- [ ] A/B 테스트 (히어로 문구, CTA 위치)

### 우선순위 낮음
- [ ] 터치 제스처 최적화
- [ ] React Native / Capacitor 전환 검토
- [ ] 다국어 지원 (영어)
- [ ] API 문서화

---

## 🔧 개발 환경 참고

### 명령어
```bash
# 개발 서버 (Windows에서 Turbopack 크래시 → webpack 사용)
npx next dev --port 3001 --webpack

# 빌드
npm run build

# 로고 스크립트
node scripts/fix-logos-v2.mjs

# 샘플 출력 생성
node scripts/generate-sample-outputs.mjs
```

### 주요 파일 위치
| 역할 | 파일 |
|------|------|
| 홈페이지 | `app/page.tsx` (490줄) |
| 상수 정의 | `lib/constants.ts` |
| DB 쿼리 | `lib/supabase/queries.ts` |
| 타입 정의 | `types/index.ts` |
| 시드 데이터 | `data/seed.json` |
| 페르소나 카드 (NEW) | `components/home/PersonaCards.tsx` (미생성) |
| 킬러 쇼케이스 (NEW) | `components/home/FeaturedShowcase.tsx` |
| 벤치마크 점수 | `components/ranking/BenchmarkScores.tsx` |
| 로고 폴백 | `components/ui/LogoImage.tsx` |
| 결과 미리보기 | `components/showcase/ToolShowcaseStrip.tsx` |

### Git 설정
```bash
git config user.email "kibongkook@gmail.com"
git config user.name "kibongkook"
```
