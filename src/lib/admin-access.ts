/** Safe-to-display allowlist used only for showing the private workspace link. */
export const DASHBOARD_ADMIN_EMAILS = new Set([
  "kristoffer.bon@gmail.com",
]);

export function isDashboardAdmin(email: string | null | undefined) {
  return Boolean(email && DASHBOARD_ADMIN_EMAILS.has(email.trim().toLowerCase()));
}
