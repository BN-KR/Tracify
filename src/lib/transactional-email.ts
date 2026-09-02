type EmailMessage = { to: string | string[]; subject: string; html: string; text: string; idempotencyKey: string };

export async function sendTransactionalEmail(message: EmailMessage) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "Tracify <hello@tracify.tech>";
  if (!apiKey) { console.info("[email:dev]", { to: message.to, subject: message.subject, idempotencyKey: message.idempotencyKey }); return { delivered: false, mode: "development" as const }; }
  const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "Idempotency-Key": message.idempotencyKey }, body: JSON.stringify({ from, to: message.to, reply_to: process.env.EMAIL_REPLY_TO || "hello@tracify.tech", subject: message.subject, html: message.html, text: message.text }) });
  if (!response.ok) throw new Error(`Email provider returned ${response.status}`);
  return { delivered: true, mode: "provider" as const };
}
