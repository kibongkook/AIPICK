-- ==========================================
-- 013: 사용자 프로필 & 명성 시스템
-- ==========================================

-- user_profiles 확장 (기존 테이블이 있을 수 있으므로 ALTER 사용)
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS question_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS answer_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS accepted_answer_count INT DEFAULT 0;

-- EXP 자동 부여 트리거 (질문/답변/채택)
CREATE OR REPLACE FUNCTION update_user_exp_on_post()
RETURNS TRIGGER AS $$
BEGIN
  -- 질문 작성 시 +3 EXP
  IF NEW.post_type = 'question' AND NEW.parent_id IS NULL THEN
    UPDATE user_profiles
    SET experience_points = experience_points + 3,
        question_count = question_count + 1,
        level = CASE
          WHEN experience_points + 3 >= 500 THEN 'master'
          WHEN experience_points + 3 >= 200 THEN 'expert'
          WHEN experience_points + 3 >= 50 THEN 'active'
          ELSE 'newcomer'
        END
    WHERE id = NEW.user_id;
  END IF;

  -- 답변 작성 시 +5 EXP
  IF NEW.is_answer = TRUE AND NEW.parent_id IS NOT NULL THEN
    UPDATE user_profiles
    SET experience_points = experience_points + 5,
        answer_count = answer_count + 1,
        level = CASE
          WHEN experience_points + 5 >= 500 THEN 'master'
          WHEN experience_points + 5 >= 200 THEN 'expert'
          WHEN experience_points + 5 >= 50 THEN 'active'
          ELSE 'newcomer'
        END
    WHERE id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_user_exp_on_post ON community_posts;
CREATE TRIGGER trg_update_user_exp_on_post
  AFTER INSERT ON community_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_user_exp_on_post();

-- 답변 채택 시 +15 EXP
CREATE OR REPLACE FUNCTION update_user_exp_on_accept()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.accepted_answer_id IS NOT NULL AND (OLD.accepted_answer_id IS NULL OR OLD.accepted_answer_id != NEW.accepted_answer_id) THEN
    DECLARE
      answer_user UUID;
    BEGIN
      SELECT user_id INTO answer_user FROM community_posts WHERE id = NEW.accepted_answer_id;
      IF answer_user IS NOT NULL THEN
        UPDATE user_profiles
        SET experience_points = experience_points + 15,
            accepted_answer_count = accepted_answer_count + 1,
            level = CASE
              WHEN experience_points + 15 >= 500 THEN 'master'
              WHEN experience_points + 15 >= 200 THEN 'expert'
              WHEN experience_points + 15 >= 50 THEN 'active'
              ELSE 'newcomer'
            END
        WHERE id = answer_user;
      END IF;
    END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_user_exp_on_accept ON community_posts;
CREATE TRIGGER trg_update_user_exp_on_accept
  AFTER UPDATE ON community_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_user_exp_on_accept();

-- 가입 시 프로필 자동 생성 트리거
CREATE OR REPLACE FUNCTION create_user_profile_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, display_name, level, experience_points)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'newcomer',
    0
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_create_user_profile ON auth.users;
CREATE TRIGGER trg_create_user_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile_on_signup();
