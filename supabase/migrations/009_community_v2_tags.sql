-- ==========================================
-- Community V2: 자동 태그 기반 통합 피드
-- ==========================================

-- 1. community_posts 테이블 확장
ALTER TABLE community_posts
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS bookmark_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS view_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS popularity_score NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS quality_score NUMERIC(5,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT false;

-- title을 NOT NULL로 변경 (기존 데이터는 content 앞부분 사용)
UPDATE community_posts
SET title = LEFT(content, 100)
WHERE title IS NULL;

ALTER TABLE community_posts
  ALTER COLUMN title SET NOT NULL;

-- target_type에 'general' 추가
ALTER TABLE community_posts
  DROP CONSTRAINT IF EXISTS community_posts_target_type_check;

ALTER TABLE community_posts
  ADD CONSTRAINT community_posts_target_type_check
  CHECK (target_type IN ('tool', 'news', 'guide', 'general'));

-- 기본값을 'general'로 변경
ALTER TABLE community_posts
  ALTER COLUMN target_type SET DEFAULT 'general';

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_community_posts_popularity ON community_posts(popularity_score DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_quality ON community_posts(quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_bookmark ON community_posts(bookmark_count DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_view ON community_posts(view_count DESC);

-- Full-text search 인덱스 (title + content)
CREATE INDEX IF NOT EXISTS idx_community_posts_search ON community_posts
  USING gin(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, '')));

-- 2. community_tags 테이블 생성
CREATE TABLE IF NOT EXISTS community_tags (
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
  related_tool_id UUID REFERENCES tools(id) ON DELETE SET NULL,
  related_category_slug TEXT,

  -- 사용 통계
  usage_count INT DEFAULT 0,

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- 유니크 제약
  UNIQUE(tag_type, tag_normalized)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_community_tags_type ON community_tags(tag_type);
CREATE INDEX IF NOT EXISTS idx_community_tags_normalized ON community_tags(tag_normalized);
CREATE INDEX IF NOT EXISTS idx_community_tags_usage ON community_tags(usage_count DESC);

-- 3. community_post_tags 테이블 생성 (다대다 관계)
CREATE TABLE IF NOT EXISTS community_post_tags (
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
CREATE INDEX IF NOT EXISTS idx_community_post_tags_post_id ON community_post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_community_post_tags_tag_id ON community_post_tags(tag_id);

-- 4. community_bookmarks 테이블 생성
CREATE TABLE IF NOT EXISTS community_bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, post_id)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_community_bookmarks_user_id ON community_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_community_bookmarks_post_id ON community_bookmarks(post_id);

-- RLS 정책
ALTER TABLE community_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view bookmarks"
  ON community_bookmarks FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can bookmark"
  ON community_bookmarks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their bookmarks"
  ON community_bookmarks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 5. RLS 정책 업데이트
ALTER TABLE community_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_post_tags ENABLE ROW LEVEL SECURITY;

-- 모든 사용자: 태그 읽기
CREATE POLICY "Anyone can view tags"
  ON community_tags FOR SELECT
  USING (true);

-- 모든 사용자: 글-태그 연결 읽기
CREATE POLICY "Anyone can view post tags"
  ON community_post_tags FOR SELECT
  USING (true);

-- 인증된 사용자: 태그 생성 (자동 추출 시)
CREATE POLICY "Authenticated users can create tags"
  ON community_tags FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 인증된 사용자: 글-태그 연결 생성
CREATE POLICY "Authenticated users can tag posts"
  ON community_post_tags FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM community_posts
    WHERE id = post_id AND user_id = auth.uid()
  ));

-- 6. 트리거 함수: 인기 점수 자동 계산
CREATE OR REPLACE FUNCTION update_community_popularity_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.popularity_score :=
    (NEW.like_count * 1.0) +
    (NEW.comment_count * 2.0) +
    (NEW.bookmark_count * 3.0) +
    (NEW.view_count * 0.1);

  NEW.updated_at := NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_popularity_score ON community_posts;
CREATE TRIGGER trigger_update_popularity_score
BEFORE UPDATE OF like_count, comment_count, bookmark_count, view_count
ON community_posts
FOR EACH ROW
EXECUTE FUNCTION update_community_popularity_score();

-- 7. 트리거 함수: 북마크 카운트 자동 업데이트
CREATE OR REPLACE FUNCTION update_bookmark_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts
    SET bookmark_count = bookmark_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts
    SET bookmark_count = GREATEST(0, bookmark_count - 1)
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_bookmark_count ON community_bookmarks;
CREATE TRIGGER trigger_update_bookmark_count
AFTER INSERT OR DELETE ON community_bookmarks
FOR EACH ROW
EXECUTE FUNCTION update_bookmark_count();

-- 8. 트리거 함수: 태그 사용 횟수 자동 업데이트
CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_tags
    SET usage_count = usage_count + 1
    WHERE id = NEW.tag_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_tags
    SET usage_count = GREATEST(0, usage_count - 1)
    WHERE id = OLD.tag_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_tag_usage_count ON community_post_tags;
CREATE TRIGGER trigger_update_tag_usage_count
AFTER INSERT OR DELETE ON community_post_tags
FOR EACH ROW
EXECUTE FUNCTION update_tag_usage_count();

-- 9. 기본 태그 데이터 삽입 (GOAL - 목적)
INSERT INTO community_tags (tag_type, tag_value, tag_display, tag_normalized, related_category_slug, tag_color)
VALUES
  ('GOAL', 'writing', '글쓰기', 'writing', 'writing', 'from-blue-500 to-blue-600'),
  ('GOAL', 'design', '디자인', 'design', 'design', 'from-purple-500 to-pink-600'),
  ('GOAL', 'video', '영상', 'video', 'video', 'from-red-500 to-orange-600'),
  ('GOAL', 'automation', '자동화', 'automation', 'automation', 'from-amber-500 to-yellow-600'),
  ('GOAL', 'coding', '코딩', 'coding', 'coding', 'from-emerald-500 to-teal-600'),
  ('GOAL', 'research', '리서치', 'research', 'research', 'from-cyan-500 to-blue-600'),
  ('GOAL', 'learning', '학습', 'learning', 'learning', 'from-indigo-500 to-purple-600'),
  ('GOAL', 'presentation', '발표', 'presentation', 'presentation', 'from-pink-500 to-rose-600'),
  ('GOAL', 'marketing', '마케팅', 'marketing', 'marketing', 'from-orange-500 to-red-600'),
  ('GOAL', 'building', '제품만들기', 'building', 'building', 'from-violet-500 to-indigo-600')
ON CONFLICT (tag_type, tag_normalized) DO NOTHING;

-- 10. 기본 태그 데이터 삽입 (FEATURE - 기능)
INSERT INTO community_tags (tag_type, tag_value, tag_display, tag_normalized, tag_color)
VALUES
  ('FEATURE', 'text', '텍스트', 'text', 'bg-blue-100 text-blue-700'),
  ('FEATURE', 'image', '이미지', 'image', 'bg-purple-100 text-purple-700'),
  ('FEATURE', 'video', '영상', 'video', 'bg-red-100 text-red-700'),
  ('FEATURE', 'code', '코드', 'code', 'bg-green-100 text-green-700'),
  ('FEATURE', 'audio', '오디오', 'audio', 'bg-pink-100 text-pink-700')
ON CONFLICT (tag_type, tag_normalized) DO NOTHING;

-- 11. 기존 post_type을 태그로 마이그레이션
INSERT INTO community_tags (tag_type, tag_value, tag_display, tag_normalized, tag_color)
VALUES
  ('FEATURE', 'rating', '평가', 'rating', 'bg-yellow-100 text-yellow-700'),
  ('FEATURE', 'discussion', '자유글', 'discussion', 'bg-blue-100 text-blue-700'),
  ('FEATURE', 'tip', '팁', 'tip', 'bg-emerald-100 text-emerald-700'),
  ('FEATURE', 'question', '질문', 'question', 'bg-purple-100 text-purple-700')
ON CONFLICT (tag_type, tag_normalized) DO NOTHING;

-- 기존 글에 post_type 태그 연결
INSERT INTO community_post_tags (post_id, tag_id, is_auto_generated, confidence_score)
SELECT
  cp.id,
  ct.id,
  false,
  1.0
FROM community_posts cp
JOIN community_tags ct ON ct.tag_value = cp.post_type
WHERE cp.post_type IS NOT NULL
ON CONFLICT (post_id, tag_id) DO NOTHING;
