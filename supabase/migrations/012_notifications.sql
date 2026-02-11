-- ==========================================
-- 012: 알림 시스템
-- ==========================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('answer_received', 'answer_accepted', 'like_received', 'mention')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,                              -- 클릭 시 이동할 URL
  related_post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  actor_id UUID,                          -- 알림을 트리거한 사용자
  actor_name TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);

-- RLS 정책
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- 답변 등록 시 질문자에게 알림 생성 트리거
CREATE OR REPLACE FUNCTION notify_on_answer()
RETURNS TRIGGER AS $$
BEGIN
  -- 답변인 경우 (is_answer = true, parent_id가 있는 경우)
  IF NEW.is_answer = TRUE AND NEW.parent_id IS NOT NULL THEN
    -- 질문 작성자 조회
    DECLARE
      question_user_id UUID;
      question_title TEXT;
    BEGIN
      SELECT user_id, title INTO question_user_id, question_title
      FROM community_posts
      WHERE id = NEW.parent_id;

      -- 자기 자신에게는 알림 안 보냄
      IF question_user_id IS NOT NULL AND question_user_id != NEW.user_id THEN
        INSERT INTO notifications (user_id, type, title, message, link, related_post_id, actor_id, actor_name)
        VALUES (
          question_user_id,
          'answer_received',
          '새 답변이 달렸습니다',
          NEW.user_name || '님이 "' || LEFT(question_title, 30) || '"에 답변했습니다',
          '/community/' || NEW.parent_id,
          NEW.parent_id,
          NEW.user_id,
          NEW.user_name
        );
      END IF;
    END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notify_on_answer ON community_posts;
CREATE TRIGGER trg_notify_on_answer
  AFTER INSERT ON community_posts
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_answer();

-- 답변 채택 시 답변자에게 알림 생성 트리거
CREATE OR REPLACE FUNCTION notify_on_accept()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.accepted_answer_id IS NOT NULL AND (OLD.accepted_answer_id IS NULL OR OLD.accepted_answer_id != NEW.accepted_answer_id) THEN
    DECLARE
      answer_user_id UUID;
      answer_user_name TEXT;
    BEGIN
      SELECT user_id, user_name INTO answer_user_id, answer_user_name
      FROM community_posts
      WHERE id = NEW.accepted_answer_id;

      -- 자기 자신에게는 알림 안 보냄
      IF answer_user_id IS NOT NULL AND answer_user_id != NEW.user_id THEN
        INSERT INTO notifications (user_id, type, title, message, link, related_post_id, actor_id, actor_name)
        VALUES (
          answer_user_id,
          'answer_accepted',
          '답변이 채택되었습니다!',
          NEW.user_name || '님이 당신의 답변을 채택했습니다',
          '/community/' || NEW.id,
          NEW.id,
          NEW.user_id,
          NEW.user_name
        );
      END IF;
    END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notify_on_accept ON community_posts;
CREATE TRIGGER trg_notify_on_accept
  AFTER UPDATE ON community_posts
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_accept();
