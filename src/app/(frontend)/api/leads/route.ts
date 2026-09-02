import { NextRequest, NextResponse } from "next/server";
import { api } from "convex/_generated/api";
import { getConvexClient } from "@/lib/convex";
import { sendTransactionalEmail } from "@/lib/transactional-email";

const clean = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request" }, { status: 422 }); }
  if (clean(body.website, 100)) return NextResponse.json({ ok: true });
  const name = clean(body.name, 120), email = clean(body.email, 200), message = clean(body.message, 4000);
  if (!name || !/^\S+@\S+\.\S+$/.test(email) || !message) return NextResponse.json({ error: "Name, email, and message are required" }, { status: 422 });
  const sourcePath = clean(body.sourcePath, 300) || "/contact";
  try {
    const leadId = await getConvexClient().mutation(api.leads.submit, { name, email: email.toLowerCase(), company: clean(body.company, 160) || undefined, intent: clean(body.intent, 80) || "contact", stack: clean(body.stack, 300) || undefined, message, marketingConsent: body.marketingConsent === true, sourcePath });
    const text = `New Tracify lead\n\n${name} <${email}>\n${message}\nSource: ${sourcePath}`;
    await sendTransactionalEmail({ to: process.env.LEADS_TO_EMAIL || "hello@tracify.tech", subject: `[Tracify lead] ${name}`, text, html: `<h2>New Tracify lead</h2><p><strong>${name}</strong> &lt;${email}&gt;</p><p>${message.replaceAll("\n", "<br>")}</p><p>Source: ${sourcePath}</p>`, idempotencyKey: `lead-${leadId}` });
    await sendTransactionalEmail({ to: email, subject: "We received your Tracify request", text: "Thanks—we received your request and usually reply within one business day.", html: "<p>Thanks—we received your request and usually reply within one business day.</p>", idempotencyKey: `lead-ack-${leadId}` });
    return NextResponse.json({ ok: true });
  } catch (error) { console.error("Lead submission failed", error); return NextResponse.json({ error: "Unable to submit" }, { status: 503 }); }
}
