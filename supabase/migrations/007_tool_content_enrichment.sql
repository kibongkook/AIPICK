-- ==========================================
-- 007: 도구 콘텐츠 강화 — usage_tips 컬럼 추가
-- 외부 소스 기반 사용법 가이드를 DB에 저장
-- ==========================================

ALTER TABLE tools ADD COLUMN IF NOT EXISTS usage_tips TEXT[] DEFAULT '{}';

-- 인덱스: 사용 팁이 있는 도구만 필터링 시 유용
CREATE INDEX IF NOT EXISTS idx_tools_has_tips ON tools ((array_length(usage_tips, 1)));
