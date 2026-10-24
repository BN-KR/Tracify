import { NextRequest, NextResponse } from "next/server";
import { sendTransactionalEmail } from "@/lib/transactional-email";
import { renderWelcomeEmail } from "@/lib/email-templates";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as { email?: unknown; name?: unknown } | null;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const name = typeof body?.name === "string" ? body.name.trim().slice(0, 120) : "";
  if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Invalid email" }, { status: 422 });
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "https://www.tracify.tech";
  try {
    await sendTransactionalEmail({ to: email, ...renderWelcomeEmail({ name, origin }), idempotencyKey: `welcome-${email}` });
    return NextResponse.json({ ok: true });
  } catch (error) { console.error("Welcome email failed", error); return NextResponse.json({ ok: false }, { status: 202 }); }
}
