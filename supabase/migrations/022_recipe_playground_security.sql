-- ============================================================
-- 022_recipe_playground_security.sql
-- 보안 패치: RLS 강화 + order_name 컬럼 추가 + 원자적 카운터 함수
-- ============================================================

-- ============================================================
-- 1. payments.order_name 컬럼 추가
-- ============================================================
ALTER TABLE payments ADD COLUMN IF NOT EXISTS order_name TEXT;

-- ============================================================
-- 2. payments RLS UPDATE 정책 강화
--    기존: FOR UPDATE USING (true) → 모든 인증 사용자가 임의 행 수정 가능
--    신규: FOR UPDATE USING (auth.uid() = user_id) → 본인 결제만 수정 가능
-- ============================================================
DROP POLICY IF EXISTS "payments_update_service" ON payments;

CREATE POLICY "payments_update_own" ON payments
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- 3. 원자적 무료 실행 횟수 증가 함수
--    SELECT + UPDATE 패턴 대신 단일 UPDATE로 경쟁 조건 제거
-- ============================================================
CREATE OR REPLACE FUNCTION increment_user_free_execution(p_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE user_executions
  SET
    daily_free_used = daily_free_used + 1,
    total_free_used = total_free_used + 1,
    updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 4. 날짜 리셋 + 원자적 증가를 결합한 함수
--    execute-image 라우트에서 날짜 변경 감지 후 DB 미반영 버그 수정
-- ============================================================
CREATE OR REPLACE FUNCTION record_free_execution(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_reset_date DATE;
BEGIN
  -- 레코드 조회
  SELECT daily_reset_date INTO v_reset_date
  FROM user_executions
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    -- 신규 사용자: INSERT
    INSERT INTO user_executions (user_id, daily_free_used, total_free_used, daily_reset_date)
    VALUES (p_user_id, 1, 1, v_today)
    ON CONFLICT (user_id) DO UPDATE
      SET daily_free_used = user_executions.daily_free_used + 1,
          total_free_used = user_executions.total_free_used + 1,
          updated_at = NOW();
  ELSIF v_reset_date < v_today THEN
    -- 날짜 변경: 리셋 후 1로 설정
    UPDATE user_executions
    SET daily_free_used = 1,
        total_free_used = total_free_used + 1,
        daily_reset_date = v_today,
        updated_at = NOW()
    WHERE user_id = p_user_id;
  ELSE
    -- 정상 증가
    UPDATE user_executions
    SET daily_free_used = daily_free_used + 1,
        total_free_used = total_free_used + 1,
        updated_at = NOW()
    WHERE user_id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
