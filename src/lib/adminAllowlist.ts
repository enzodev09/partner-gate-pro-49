// Central admin allowlist: configure via VITE_ADMIN_EMAILS or fallback to a default list.
// Usage: set VITE_ADMIN_EMAILS in .env (comma-separated), e.g.:
// VITE_ADMIN_EMAILS=admin@example.com,owner@example.com

export function getAdminEmails(): string[] {
  const envList = (import.meta as any)?.env?.VITE_ADMIN_EMAILS as string | undefined;
  const defaults = [
    // Fallback default admin email provided by the user
    "lovablemoneyenzo@gmail.com",
  ];
  const parsed = envList
    ? envList
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)
    : [];
  const combined = [...new Set([...(parsed || []), ...defaults.map((d) => d.toLowerCase())])];
  return combined;
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const list = getAdminEmails();
  return list.includes(email.toLowerCase());
}
