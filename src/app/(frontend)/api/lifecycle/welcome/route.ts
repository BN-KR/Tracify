import { NextRequest, NextResponse } from "next/server";
import { sendTransactionalEmail } from "@/lib/transactional-email";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as { email?: unknown; name?: unknown } | null;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const name = typeof body?.name === "string" ? body.name.trim().slice(0, 120) : "there";
  const htmlName = name.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
  if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Invalid email" }, { status: 422 });
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "https://www.tracify.tech";
  const onboardingUrl = `${origin}/onboarding`;
  try {
    await sendTransactionalEmail({
      to: email,
      subject: "Welcome to Tracify — I’m here if you get stuck",
      text: `Hi ${name},\n\nWelcome to Tracify.\n\nThe quickest way to see the value is to connect one agent function and send a first trace. Once it arrives, you’ll be able to see what the agent did, which tools and models it used, what it cost, and where a failure actually happened.\n\nStart here: ${onboardingUrl}\n\nIf you’re testing a real workflow, reply to this email and tell me what you’re building. I’m happy to help you get the first trace working.\n\n— Kristoffer\nFounder, Tracify\nkb@tracify.tech`,
      html: `<!doctype html><html lang="en"><body style="margin:0;background:#eceae3;color:#111111;font-family:Arial,Helvetica,sans-serif;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eceae3;padding:28px 12px;"><tr><td align="center"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#ffffff;border:1px solid #111111;"><tr><td style="padding:22px 28px;border-bottom:1px solid #111111;"><span style="font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">TRACIFY<span style="color:#d2ad00;"> / </span>WELCOME</span></td></tr><tr><td style="padding:42px 28px 18px;"><p style="margin:0 0 16px;font-size:16px;line-height:24px;">Hi ${htmlName},</p><h1 style="margin:0;max-width:480px;font-size:38px;line-height:42px;letter-spacing:-1.5px;font-weight:700;">See what your agent actually did.</h1></td></tr><tr><td style="padding:0 28px 28px;"><p style="margin:0;font-size:16px;line-height:26px;color:#444444;">Welcome to Tracify. The quickest way to get started is to connect one agent function and send a first trace.</p><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;background:#111111;color:#ffffff;"><tr><td style="padding:22px 20px;"><p style="margin:0 0 8px;font-size:11px;line-height:16px;letter-spacing:1.5px;text-transform:uppercase;color:#bbbbbb;">Your first trace will show</p><p style="margin:0;font-size:16px;line-height:27px;">The agent’s steps · model and tool calls · cost and latency · the point where a failure began</p></td></tr></table><table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background:#f4d44d;border:1px solid #111111;padding:14px 20px;"><a href="${onboardingUrl}" style="color:#111111;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;">Send your first trace&nbsp; →</a></td></tr></table><p style="margin:30px 0 0;font-size:15px;line-height:25px;color:#444444;">If you’re testing a real workflow, reply to this email and tell me what you’re building. I’m happy to help you get the first trace working.</p><p style="margin:28px 0 0;font-size:15px;line-height:24px;">— Kristoffer<br><span style="color:#666666;">Founder, Tracify</span></p></td></tr><tr><td style="padding:18px 28px;border-top:1px solid #dddddd;color:#888888;font-size:11px;line-height:18px;">You’re receiving this because you created a Tracify account.<br><a href="mailto:kb@tracify.tech" style="color:#666666;">kb@tracify.tech</a></td></tr></table></td></tr></table></body></html>`,
      idempotencyKey: `welcome-${email}`,
    });
    return NextResponse.json({ ok: true });
  } catch (error) { console.error("Welcome email failed", error); return NextResponse.json({ ok: false }, { status: 202 }); }
}
