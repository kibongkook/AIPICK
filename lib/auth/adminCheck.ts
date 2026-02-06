/** 관리자 이메일 목록 (환경변수에서 쉼표 구분) */
function getAdminEmails(): string[] {
  const emails = process.env.ADMIN_EMAILS || '';
  return emails.split(',').map((e) => e.trim()).filter(Boolean);
}

/** 이메일이 관리자인지 확인 */
export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  const admins = getAdminEmails();
  // 관리자 목록이 비어있으면 모든 인증 사용자를 허용 (개발 편의)
  if (admins.length === 0) return true;
  return admins.includes(email.toLowerCase());
}
