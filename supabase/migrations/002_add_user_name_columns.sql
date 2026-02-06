-- ==========================================
-- 마이그레이션: reviews, comments에 user_name 컬럼 추가
-- 사용자 이름을 비정규화하여 조인 없이 표시
-- ==========================================

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS user_name TEXT;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS user_name TEXT;

-- 리뷰의 rating_avg, review_count 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_tool_review_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE tools SET
      rating_avg = COALESCE((SELECT AVG(rating)::NUMERIC(2,1) FROM reviews WHERE tool_id = NEW.tool_id), 0),
      review_count = (SELECT COUNT(*) FROM reviews WHERE tool_id = NEW.tool_id),
      updated_at = NOW()
    WHERE id = NEW.tool_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE tools SET
      rating_avg = COALESCE((SELECT AVG(rating)::NUMERIC(2,1) FROM reviews WHERE tool_id = OLD.tool_id), 0),
      review_count = (SELECT COUNT(*) FROM reviews WHERE tool_id = OLD.tool_id),
      updated_at = NOW()
    WHERE id = OLD.tool_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_tool_review_stats ON reviews;
CREATE TRIGGER trg_update_tool_review_stats
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_tool_review_stats();

-- 업보트 카운트 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_tool_upvote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE tools SET upvote_count = upvote_count + 1, updated_at = NOW()
    WHERE id = NEW.tool_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE tools SET upvote_count = GREATEST(upvote_count - 1, 0), updated_at = NOW()
    WHERE id = OLD.tool_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_tool_upvote_count ON upvotes;
CREATE TRIGGER trg_update_tool_upvote_count
  AFTER INSERT OR DELETE ON upvotes
  FOR EACH ROW EXECUTE FUNCTION update_tool_upvote_count();
