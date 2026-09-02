import { NextRequest, NextResponse } from "next/server";
import { api } from "convex/_generated/api";
import { getConvexClient } from "@/lib/convex";
import { sendTransactionalEmail } from "@/lib/transactional-email";
import { consumeRateLimit } from "@/lib/redis-cache";
import { createHash } from "node:crypto";

const limits: Record<string, number> = { name: 120, email: 200, company: 160, intent: 80, role: 120, useCase: 500, stack: 300, message: 4000, preferredTime: 120, sourcePath: 300, campaign: 160 };
const clean = (value: unknown) => typeof value === "string" ? value.trim() : "";
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  let browserForm = false;
  try {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) { body = Object.fromEntries((await request.formData()).entries()); browserForm = true; }
    else body = await request.json();
  } catch { return NextResponse.json({ error: "Invalid request" }, { status: 422 }); }
  if (clean(body.website)) return NextResponse.json({ ok: true });
  if (Object.entries(limits).some(([key, max]) => typeof body[key] === "string" && clean(body[key]).length > max)) return browserForm ? NextResponse.redirect(new URL("/contact?submitted=error", request.url)) : NextResponse.json({ error: "Invalid request" }, { status: 422 });
  const name = clean(body.name) || "Newsletter subscriber", email = clean(body.email).toLowerCase(), message = clean(body.message) || (clean(body.intent) === "newsletter" ? "Newsletter subscription" : "Contact request");
  if (!email || !/^\S+@\S+\.\S+$/.test(email) || (!clean(body.intent) && !clean(body.message))) return browserForm ? NextResponse.redirect(new URL("/contact?submitted=error", request.url)) : NextResponse.json({ error: "Invalid request" }, { status: 422 });
  const sourcePath = clean(body.sourcePath) || "/contact";
  const dedupeKey = createHash("sha256").update(`${email}|${sourcePath}|${message}`).digest("hex").slice(0, 32);
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rate = await consumeRateLimit(`tracify:lead:${ip}`, 1, 5, 600);
    if (!rate.allowed) return NextResponse.json({ error: "Please try again later" }, { status: 429 });
    const leadId = await getConvexClient().mutation(api.leads.submit, { name, email, company: clean(body.company) || undefined, intent: clean(body.intent) || "contact", role: clean(body.role) || undefined, useCase: clean(body.useCase) || undefined, stack: clean(body.stack) || undefined, message, preferredTime: clean(body.preferredTime) || undefined, marketingConsent: body.marketingConsent === true, sourcePath, campaign: clean(body.campaign) || undefined, dedupeKey });
    const escape = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
    const text = `New Tracify lead\n\n${name}\nSource: ${sourcePath}`;
    await sendTransactionalEmail({ to: process.env.LEADS_TO_EMAIL || "hello@tracify.tech", subject: "[Tracify lead] New request", text, html: `<h2>New Tracify lead</h2><p><strong>${escape(name)}</strong></p><p>${escape(message).replaceAll("\n", "<br>")}</p><p>Source: ${escape(sourcePath)}</p>`, idempotencyKey: `lead-${leadId}` }).catch(() => undefined);
    await sendTransactionalEmail({ to: email, subject: "We received your Tracify request", text: "Thanks—we received your request and usually reply within one business day.", html: "<p>Thanks—we received your request and usually reply within one business day.</p>", idempotencyKey: `lead-ack-${leadId}` }).catch(() => undefined);
    return browserForm ? NextResponse.redirect(new URL("/contact?submitted=success", request.url)) : NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Unable to submit" }, { status: 503 }); }
}
