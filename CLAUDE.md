# AIPICK 프로젝트 컨벤션

## 프로젝트 개요
- **AIPICK**: 사용자 목적/직군/학년에 맞는 AI 서비스 큐레이션 플랫폼
- **핵심 가치**: 무료 사용량(Quota) 정보 + 직군/학년별 맞춤 추천 + 랭킹 + 커뮤니티
- **5가지 탐색 경로**: 목적별, 직군별, 학년별, 랭킹, 검색

## 기술 스택
- Next.js 15 (App Router), React 19, TypeScript 5
- Tailwind CSS v4, Lucide React
- Supabase (PostgreSQL, Auth - Google/GitHub/Kakao OAuth)
- Zustand (상태 관리)
- Vercel (배포)
- PWA (Phase 6 - next-pwa)

---

## 작업 프로세스 (Planning → Document → Execute)

> **비사소한(non-trivial) 작업은 바로 코딩하지 말고 아래 프로세스를 따를 것.**

### Step 1. 계획 수립 (Planning) — 아키텍트 페르소나
- 구현 요청을 받으면 **아키텍트 페르소나**로 전환하여 구현 계획을 세운다 (코드 작성 X)
- 기존 코드를 탐색하고 아키텍처를 분석한 뒤 접근 방식을 제안
- 사용자가 계획을 승인할 때까지 코딩 시작 금지

### Step 2. 3종 문서 자동 생성
계획이 승인되면 `docs/current_task/` 폴더에 아래 3개 문서를 작성:

| 문서 | 목적 |
|------|------|
| **[PLAN.md](docs/current_task/PLAN.md)** | 전체 구현 로직, 아키텍처 설계, 수정할 파일 목록, 구현 순서 |
| **[CONTEXT.md](docs/current_task/CONTEXT.md)** | 왜 이 방식을 선택했는지, 대안 비교, 참고할 기존 코드 위치 |
| **[TODO.md](docs/current_task/TODO.md)** | 체크리스트 형태의 세부 작업 목록 (완료 시 [x] 체크) |

### Step 3. 세션 초기화 후 실행 — 개발자 페르소나
- 문서 작성 완료 후, **새 세션에서 작업을 시작할 때**:
  1. `docs/current_task/PLAN.md` → 무엇을 할지 파악
  2. `docs/current_task/CONTEXT.md` → 왜 이렇게 하는지 파악
  3. `docs/current_task/TODO.md` → 어디까지 했는지 파악
  4. 해당 영역의 `docs/rules/*.md` 규칙 파일 확인
  5. **개발자 페르소나**로 전환하여 코딩 시작

### 에이전트 페르소나 전환 규칙

| 상황 | 페르소나 | 역할 |
|------|---------|------|
| 구조 설계, 아키텍처 분석, 계획 수립 | **아키텍트** | 전체 구조 파악, 파일 간 관계 분석, 접근 방식 결정, PLAN.md/CONTEXT.md 작성 |
| 코드 구현, 버그 수정, 리팩토링 | **개발자** | TODO.md 항목을 하나씩 실행, 코드 작성, 테스트, 빌드 검증 |

### 작업 단위 쪼개기 + TODO 실시간 업데이트
- TODO.md의 항목을 **한 번에 하나씩** 해결한다
- 하나의 항목을 완료할 때마다 즉시 `docs/current_task/TODO.md`를 업데이트하여 `[x]` 체크
- 작업 중 새로 발견한 항목이 있으면 TODO.md에 추가
- 건너뛰거나 한 번에 여러 항목을 일괄 체크하지 않는다

### 중간 보고 (작업 항목 완료 시마다)
각 TODO 항목을 마칠 때마다 아래 형식으로 **요약 보고**:

```
## 완료: [항목 이름]
- 수정된 파일: [파일 경로 목록]
- 변경 사유: [왜 이렇게 수정했는지 1-2문장]
- 다음 작업: [TODO.md의 다음 항목]
```

### 자동 린트 및 빌드 검증 (작업 종료 시)
모든 TODO 항목을 완료하고 작업 종료를 선언하기 전에 **반드시** 아래 명령을 실행:

```bash
npm run build      # TypeScript 타입 체크 + 빌드 검증
npm run lint        # ESLint 린트 검사 (설정되어 있는 경우)
```

- 에러가 있으면 작업 종료 선언 금지 — 에러를 수정한 뒤 다시 실행
- 린트/빌드 통과 결과를 작업 완료 보고에 포함

### 셀프 체크 리마인더 (작업 완료 보고 시 필수)
작업 완료를 보고할 때 아래 체크리스트를 **스스로 확인**하고 결과를 보고에 포함:

```
## 셀프 체크 결과
- [ ] 에러 핸들링 처리가 누락되지 않았는가?
- [ ] 환경 변수나 보안 민감 정보가 하드코딩되지 않았는가?
- [ ] 기존 함수의 타입 정의와 일치하는가?
- [ ] 새 상수를 lib/constants.ts에 정의했는가? (매직 넘버 없음)
- [ ] import 순서가 docs/rules/frontend.md 규칙을 따르는가?
- [ ] npm run build 통과 확인
```

- 하나라도 `[ ]` (미충족)이면 수정 후 다시 체크
- 모두 `[x]`일 때만 작업 완료 선언 가능

### 교차 리뷰 (Cross-Review)
작업 완료 후, 사용자에게 **교차 리뷰 권장 안내**를 제공:

```
💡 교차 리뷰 권장: 새 세션을 열어 아래 프롬프트로 코드 리뷰를 요청하세요.
---
이 프로젝트의 최근 변경사항을 리뷰해줘.
1. docs/current_task/PLAN.md를 읽고 작업 목표를 파악
2. 변경된 파일들을 git diff로 확인
3. 아래 관점에서 취약점/개선점을 찾아줘:
   - 보안 취약점 (XSS, injection, 하드코딩된 비밀값)
   - 성능 문제 (불필요한 리렌더링, N+1 쿼리)
   - 타입 안전성 (any 사용, 누락된 타입)
   - 에러 핸들링 누락
   - 기존 코드 패턴과의 불일치
---
```

### 예외 (계획 생략 가능)
- 단순 오타 수정, 한두 줄 변경
- 사용자가 명시적으로 "바로 수정해"라고 요청한 경우
- 긴급 버그 핫픽스

---

## 분야별 규칙 (자동 매뉴얼 시스템)

> 아래 규칙은 **해당 폴더의 파일을 수정할 때 반드시 해당 규칙 파일을 먼저 읽은 뒤** 작업할 것.

### 자동 훅 (Auto-Hook) 지시어

| 트리거 조건 | 먼저 읽을 규칙 파일 |
|------------|-------------------|
| `app/api/` 폴더의 파일을 수정·생성할 때 | `docs/rules/backend.md` |
| `components/`, `app/` 폴더의 UI/페이지 파일을 수정·생성할 때 | `docs/rules/frontend.md` |
| 인증·권한·환경변수·입력검증 관련 코드를 수정할 때 | `docs/rules/security.md` |
| 패키지 설치(`npm install`), `tsconfig.json`, `next.config.ts` 수정 시 | `docs/rules/dependency.md` |

### 규칙 파일 목록
- **[Backend 규칙](docs/rules/backend.md)** — API route 구조, Supabase 패턴, 에러 처리, 인증, 쿼리 중앙화
- **[Frontend 규칙](docs/rules/frontend.md)** — Server/Client Component, import 순서, Tailwind 컨벤션, 페이지 구조
- **[Security 규칙](docs/rules/security.md)** — 환경변수 분류, 인증 계층, 입력 검증, XSS/Injection 방어
- **[Dependency 규칙](docs/rules/dependency.md)** — 패키지 설치 규칙, TypeScript 설정, 빌드/배포 체크리스트

---

## 코딩 원칙 (요약)
- 절대 하드코딩 금지. 모든 설정값은 config 또는 환경변수로 분리
- 매직 넘버 금지, 상수는 `lib/constants.ts`에 정의
- 경로, URL, 인증정보는 환경변수로 관리
- 반복 로직은 함수로 일반화
- 데이터가 바뀌어도 코드 수정 없이 동작하도록 설계
- 기존 코드 패턴과 일관성 유지
- 상세 규칙: `docs/rules/` 참조

## 폴더 구조 규칙
```
app/               → 페이지 및 API 라우트 (App Router)
  (main)/          → 메인 레이아웃 그룹
  tools/[slug]/    → AI 서비스 상세 페이지
  category/[slug]/ → 카테고리 페이지
  ranking/         → 랭킹 페이지
  jobs/            → 직군별 추천 페이지
  education/       → 학년별 추천 페이지
  news/            → AI 뉴스 페이지
  recommend/       → 추천 위자드
  api/             → API 라우트 (→ docs/rules/backend.md)
components/        → 재사용 가능한 컴포넌트 (→ docs/rules/frontend.md)
  layout/          → Header, Footer 등 레이아웃
  ui/              → Button, Badge 등 기본 UI
  service/         → 서비스 카드 등 도메인 컴포넌트
  search/          → 검색 관련
  recommend/       → 추천 위자드
  review/          → 리뷰/평가 관련
  community/       → 댓글, 컬렉션, 업보트
  news/            → 뉴스 관련
  ranking/         → 랭킹 관련
  recipe/          → AI 레시피 관련
  jobs/            → 직군별 추천 관련
  education/       → 학년별 추천 관련
  auth/            → 인증 관련
lib/               → 유틸리티, Supabase 클라이언트, 상수
types/             → TypeScript 타입 정의
hooks/             → 커스텀 훅
store/             → Zustand 스토어
data/              → 시드 데이터
supabase/          → DB 마이그레이션 SQL
docs/              → 기획서, 진행사항 문서
  current_task/    → 현재 작업 계획서 (PLAN/CONTEXT/TODO)
  rules/           → 분야별 코딩 규칙 (자동 매뉴얼)
  modules/         → 모듈별 상세 문서
public/            → 정적 파일 (아이콘, manifest 등)
```

## 네이밍 규칙
- **컴포넌트**: PascalCase (예: ServiceCard.tsx)
- **훅**: camelCase, use 접두사 (예: useBookmark.ts)
- **유틸리티**: camelCase (예: formatDate.ts)
- **상수**: UPPER_SNAKE_CASE (예: MAX_REVIEW_LENGTH)
- **타입/인터페이스**: PascalCase (예: Tool, Category)
- **DB 컬럼**: snake_case (예: free_quota_detail)
- **URL slug**: kebab-case (예: text-generation)

## 핵심 도메인 개념

### 랭킹 시스템
- 랭킹 점수 = 방문수(40%) + 평점(30%) + 리뷰수(20%) + 북마크수(10%)
- 전체 랭킹 + 카테고리별 랭킹 + 주간/월간 트렌딩
- 순위 변동(▲▼) 표시

### 직군별 추천 (10개 직군)
- AI 개발자, UI/UX 디자이너, 그래픽 디자이너, 마케터, 영상 제작자
- 작가/카피라이터, 데이터 분석가, 교육자, 음악 프로듀서, 비즈니스 기획자
- 추천 등급: essential(필수) / recommended(추천) / optional(선택)

### 학년별 추천 (6단계)
- 초등학생, 중학생, 고등학생, 대학생/취준생, 대학원생, 교사/교수
- 안전 등급: safe(안전) / guided(지도 필요) / advanced(고급)

### 커뮤니티 기능
- 통합 커뮤니티: 하나의 글 풀 + 태그 기반 위치별 필터링
- 글 타입: 일반(discussion), 팁(tip), 질문(question)
- 태그 4종: GOAL(목적), AI_TOOL(서비스명), FEATURE(기능), KEYWORD(키워드)
- 도구 페이지 → ai=toolSlug 태그 필터, 레시피 페이지 → tags=도구+키워드 OR 필터
- 태그 클릭 시 /community?tag=xxx 로 이동
- 댓글, 업보트/다운보트, 북마크

### AI 레시피 규칙
- 모든 레시피는 반드시 `icon` 필드를 포함해야 함 (Lucide 아이콘명)
- 레시피에서 사용하는 아이콘은 `components/ui/DynamicIcon.tsx`의 ICON_MAP에 반드시 등록
- 새 아이콘 추가 시: lucide-react import + ICON_MAP 엔트리 모두 추가

## 환경변수
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase 공개 키
- `ADMIN_EMAILS` - 관리자 이메일 목록 (쉼표 구분)
- `CRON_SECRET` - Cron Job 인증 토큰
- `NEXT_PUBLIC_SITE_URL` - 사이트 URL (폴백: https://aipick.kr)

## 개발 진행 순서
Phase 1 → 2 → 3 → 4 → 5 → 6 순서로 진행
각 Phase 완료 후 다음 Phase로 넘어감
상세 내용: docs/PRD.md, docs/PHASES.md 참조

### Phase 요약
- **Phase 1** (완료): 프로젝트 셋업 + 메인 화면 UI (더미 데이터)
- **Phase 2**: Supabase 연동 + DB 스키마 + 상세 페이지 + 랭킹/직군/학년 페이지
- **Phase 3**: 인증 + 리뷰/평가 + 커뮤니티 (댓글, 업보트, 컬렉션)
- **Phase 4**: 검색 + 추천 위자드 + AI 뉴스
- **Phase 5**: 관리자 대시보드 + 성능 최적화
- **Phase 6**: PWA + SEO 고도화 + 배포

## gh CLI 경로
Windows 환경에서 gh CLI가 PATH에 없을 수 있음.
전체 경로 사용: `"C:/Program Files/GitHub CLI/gh.exe"`
