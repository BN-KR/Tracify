/** Sending helpers shared by alert rules, cost budgets and the weekly summary. */

export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] as string);
}

/** One failed destination must not stop the others, so errors are logged and swallowed. */
export async function postJson(kind: string, url: string, body: unknown) {
  try {
    const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", "User-Agent": "Tracify-Alerts/1.0" }, body: JSON.stringify(body), redirect: "manual", signal: AbortSignal.timeout(10_000) });
    if (!response.ok) console.error(`[alerts] ${kind} returned`, response.status);
  } catch (error) {
    console.error(`[alerts] ${kind} failed`, error);
  }
}

/** Sends through Resend. Without RESEND_API_KEY it logs and skips, so nothing breaks before the key is added. */
export async function sendEmail(args: { to: string[]; subject: string; text: string; html: string; idempotencyKey: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) { console.info("[alerts] no RESEND_API_KEY set, email skipped:", args.subject); return; }
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "Idempotency-Key": args.idempotencyKey },
      body: JSON.stringify({ from: process.env.EMAIL_FROM || "Tracify <alerts@tracify.tech>", to: args.to, subject: args.subject, text: args.text, html: args.html }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) console.error("[alerts] email provider returned", response.status);
  } catch (error) {
    console.error("[alerts] email failed", error);
  }
}
