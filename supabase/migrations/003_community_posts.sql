-- ==========================================
-- 003: 통합 커뮤니티 게시물 테이블
-- reviews + comments → community_posts 통합
-- ==========================================

-- 테이블 생성
CREATE TABLE community_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- 대상 (도구/뉴스/가이드)
  target_type TEXT NOT NULL CHECK (target_type IN ('tool', 'news', 'guide')),
  target_id UUID NOT NULL,

  -- 작성자
  user_id UUID NOT NULL,
  user_name TEXT,

  -- 게시물 유형
  post_type TEXT NOT NULL CHECK (post_type IN ('rating', 'discussion', 'tip', 'question')),

  -- 본문
  content TEXT NOT NULL,

  -- 평가 전용 필드 (post_type='rating'일 때만 사용)
  rating INT CHECK (rating IS NULL OR (rating BETWEEN 1 AND 5)),
  feature_ratings JSONB,

  -- 답글 (대댓글)
  parent_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,

  -- 미디어 첨부 [{url, type, thumbnail_url?, size?, filename?}]
  media JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- 상호작용
  like_count INT NOT NULL DEFAULT 0,
  reply_count INT NOT NULL DEFAULT 0,

  -- 관리
  is_reported BOOLEAN NOT NULL DEFAULT FALSE,
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,

  -- 타임스탬프
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 인덱스
-- ==========================================

-- 평가는 유저당 대상당 1개 제한 (top-level만)
CREATE UNIQUE INDEX idx_unique_rating_per_user
  ON community_posts(target_type, target_id, user_id)
  WHERE post_type = 'rating' AND parent_id IS NULL;

-- 조회 성능
CREATE INDEX idx_community_posts_target ON community_posts(target_type, target_id);
CREATE INDEX idx_community_posts_user ON community_posts(user_id);
CREATE INDEX idx_community_posts_parent ON community_posts(parent_id);
CREATE INDEX idx_community_posts_type ON community_posts(post_type);
CREATE INDEX idx_community_posts_created ON community_posts(created_at DESC);
CREATE INDEX idx_community_posts_rating_tool ON community_posts(target_id)
  WHERE post_type = 'rating' AND parent_id IS NULL;

-- ==========================================
-- RLS 정책
-- ==========================================
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "공개 읽기" ON community_posts
  FOR SELECT USING (true);

CREATE POLICY "본인 글 작성" ON community_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "본인 글 수정" ON community_posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "본인 글 삭제" ON community_posts
  FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- 트리거: 평가 변경 시 tools.rating_avg / review_count 자동 갱신
-- ==========================================
CREATE OR REPLACE FUNCTION update_tool_community_rating_stats()
RETURNS TRIGGER AS $$
DECLARE
  v_target_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_target_id := OLD.target_id;
  ELSE
    v_target_id := NEW.target_id;
  END IF;

  -- 평가 타입 + 도구 대상 + top-level만 처리
  IF (TG_OP = 'DELETE' AND OLD.post_type = 'rating' AND OLD.target_type = 'tool' AND OLD.parent_id IS NULL)
     OR (TG_OP != 'DELETE' AND NEW.post_type = 'rating' AND NEW.target_type = 'tool' AND NEW.parent_id IS NULL) THEN
    UPDATE tools SET
      rating_avg = COALESCE(
        (SELECT AVG(rating)::NUMERIC(2,1)
         FROM community_posts
         WHERE target_type = 'tool'
           AND target_id = v_target_id
           AND post_type = 'rating'
           AND parent_id IS NULL
           AND rating IS NOT NULL),
        0),
      review_count = (
        SELECT COUNT(*)
        FROM community_posts
        WHERE target_type = 'tool'
          AND target_id = v_target_id
          AND post_type = 'rating'
          AND parent_id IS NULL),
      updated_at = NOW()
    WHERE id = v_target_id;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_community_rating_stats
  AFTER INSERT OR UPDATE OR DELETE ON community_posts
  FOR EACH ROW EXECUTE FUNCTION update_tool_community_rating_stats();

-- ==========================================
-- 트리거: 답글 시 parent의 reply_count 증감
-- ==========================================
CREATE OR REPLACE FUNCTION update_community_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.parent_id IS NOT NULL THEN
    UPDATE community_posts SET reply_count = reply_count + 1 WHERE id = NEW.parent_id;
  ELSIF TG_OP = 'DELETE' AND OLD.parent_id IS NOT NULL THEN
    UPDATE community_posts SET reply_count = GREATEST(reply_count - 1, 0) WHERE id = OLD.parent_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_community_reply_count
  AFTER INSERT OR DELETE ON community_posts
  FOR EACH ROW EXECUTE FUNCTION update_community_reply_count();

-- ==========================================
-- 기존 데이터 마이그레이션 (reviews + comments → community_posts)
-- ==========================================

-- 리뷰 마이그레이션
INSERT INTO community_posts (id, target_type, target_id, user_id, user_name, post_type, content, rating, feature_ratings, media, like_count, created_at, updated_at)
SELECT
  r.id,
  'tool',
  r.tool_id,
  r.user_id,
  r.user_name,
  'rating',
  r.content,
  r.rating,
  CASE WHEN fr.id IS NOT NULL THEN
    jsonb_build_object(
      'ease_of_use', COALESCE(fr.ease_of_use, 0),
      'korean_support', COALESCE(fr.korean_support, 0),
      'free_quota', COALESCE(fr.free_quota, 0),
      'feature_variety', COALESCE(fr.feature_variety, 0),
      'value_for_money', COALESCE(fr.value_for_money, 0)
    )
  ELSE NULL END,
  '[]'::jsonb,
  r.helpful_count,
  r.created_at,
  r.updated_at
FROM reviews r
LEFT JOIN tool_feature_ratings fr ON fr.review_id = r.id;

-- 댓글 마이그레이션
INSERT INTO community_posts (id, target_type, target_id, user_id, user_name, post_type, content, media, like_count, parent_id, is_reported, created_at, updated_at)
SELECT
  c.id,
  c.target_type,
  c.target_id,
  c.user_id,
  c.user_name,
  'discussion',
  c.content,
  '[]'::jsonb,
  c.like_count,
  c.parent_id,
  c.is_reported,
  c.created_at,
  c.updated_at
FROM comments c;

-- reply_count 보정
UPDATE community_posts p
SET reply_count = (SELECT COUNT(*) FROM community_posts c WHERE c.parent_id = p.id)
WHERE EXISTS (SELECT 1 FROM community_posts c WHERE c.parent_id = p.id);

-- 기존 테이블은 유지 (롤백 안전, 향후 004에서 삭제)
