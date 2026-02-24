/** 관리자 이메일 목록 (환경변수에서 쉼표 구분) */
function getAdminEmails(): string[] {
  const emails = process.env.ADMIN_EMAILS || '';
  return emails.split(',').map((e) => e.trim()).filter(Boolean);
}

/** 이메일이 관리자인지 확인 */
export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  const admins = getAdminEmails();
  // 관리자 목록이 비어있으면 관리자 없음 (ADMIN_EMAILS 환경변수 필수)
  if (admins.length === 0) return false;
  return admins.includes(email.toLowerCase());
}
