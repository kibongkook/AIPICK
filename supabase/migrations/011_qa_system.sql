-- ==========================================
-- 011: Q&A 시스템 확장
-- community_posts에 Q&A 관련 컬럼 추가
-- ==========================================

-- 채택된 답변 ID
ALTER TABLE community_posts
  ADD COLUMN IF NOT EXISTS accepted_answer_id UUID REFERENCES community_posts(id) ON DELETE SET NULL;

-- 답변 수 (질문 게시물용)
ALTER TABLE community_posts
  ADD COLUMN IF NOT EXISTS answer_count INT DEFAULT 0;

-- 이 게시물이 답변인지 여부
ALTER TABLE community_posts
  ADD COLUMN IF NOT EXISTS is_answer BOOLEAN DEFAULT FALSE;

-- @멘션된 도구 ID 배열
ALTER TABLE community_posts
  ADD COLUMN IF NOT EXISTS mentioned_tool_ids UUID[] DEFAULT '{}';

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_community_posts_post_type ON community_posts(post_type);
CREATE INDEX IF NOT EXISTS idx_community_posts_accepted ON community_posts(accepted_answer_id) WHERE accepted_answer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_community_posts_is_answer ON community_posts(is_answer) WHERE is_answer = TRUE;

-- 답변 수 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_answer_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.is_answer = TRUE AND NEW.parent_id IS NOT NULL THEN
    UPDATE community_posts
    SET answer_count = answer_count + 1
    WHERE id = NEW.parent_id;
  ELSIF TG_OP = 'DELETE' AND OLD.is_answer = TRUE AND OLD.parent_id IS NOT NULL THEN
    UPDATE community_posts
    SET answer_count = GREATEST(answer_count - 1, 0)
    WHERE id = OLD.parent_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_answer_count ON community_posts;
CREATE TRIGGER trg_update_answer_count
  AFTER INSERT OR DELETE ON community_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_answer_count();
