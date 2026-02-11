# AIPICK 커뮤니티 V2 - 자동 태그 기반 통합 피드

## 📋 목차
1. [핵심 컨셉](#1-핵심-컨셉)
2. [URL 구조](#2-url-구조)
3. [데이터베이스 스키마](#3-데이터베이스-스키마)
4. [기능 명세](#4-기능-명세)
5. [자동 분류 로직](#5-자동-분류-로직)
6. [API 엔드포인트](#6-api-엔드포인트)
7. [컴포넌트 구조](#7-컴포넌트-구조)
8. [구현 우선순위](#8-구현-우선순위)

---

## 1. 핵심 컨셉

### ✅ 핵심 원칙
- **하나의 커뮤니티**: 모든 글은 `community_posts` 테이블 하나에 저장
- **자동 태그 기반**: 사용자가 직접 분류하지 않음, 시스템이 자동 추출
- **유연한 필터링**: 같은 데이터, 다른 관점으로 보기
- **URL별 자동 필터**: URL에 따라 자동으로 필터 적용

### 🎯 기존 vs 신규 비교

| 항목 | 기존 (V1) | 신규 (V2) |
|------|-----------|-----------|
| 분류 방식 | 사용자 선택 (평가/자유글/팁/질문) | 자동 태그 추출 |
| 필터링 | 정렬만 가능 (최신/인기) | 목적/AI/키워드 다중 필터 |
| URL | `/tools/[slug]` 하단에만 | `/community`, `/tools/[slug]/community`, `/community/goal/[goal]` |
| 평가 | 별점 + 기능별 평가 | 일반 글에 통합 (좋아요/저장) |
| 미디어 | 이미지/영상 첨부 | 동일 + Markdown 지원 |

---

## 2. URL 구조

### 2.1 주요 페이지

| URL | 설명 | 필터 |
|-----|------|------|
| `/community` | 통합 피드 (메인) | 전체 |
| `/community/write` | 글 작성 | - |
| `/community/[post_id]` | 글 상세 | - |
| `/community/goal/[goal_slug]` | 목적별 뷰 | 목적 자동 필터 |
| `/tools/[slug]/community` | AI 서비스별 뷰 | AI 서비스 자동 필터 |

### 2.2 URL 쿼리 파라미터

```
/community?goal=image-generation&ai=midjourney&sort=popular&keyword=프롬프트
```

| 파라미터 | 설명 | 예시 |
|---------|------|------|
| `goal` | 목적 필터 | `writing`, `image-generation` |
| `ai` | AI 서비스 필터 | `chatgpt`, `midjourney` |
| `keyword` | 키워드 검색 | `프롬프트`, `회의록` |
| `sort` | 정렬 | `latest`, `popular`, `saved` |

---

## 3. 데이터베이스 스키마

### 3.1 메인 테이블

#### `community_posts` (기존 테이블 확장)

```sql
CREATE TABLE community_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- 기본 정보
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  title TEXT NOT NULL,                    -- 신규: 제목
  content TEXT NOT NULL,

  -- 타겟 정보 (기존 유지)
  target_type TEXT DEFAULT 'general' CHECK (target_type IN ('tool', 'news', 'guide', 'general')),
  target_id TEXT,                         -- tool_id, news_id 등 (general은 NULL)

  -- 구분 (기존 post_type 제거)
  -- post_type은 더 이상 사용하지 않음 (태그로 대체)

  -- 평가 관련 (기존 유지, 선택사항)
  rating NUMERIC(2,1),
  feature_ratings JSONB,

  -- 미디어 (기존 유지)
  media JSONB DEFAULT '[]',

  -- 상호작용 (기존 유지)
  like_count INT DEFAULT 0,
  comment_count INT DEFAULT 0,
  bookmark_count INT DEFAULT 0,           -- 신규: 저장 수
  view_count INT DEFAULT 0,               -- 신규: 조회수

  -- 답글 (기존 유지)
  parent_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,

  -- 신뢰도 점수
  quality_score NUMERIC(5,2) DEFAULT 0,   -- 신규: 품질 점수

  -- 상태
  is_reported BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  is_hidden BOOLEAN DEFAULT false,        -- 신규: 숨김 처리

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- 인덱스용
  popularity_score NUMERIC(10,2) DEFAULT 0  -- 신규: 인기 점수 캐시
);

-- 인덱스
CREATE INDEX idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX idx_community_posts_target ON community_posts(target_type, target_id);
CREATE INDEX idx_community_posts_parent_id ON community_posts(parent_id);
CREATE INDEX idx_community_posts_created_at ON community_posts(created_at DESC);
CREATE INDEX idx_community_posts_popularity ON community_posts(popularity_score DESC);
CREATE INDEX idx_community_posts_quality ON community_posts(quality_score DESC);

-- Full-text search (제목 + 본문)
CREATE INDEX idx_community_posts_search ON community_posts
  USING gin(to_tsvector('korean', title || ' ' || content));
```

#### `community_tags` (신규)

```sql
CREATE TABLE community_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- 태그 정보
  tag_type TEXT NOT NULL CHECK (tag_type IN ('GOAL', 'AI_TOOL', 'FEATURE', 'KEYWORD')),
  tag_value TEXT NOT NULL,                -- 'writing', 'chatgpt', 'text', '프롬프트'
  tag_display TEXT NOT NULL,              -- '글쓰기', 'ChatGPT', '텍스트', '프롬프트'

  -- 정규화된 값 (검색/매칭용)
  tag_normalized TEXT NOT NULL,           -- 소문자, 띄어쓰기 제거

  -- 메타데이터
  tag_color TEXT,                         -- UI 표시용 색상
  tag_icon TEXT,                          -- Lucide 아이콘 이름

  -- 관련 정보
  related_tool_id UUID REFERENCES tools(id) ON DELETE SET NULL,  -- AI_TOOL인 경우
  related_category_slug TEXT,             -- GOAL인 경우 카테고리 slug

  -- 사용 통계
  usage_count INT DEFAULT 0,

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- 유니크 제약
  UNIQUE(tag_type, tag_normalized)
);

-- 인덱스
CREATE INDEX idx_community_tags_type ON community_tags(tag_type);
CREATE INDEX idx_community_tags_normalized ON community_tags(tag_normalized);
CREATE INDEX idx_community_tags_usage ON community_tags(usage_count DESC);
```

#### `community_post_tags` (신규 - 다대다 관계)

```sql
CREATE TABLE community_post_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES community_tags(id) ON DELETE CASCADE,

  -- 자동 추출 여부
  is_auto_generated BOOLEAN DEFAULT true,
  confidence_score NUMERIC(3,2),          -- 자동 추출 신뢰도 (0.0-1.0)

  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- 중복 방지
  UNIQUE(post_id, tag_id)
);

-- 인덱스
CREATE INDEX idx_community_post_tags_post_id ON community_post_tags(post_id);
CREATE INDEX idx_community_post_tags_tag_id ON community_post_tags(tag_id);
```

#### `community_bookmarks` (신규)

```sql
CREATE TABLE community_bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, post_id)
);

-- 인덱스
CREATE INDEX idx_community_bookmarks_user_id ON community_bookmarks(user_id);
CREATE INDEX idx_community_bookmarks_post_id ON community_bookmarks(post_id);
```

#### `community_likes` (기존 테이블 이름 변경)

```sql
-- 기존에 있다면 그대로 사용, 없다면 생성
CREATE TABLE IF NOT EXISTS community_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, post_id)
);
```

### 3.2 트리거 함수

#### 인기 점수 자동 계산

```sql
CREATE OR REPLACE FUNCTION update_community_popularity_score()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE community_posts
  SET popularity_score =
    (NEW.like_count * 1) +
    (NEW.comment_count * 2) +
    (NEW.bookmark_count * 3) +
    (NEW.view_count * 0.1),
    updated_at = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_popularity_score
AFTER UPDATE OF like_count, comment_count, bookmark_count, view_count
ON community_posts
FOR EACH ROW
EXECUTE FUNCTION update_community_popularity_score();
```

#### 북마크 카운트 자동 업데이트

```sql
CREATE OR REPLACE FUNCTION update_bookmark_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts
    SET bookmark_count = bookmark_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts
    SET bookmark_count = bookmark_count - 1
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_bookmark_count
AFTER INSERT OR DELETE ON community_bookmarks
FOR EACH ROW
EXECUTE FUNCTION update_bookmark_count();
```

#### 태그 사용 횟수 자동 업데이트

```sql
CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_tags
    SET usage_count = usage_count + 1
    WHERE id = NEW.tag_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_tags
    SET usage_count = usage_count - 1
    WHERE id = OLD.tag_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tag_usage_count
AFTER INSERT OR DELETE ON community_post_tags
FOR EACH ROW
EXECUTE FUNCTION update_tag_usage_count();
```

---

## 4. 기능 명세

### 4.1 메인 피드 (/community)

#### UI 구성

```
┌─────────────────────────────────────────────────┐
│ [전체] [글쓰기] [이미지 생성] [영상] [코딩] ... │  ← Sticky Filter Bar
│ [ChatGPT] [Claude] [Midjourney] ...            │
│ [검색: 키워드 입력]  [최신순▼] [인기순] [저장순]  │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ #ChatGPT #글쓰기 #보고서                   │ │
│  │ ChatGPT로 보고서 초안 10분만에 만드는 법   │ │
│  │ 프롬프트 템플릿을 공유합니다...            │ │
│  │ 👍 42  💬 12  🔖 저장  • 3시간 전          │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ #Midjourney #이미지생성 #프롬프트          │ │
│  │ 사진 같은 인물 이미지 뽑는 꿀팁            │ │
│  │ 이렇게 하면 진짜 사진처럼...               │ │
│  │ 👍 128  💬 34  🔖 저장  • 5시간 전         │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### 필터 동작

- **목적 필터 클릭**: `?goal=writing`
- **AI 필터 클릭**: `?ai=chatgpt`
- **태그 클릭**: 해당 태그로 즉시 필터링
- **다중 필터**: `?goal=writing&ai=chatgpt`

### 4.2 글 작성 (/community/write)

#### Step 1: 제목 + 본문 작성

```
제목: ____________________________________

본문 (Markdown 지원):
┌─────────────────────────────────────┐
│ ChatGPT로 회의록을 정리했어요         │
│                                     │
│ ## 사용법                            │
│ 1. 회의 녹음 파일 업로드              │
│ 2. 요약 요청                         │
│ ...                                 │
└─────────────────────────────────────┘

[이미지 첨부] [취소] [다음: 미리보기]
```

#### Step 2: 자동 태그 추출 + 수정

```
자동으로 추출된 태그:
✓ ChatGPT       (AI 서비스)
✓ 문서 작성      (목적)
✓ 회의록        (키워드)
✓ 요약          (키워드)

[태그 추가] [수정] [발행]
```

**사용자 선택사항**:
- 태그 수정 (자동 추출된 것 제거/추가)
- 평가 추가 (별점, 선택사항)

### 4.3 글 상세 (/community/[post_id])

```
┌─────────────────────────────────────────────────┐
│ #ChatGPT #문서작성 #회의록                       │
│                                                 │
│ ChatGPT로 회의록을 10분만에 정리하는 법          │
│                                                 │
│ 작성자: 김개발 ⭐ (신뢰도 85)  • 3시간 전        │
├─────────────────────────────────────────────────┤
│                                                 │
│ [본문 내용]                                     │
│                                                 │
├─────────────────────────────────────────────────┤
│ 👍 42 좋아요  💬 12 댓글  🔖 저장  👁️ 1,234 조회  │
├─────────────────────────────────────────────────┤
│                                                 │
│ 💬 댓글 12개                                    │
│ [댓글 목록]                                     │
│                                                 │
├─────────────────────────────────────────────────┤
│ 📌 관련 글 (같은 태그)                           │
│ • ChatGPT 프롬프트 모음집                        │
│ • 회의록 작성 자동화 팁                          │
└─────────────────────────────────────────────────┘
```

### 4.4 AI 서비스별 뷰 (/tools/[slug]/community)

**기존 도구 상세 페이지 하단에 추가**:

```
┌─────────────────────────────────────────────────┐
│ ChatGPT 사용자들이 이렇게 쓰고 있어요            │
├─────────────────────────────────────────────────┤
│ [정렬: 최신순 ▼]                                │
│                                                 │
│ • 보고서 초안 작성법 (👍 42, 💬 12)              │
│ • 프롬프트 엔지니어링 팁 (👍 128, 💬 34)          │
│ • 코드 리뷰 자동화 (👍 87, 💬 21)                │
│                                                 │
│ [더보기] → /tools/chatgpt/community             │
└─────────────────────────────────────────────────┘
```

### 4.5 목적별 뷰 (/community/goal/[goal_slug])

**특정 목적의 글만 필터링**:

```
┌─────────────────────────────────────────────────┐
│ 이미지 생성 관련 커뮤니티                        │
├─────────────────────────────────────────────────┤
│ [AI 필터: 전체 ▼] [Midjourney] [DALL-E] ...    │
│                                                 │
│ • Midjourney v6 프롬프트 가이드                  │
│ • DALL-E로 로고 만들기                           │
│ • Stable Diffusion 꿀팁                         │
└─────────────────────────────────────────────────┘
```

---

## 5. 자동 분류 로직

### 5.1 태그 추출 파이프라인

```typescript
// 글 작성 시 자동 실행
async function extractTags(title: string, content: string) {
  const tags = [];

  // 1. AI 서비스 추출
  const aiTools = await extractAITools(title + ' ' + content);
  tags.push(...aiTools);

  // 2. 목적 추출
  const goals = await extractGoals(title + ' ' + content);
  tags.push(...goals);

  // 3. 기능 유형 추출
  const features = await extractFeatures(content);
  tags.push(...features);

  // 4. 키워드 추출
  const keywords = await extractKeywords(title + ' ' + content);
  tags.push(...keywords);

  return tags;
}
```

### 5.2 AI 서비스 추출

**방법**: 사전 정의된 alias 매칭

```typescript
const AI_TOOL_ALIASES = {
  'chatgpt': ['chatgpt', 'chat gpt', 'gpt', 'gpt-4', 'gpt4', '챗gpt', '챗지피티'],
  'claude': ['claude', 'claude ai', '클로드'],
  'gemini': ['gemini', 'bard', '제미나이', '바드'],
  'midjourney': ['midjourney', '미드저니', 'mj'],
  // ... tools 테이블에서 동적 로드
};

function extractAITools(text: string): Tag[] {
  const normalized = text.toLowerCase();
  const found = [];

  for (const [toolSlug, aliases] of Object.entries(AI_TOOL_ALIASES)) {
    if (aliases.some(alias => normalized.includes(alias))) {
      found.push({
        type: 'AI_TOOL',
        value: toolSlug,
        confidence: 0.95
      });
    }
  }

  return found;
}
```

### 5.3 목적 추출

**방법**: 키워드 → 목적 매핑

```typescript
const GOAL_KEYWORDS = {
  'writing': ['글쓰기', '작성', '번역', '요약', '문서', '보고서', '이메일', '블로그'],
  'image-generation': ['이미지', '그림', '사진', '로고', '일러스트', '디자인'],
  'video': ['영상', '비디오', '편집', '자막', '썸네일'],
  'coding': ['코드', '코딩', '개발', '프로그래밍', '디버깅', '리뷰'],
  // ... PURPOSE_CATEGORIES에서 동적 로드
};

function extractGoals(text: string): Tag[] {
  const normalized = text.toLowerCase();
  const scores = {};

  for (const [goal, keywords] of Object.entries(GOAL_KEYWORDS)) {
    const matchCount = keywords.filter(kw => normalized.includes(kw)).length;
    if (matchCount > 0) {
      scores[goal] = matchCount;
    }
  }

  // 가장 높은 점수 2개만 선택
  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([goal, score]) => ({
      type: 'GOAL',
      value: goal,
      confidence: Math.min(0.9, score * 0.3)
    }));
}
```

### 5.4 기능 유형 추출

**방법**: 출력물 키워드 기반

```typescript
const FEATURE_KEYWORDS = {
  'text': ['텍스트', '글', '문장', '단어'],
  'image': ['이미지', '사진', '그림'],
  'video': ['영상', '비디오'],
  'code': ['코드', '프로그램'],
  'audio': ['음악', '소리', '오디오']
};

function extractFeatures(text: string): Tag[] {
  // 목적 추출과 동일한 로직
}
```

### 5.5 키워드 추출

**방법**: 명사 추출 (형태소 분석 또는 간단한 패턴)

```typescript
function extractKeywords(text: string): Tag[] {
  // 1. 간단한 방법: 자주 등장하는 2-3글자 단어
  const words = text.match(/[가-힣]{2,}/g) || [];
  const freq = {};

  words.forEach(word => {
    // 불용어 제거
    if (STOP_WORDS.includes(word)) return;
    freq[word] = (freq[word] || 0) + 1;
  });

  // 빈도수 상위 5개
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word, count]) => ({
      type: 'KEYWORD',
      value: word,
      confidence: 0.7
    }));
}
```

### 5.6 신뢰도 기반 필터링

```typescript
// 신뢰도 0.5 이상만 저장
const validTags = extractedTags.filter(tag => tag.confidence >= 0.5);
```

---

## 6. API 엔드포인트

### 6.1 글 목록 조회

**GET /api/community**

```typescript
// 쿼리 파라미터
interface GetCommunityQuery {
  goal?: string;           // 목적 필터
  ai?: string;             // AI 서비스 필터
  keyword?: string;        // 키워드 검색
  sort?: 'latest' | 'popular' | 'saved';
  limit?: number;
  offset?: number;
  target_type?: string;    // 'tool', 'general'
  target_id?: string;      // tool_id 등
}

// 응답
interface GetCommunityResponse {
  posts: CommunityPost[];
  total: number;
  filters: {
    availableGoals: Tag[];
    availableAIs: Tag[];
  };
}
```

**구현 로직**:

```typescript
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const goal = searchParams.get('goal');
  const ai = searchParams.get('ai');
  const keyword = searchParams.get('keyword');
  const sort = searchParams.get('sort') || 'latest';

  const supabase = await createClient();

  let query = supabase
    .from('community_posts')
    .select(`
      *,
      tags:community_post_tags(
        tag:community_tags(*)
      )
    `)
    .is('parent_id', null)  // 최상위 글만
    .eq('is_hidden', false);

  // 목적 필터
  if (goal) {
    const { data: goalTag } = await supabase
      .from('community_tags')
      .select('id')
      .eq('tag_type', 'GOAL')
      .eq('tag_normalized', goal.toLowerCase())
      .single();

    if (goalTag) {
      query = query.contains('community_post_tags.tag_id', [goalTag.id]);
    }
  }

  // AI 필터
  if (ai) {
    const { data: aiTag } = await supabase
      .from('community_tags')
      .select('id')
      .eq('tag_type', 'AI_TOOL')
      .eq('tag_normalized', ai.toLowerCase())
      .single();

    if (aiTag) {
      query = query.contains('community_post_tags.tag_id', [aiTag.id]);
    }
  }

  // 키워드 검색
  if (keyword) {
    query = query.textSearch('title', keyword, { type: 'websearch' });
  }

  // 정렬
  if (sort === 'popular') {
    query = query.order('popularity_score', { ascending: false });
  } else if (sort === 'saved') {
    query = query.order('bookmark_count', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data: posts, error } = await query;

  // ...
}
```

### 6.2 글 작성

**POST /api/community**

```typescript
interface CreatePostRequest {
  title: string;
  content: string;
  media?: MediaAttachment[];
  rating?: number;            // 선택사항
  feature_ratings?: any;      // 선택사항
  target_type?: string;       // 'general' (기본값)
  target_id?: string;
  manual_tags?: string[];     // 사용자가 직접 추가한 태그
}

interface CreatePostResponse {
  post: CommunityPost;
  auto_tags: Tag[];           // 자동 추출된 태그
}
```

**구현 로직**:

```typescript
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, content, media, rating, manual_tags } = body;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 1. 글 생성
  const { data: post, error: postError } = await supabase
    .from('community_posts')
    .insert({
      user_id: user.id,
      user_name: user.email?.split('@')[0],
      title,
      content,
      media,
      rating,
      target_type: 'general',
    })
    .select()
    .single();

  if (postError) {
    return NextResponse.json({ error: postError.message }, { status: 500 });
  }

  // 2. 자동 태그 추출
  const autoTags = await extractTags(title, content);

  // 3. 태그 저장
  for (const tag of autoTags) {
    // 태그가 없으면 생성
    let tagId = await getOrCreateTag(tag);

    // 글-태그 연결
    await supabase
      .from('community_post_tags')
      .insert({
        post_id: post.id,
        tag_id: tagId,
        is_auto_generated: true,
        confidence_score: tag.confidence,
      });
  }

  // 4. 수동 태그 추가
  for (const tagValue of manual_tags || []) {
    let tagId = await getOrCreateTag({
      type: 'KEYWORD',
      value: tagValue,
      confidence: 1.0
    });

    await supabase
      .from('community_post_tags')
      .insert({
        post_id: post.id,
        tag_id: tagId,
        is_auto_generated: false,
      });
  }

  return NextResponse.json({ post, auto_tags: autoTags });
}
```

### 6.3 태그 추출 API

**POST /api/community/extract-tags**

```typescript
// 글 작성 미리보기에서 사용
interface ExtractTagsRequest {
  title: string;
  content: string;
}

interface ExtractTagsResponse {
  tags: Tag[];
}
```

### 6.4 북마크 토글

**POST /api/community/bookmark**

```typescript
interface BookmarkRequest {
  post_id: string;
}

interface BookmarkResponse {
  bookmarked: boolean;
}
```

### 6.5 태그 목록 조회

**GET /api/community/tags**

```typescript
interface GetTagsQuery {
  type?: 'GOAL' | 'AI_TOOL' | 'FEATURE' | 'KEYWORD';
  popular?: boolean;  // 인기 태그 (usage_count 높은 순)
}

interface GetTagsResponse {
  tags: Tag[];
}
```

---

## 7. 컴포넌트 구조

### 7.1 파일 구조

```
app/
  community/
    page.tsx                    # 메인 피드
    write/
      page.tsx                  # 글 작성
    [post_id]/
      page.tsx                  # 글 상세
    goal/
      [goal_slug]/
        page.tsx                # 목적별 뷰
  tools/
    [slug]/
      community/
        page.tsx                # AI 서비스별 뷰
  api/
    community/
      route.ts                  # GET/POST 글 목록/작성
      extract-tags/
        route.ts                # 태그 자동 추출
      bookmark/
        route.ts                # 북마크 토글
      tags/
        route.ts                # 태그 목록
      [post_id]/
        route.ts                # 글 상세/수정/삭제

components/
  community/
    CommunityFeed.tsx           # 피드 컨테이너
    CommunityPostCard.tsx       # 글 카드
    CommunityPostDetail.tsx     # 글 상세
    CommunityWriteForm.tsx      # 작성 폼
    CommunityFilterBar.tsx      # 필터 바
    TagPill.tsx                 # 태그 UI
    TagSelector.tsx             # 태그 선택기
    RelatedPosts.tsx            # 관련 글 추천

lib/
  community/
    tag-extractor.ts            # 태그 추출 로직
    tag-matcher.ts              # AI/목적 매칭
    keyword-extractor.ts        # 키워드 추출

hooks/
  useCommunityFeed.ts           # 피드 데이터 훅
  useCommunityPost.ts           # 글 상세 훅
  useCommunityTags.ts           # 태그 관리 훅
```

### 7.2 주요 컴포넌트

#### CommunityFilterBar.tsx

```typescript
interface CommunityFilterBarProps {
  activeGoal?: string;
  activeAI?: string;
  availableGoals: Tag[];
  availableAIs: Tag[];
  onGoalChange: (goal: string | null) => void;
  onAIChange: (ai: string | null) => void;
  onSortChange: (sort: 'latest' | 'popular' | 'saved') => void;
}

export default function CommunityFilterBar({ ... }) {
  return (
    <div className="sticky top-0 bg-white border-b z-10 p-4">
      {/* 목적 필터 */}
      <div className="flex gap-2 mb-3">
        <button onClick={() => onGoalChange(null)}>전체</button>
        {availableGoals.map(goal => (
          <button
            key={goal.id}
            onClick={() => onGoalChange(goal.tag_value)}
            className={activeGoal === goal.tag_value ? 'active' : ''}
          >
            {goal.tag_display}
          </button>
        ))}
      </div>

      {/* AI 필터 */}
      <div className="flex gap-2 mb-3">
        {availableAIs.map(ai => (
          <button
            key={ai.id}
            onClick={() => onAIChange(ai.tag_value)}
            className={activeAI === ai.tag_value ? 'active' : ''}
          >
            {ai.tag_display}
          </button>
        ))}
      </div>

      {/* 정렬 */}
      <div className="flex gap-2">
        <select onChange={(e) => onSortChange(e.target.value)}>
          <option value="latest">최신순</option>
          <option value="popular">인기순</option>
          <option value="saved">저장순</option>
        </select>
      </div>
    </div>
  );
}
```

#### CommunityPostCard.tsx

```typescript
interface CommunityPostCardProps {
  post: CommunityPost & { tags: Tag[] };
  onTagClick: (tag: Tag) => void;
}

export default function CommunityPostCard({ post, onTagClick }) {
  return (
    <div className="border rounded-xl p-4 hover:shadow-md">
      {/* 태그 */}
      <div className="flex gap-1 mb-2">
        {post.tags.map(tag => (
          <button
            key={tag.id}
            onClick={() => onTagClick(tag)}
            className="text-xs px-2 py-1 rounded-full bg-gray-100"
          >
            #{tag.tag_display}
          </button>
        ))}
      </div>

      {/* 제목 */}
      <h3 className="font-bold mb-2">{post.title}</h3>

      {/* 본문 미리보기 */}
      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
        {post.content}
      </p>

      {/* 상호작용 */}
      <div className="flex items-center gap-4 text-xs text-gray-400">
        <span>👍 {post.like_count}</span>
        <span>💬 {post.comment_count}</span>
        <button>🔖 저장</button>
        <span>{formatDate(post.created_at)}</span>
      </div>
    </div>
  );
}
```

#### CommunityWriteForm.tsx

```typescript
export default function CommunityWriteForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [autoTags, setAutoTags] = useState<Tag[]>([]);
  const [manualTags, setManualTags] = useState<string[]>([]);

  const handleExtractTags = async () => {
    const res = await fetch('/api/community/extract-tags', {
      method: 'POST',
      body: JSON.stringify({ title, content }),
    });
    const { tags } = await res.json();
    setAutoTags(tags);
  };

  const handleSubmit = async () => {
    await fetch('/api/community', {
      method: 'POST',
      body: JSON.stringify({
        title,
        content,
        manual_tags: manualTags,
      }),
    });
  };

  return (
    <div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="제목"
      />

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="본문 (Markdown 지원)"
      />

      <button onClick={handleExtractTags}>
        태그 자동 추출
      </button>

      {autoTags.length > 0 && (
        <div>
          <h4>자동 추출된 태그</h4>
          {autoTags.map(tag => (
            <span key={tag.id}>
              #{tag.tag_display} ({tag.type})
            </span>
          ))}
        </div>
      )}

      <button onClick={handleSubmit}>발행</button>
    </div>
  );
}
```

---

## 8. 구현 우선순위

### Phase 1: 기본 기능 (MVP)

✅ **필수**:
1. DB 마이그레이션 (테이블 생성)
2. 글 작성 API + UI
3. 자동 태그 추출 (AI 서비스, 목적)
4. 메인 피드 (/community)
5. 목적/AI 필터링
6. 좋아요/저장 기능
7. 글 상세 페이지

### Phase 2: 확장 기능

⏳ **선택**:
1. 댓글 시스템
2. AI 서비스별 뷰 (/tools/[slug]/community)
3. 목적별 뷰 (/community/goal/[goal])
4. 키워드 검색
5. 관련 글 추천
6. 인기 점수 알고리즘 고도화

### Phase 3: 고급 기능

🔮 **향후**:
1. 신고/모더레이션
2. 신뢰도 시스템
3. AI 요약 (인기 글 요약)
4. 추천 시스템 연동
5. 알림 시스템

---

## 9. 마이그레이션 계획

### 기존 데이터 → 신규 구조

```sql
-- 기존 community_posts의 post_type을 태그로 변환
INSERT INTO community_tags (tag_type, tag_value, tag_display, tag_normalized)
VALUES
  ('FEATURE', 'rating', '평가', 'rating'),
  ('FEATURE', 'discussion', '자유글', 'discussion'),
  ('FEATURE', 'tip', '팁', 'tip'),
  ('FEATURE', 'question', '질문', 'question');

-- 기존 글에 태그 연결
INSERT INTO community_post_tags (post_id, tag_id, is_auto_generated)
SELECT
  cp.id,
  ct.id,
  false
FROM community_posts cp
JOIN community_tags ct ON ct.tag_value = cp.post_type
WHERE cp.post_type IS NOT NULL;
```

### 롤백 계획

```sql
-- community_posts.post_type 컬럼 유지 (당분간)
-- 신규 시스템과 병행 운영 가능
```

---

## 10. 성능 최적화

### 10.1 인덱스 전략

- `community_posts`: created_at, popularity_score, quality_score
- `community_post_tags`: post_id, tag_id (복합 인덱스)
- `community_tags`: tag_type, tag_normalized, usage_count
- Full-text search: title + content

### 10.2 캐싱 전략

```typescript
// 인기 태그 캐싱 (Redis 또는 메모리)
const POPULAR_TAGS_CACHE_TTL = 3600; // 1시간

async function getPopularTags(type: string) {
  const cacheKey = `popular_tags:${type}`;
  const cached = await redis.get(cacheKey);

  if (cached) return JSON.parse(cached);

  const tags = await supabase
    .from('community_tags')
    .select('*')
    .eq('tag_type', type)
    .order('usage_count', { ascending: false })
    .limit(20);

  await redis.setex(cacheKey, POPULAR_TAGS_CACHE_TTL, JSON.stringify(tags));
  return tags;
}
```

### 10.3 쿼리 최적화

```typescript
// N+1 문제 해결: 태그를 한 번에 로드
const postsWithTags = await supabase
  .from('community_posts')
  .select(`
    *,
    tags:community_post_tags(
      tag:community_tags(*)
    )
  `)
  .limit(20);
```

---

## 11. 테스트 계획

### 11.1 단위 테스트

```typescript
// tag-extractor.test.ts
describe('extractAITools', () => {
  it('should extract ChatGPT from text', () => {
    const text = 'ChatGPT로 보고서 작성';
    const tags = extractAITools(text);
    expect(tags).toContainEqual({
      type: 'AI_TOOL',
      value: 'chatgpt',
      confidence: expect.any(Number)
    });
  });
});
```

### 11.2 통합 테스트

```typescript
// community-api.test.ts
describe('POST /api/community', () => {
  it('should create post with auto tags', async () => {
    const res = await fetch('/api/community', {
      method: 'POST',
      body: JSON.stringify({
        title: 'ChatGPT 활용법',
        content: '보고서 작성에 활용'
      })
    });

    const { post, auto_tags } = await res.json();
    expect(post.id).toBeDefined();
    expect(auto_tags).toHaveLength(expect.any(Number));
  });
});
```

---

## 12. 보안 고려사항

### 12.1 RLS 정책

```sql
-- 글 조회: 공개글만
CREATE POLICY "Anyone can view non-hidden posts"
  ON community_posts FOR SELECT
  USING (is_hidden = false);

-- 글 작성: 인증된 사용자만
CREATE POLICY "Authenticated users can create posts"
  ON community_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 글 수정: 본인만
CREATE POLICY "Users can update their own posts"
  ON community_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 북마크: 인증된 사용자만
CREATE POLICY "Authenticated users can bookmark"
  ON community_bookmarks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
```

### 12.2 입력 검증

```typescript
// 제목/본문 길이 제한
const MIN_TITLE_LENGTH = 5;
const MAX_TITLE_LENGTH = 100;
const MIN_CONTENT_LENGTH = 10;
const MAX_CONTENT_LENGTH = 10000;

// XSS 방지
import DOMPurify from 'isomorphic-dompurify';

function sanitizeContent(content: string) {
  return DOMPurify.sanitize(content);
}
```

### 12.3 Rate Limiting

```typescript
// 글 작성 제한: 1분당 3개
const RATE_LIMIT_CREATE_POST = {
  max: 3,
  window: 60 * 1000
};
```

---

## 13. 모니터링 지표

### 13.1 핵심 지표

- 일일 활성 글 수 (DAU)
- 태그 추출 정확도 (수동 수정 비율)
- 필터 사용 빈도 (목적/AI/키워드)
- 평균 조회수/글
- 평균 좋아요/글
- 평균 저장/글

### 13.2 알림 설정

- 자동 태그 신뢰도 < 0.5 비율 > 30%
- 신고된 글 > 10개/일
- API 응답 시간 > 2초

---

이상으로 AIPICK 커뮤니티 V2 PRD를 완료합니다.
