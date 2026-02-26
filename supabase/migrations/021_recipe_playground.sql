-- ============================================================
-- 021_recipe_playground.sql
-- AI 레시피 플레이그라운드: 실행 추적 + 결제 관리
-- ============================================================

-- 확장 (uuid 생성용)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. user_executions — 사용자별 일일 실행 횟수 추적
-- ============================================================
CREATE TABLE IF NOT EXISTS user_executions (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_free_used INT NOT NULL DEFAULT 0,          -- 오늘 사용한 무료 실행 횟수
  daily_reset_date DATE NOT NULL DEFAULT CURRENT_DATE, -- 마지막 리셋 날짜
  total_free_used INT NOT NULL DEFAULT 0,          -- 누적 무료 실행 횟수
  total_paid_used INT NOT NULL DEFAULT 0,          -- 누적 유료 실행 횟수
  total_paid_amount INT NOT NULL DEFAULT 0,        -- 누적 결제 금액 (원)
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- daily_reset_date < CURRENT_DATE이면 daily_free_used를 0으로 리셋하는 로직은 API에서 처리

-- ============================================================
-- 2. recipe_executions — 실행 이력 (분석 + 어뷰징 방지 + 결제 내역)
-- ============================================================
CREATE TABLE IF NOT EXISTS recipe_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_slug TEXT NOT NULL,
  option_id TEXT,                     -- v2 레시피의 옵션 ID
  step_number INT NOT NULL,
  tool_slug TEXT NOT NULL,

  -- 실행 정보
  execution_type TEXT NOT NULL CHECK (execution_type IN ('text', 'image', 'code')),
  provider TEXT NOT NULL,             -- 'gemini', 'groq', 'cerebras', 'openai' 등
  model TEXT NOT NULL,                -- 'gemini-2.0-flash', 'llama-3.3-70b' 등

  -- 비용 정보
  is_free BOOLEAN NOT NULL DEFAULT true,   -- 무료 실행 여부
  paid_amount INT NOT NULL DEFAULT 0,      -- 결제 금액 (원) — 유료면 1000
  payment_id TEXT,                         -- 토스페이먼츠 결제 키

  -- 사용량 추적
  input_tokens INT,
  output_tokens INT,

  -- 상태
  status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'error', 'cancelled')),
  error_message TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_recipe_exec_user ON recipe_executions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recipe_exec_recipe ON recipe_executions(recipe_slug, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recipe_exec_date ON recipe_executions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recipe_exec_payment ON recipe_executions(payment_id) WHERE payment_id IS NOT NULL;

-- ============================================================
-- 3. payments — 결제 내역 (토스페이먼츠 연동)
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 토스페이먼츠 정보
  payment_key TEXT UNIQUE,            -- 토스 결제 키
  order_id TEXT UNIQUE NOT NULL,      -- 주문 ID (AIPICK 생성)

  -- 금액
  amount INT NOT NULL,                -- 결제 금액 (원)

  -- 상태
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'cancelled', 'refunded')),

  -- 연결된 실행
  execution_id UUID REFERENCES recipe_executions(id),

  -- 메타데이터
  method TEXT,                        -- 'card', 'kakaopay', 'naverpay', 'tosspay'
  receipt_url TEXT,                   -- 영수증 URL

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);

-- ============================================================
-- 4. RLS (Row Level Security)
-- ============================================================

-- user_executions: 본인만 조회/수정
ALTER TABLE user_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_executions_own" ON user_executions
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- recipe_executions: 본인만 조회
ALTER TABLE recipe_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "recipe_executions_own" ON recipe_executions
  FOR SELECT USING (auth.uid() = user_id);

-- API 서버만 INSERT 가능 (service_role 사용)
CREATE POLICY "recipe_executions_insert_service" ON recipe_executions
  FOR INSERT WITH CHECK (true);

-- payments: 본인만 조회
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payments_own" ON payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "payments_insert_service" ON payments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "payments_update_service" ON payments
  FOR UPDATE USING (true);

-- ============================================================
-- 5. 함수: 일일 실행 상태 조회 + 리셋
-- ============================================================
CREATE OR REPLACE FUNCTION get_user_execution_status(p_user_id UUID)
RETURNS TABLE (
  daily_free_used INT,
  daily_reset_date DATE,
  total_free_used INT,
  total_paid_used INT,
  total_paid_amount INT
) AS $$
DECLARE
  v_record user_executions%ROWTYPE;
BEGIN
  -- 레코드 조회 또는 신규 생성
  INSERT INTO user_executions (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT * INTO v_record FROM user_executions WHERE user_id = p_user_id;

  -- 날짜가 바뀌었으면 daily_free_used 리셋
  IF v_record.daily_reset_date < CURRENT_DATE THEN
    UPDATE user_executions
    SET daily_free_used = 0, daily_reset_date = CURRENT_DATE, updated_at = NOW()
    WHERE user_id = p_user_id;
    v_record.daily_free_used := 0;
  END IF;

  RETURN QUERY SELECT
    v_record.daily_free_used,
    v_record.daily_reset_date,
    v_record.total_free_used,
    v_record.total_paid_used,
    v_record.total_paid_amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
