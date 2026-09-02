import { NextRequest, NextResponse } from "next/server";
import { sendTransactionalEmail } from "@/lib/transactional-email";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as { email?: unknown; name?: unknown } | null;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const name = typeof body?.name === "string" ? body.name.trim().slice(0, 120) : "there";
  if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Invalid email" }, { status: 422 });
  try {
    await sendTransactionalEmail({
      to: email,
      subject: "Welcome to Tracify — send your first trace",
      text: `Hi ${name},\n\nYour Tracify account is ready. Create a project, install the SDK, and send your first trace. Most teams can see it in a few minutes.\n\nContinue: ${process.env.NEXT_PUBLIC_SITE_URL || "https://www.tracify.tech"}/onboarding\n\nNeed help? Reply to this email or contact hello@tracify.tech.`,
      html: `<p>Hi ${name},</p><p>Your Tracify account is ready. Create a project, install the SDK, and send your first trace. Most teams can see it in a few minutes.</p><p><a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://www.tracify.tech"}/onboarding">Continue to onboarding</a></p><p>Need help? Reply to this email or contact hello@tracify.tech.</p>`,
      idempotencyKey: `welcome-${email}`,
    });
    return NextResponse.json({ ok: true });
  } catch (error) { console.error("Welcome email failed", error); return NextResponse.json({ ok: false }, { status: 202 }); }
}
