/**
 * Lifecycle emails in the site palette: cream page, near-black panels, yellow as the only accent,
 * square corners. Email clients ignore web fonts and most CSS, so everything is inline tables.
 */

const CREAM = "#eceae3";
const INK = "#090909";
const YELLOW = "#f4d44d";
const MONO = "'SFMono-Regular',Menlo,Consolas,'Liberation Mono',monospace";
const SANS = "Arial,Helvetica,sans-serif";

export type RenderedEmail = { subject: string; html: string; text: string };

export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] as string);
}

function firstName(name?: string) {
  const first = (name ?? "").trim().split(/\s+/)[0] ?? "";
  return first.slice(0, 60) || "there";
}

function button(label: string, url: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background:${YELLOW};border:1px solid ${INK};padding:14px 22px;"><a href="${escapeHtml(url)}" style="color:${INK};text-decoration:none;font-family:${MONO};font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">${escapeHtml(label)}&nbsp; &rarr;</a></td></tr></table>`;
}

function codePanel(label: string, lines: string[]) {
  const body = lines.map((line) => `<div style="white-space:pre;">${escapeHtml(line) || "&nbsp;"}</div>`).join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${INK};margin:0 0 8px;"><tr><td style="padding:16px 18px 6px;font-family:${MONO};font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${YELLOW};">${escapeHtml(label)}</td></tr><tr><td style="padding:0 18px 16px;font-family:${MONO};font-size:13px;line-height:21px;color:${CREAM};">${body}</td></tr></table>`;
}

function step(n: number, title: string, body: string) {
  return `<tr><td width="40" valign="top" style="padding:14px 0 0;font-family:${MONO};font-size:13px;font-weight:700;color:${INK};"><span style="display:inline-block;background:${YELLOW};padding:2px 7px;">${n}</span></td><td style="padding:12px 0 12px;border-bottom:1px solid #d9d6cb;"><p style="margin:0 0 3px;font-family:${SANS};font-size:15px;line-height:22px;font-weight:700;color:${INK};">${escapeHtml(title)}</p><p style="margin:0;font-family:${SANS};font-size:14px;line-height:22px;color:#4a4a45;">${body}</p></td></tr>`;
}

function shell(args: { tag: string; heading: string; greeting: string; intro: string; content: string; footer: string }) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"></head><body style="margin:0;background:${CREAM};"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};padding:28px 12px;"><tr><td align="center"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#f6f4ee;border:1px solid ${INK};"><tr><td style="background:${INK};padding:16px 28px;font-family:${MONO};font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${CREAM};">Tracify <span style="color:${YELLOW};">/</span> ${escapeHtml(args.tag)}</td></tr><tr><td style="padding:40px 28px 8px;"><p style="margin:0 0 14px;font-family:${SANS};font-size:15px;line-height:24px;color:${INK};">${escapeHtml(args.greeting)}</p><h1 style="margin:0;font-family:${MONO};font-size:30px;line-height:36px;letter-spacing:-1px;font-weight:700;color:${INK};">${escapeHtml(args.heading)}</h1></td></tr><tr><td style="padding:12px 28px 4px;"><p style="margin:0 0 24px;font-family:${SANS};font-size:16px;line-height:26px;color:#33332f;">${args.intro}</p>${args.content}</td></tr><tr><td style="padding:20px 28px;border-top:1px solid #d9d6cb;font-family:${SANS};font-size:12px;line-height:19px;color:#77776f;">${args.footer}</td></tr></table></td></tr></table></body></html>`;
}

function signoff() {
  return `<p style="margin:28px 0 24px;font-family:${SANS};font-size:15px;line-height:24px;color:${INK};">Kristoffer<br><span style="color:#77776f;">Founder, Tracify</span></p>`;
}

export function renderWelcomeEmail(args: { name?: string; origin: string }): RenderedEmail {
  const hi = `Hi ${firstName(args.name)},`;
  const url = `${args.origin}/onboarding`;
  const content = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">${step(1, "Install the SDK", "One line for Python or TypeScript.")}${step(2, "Wrap your agent", "Add one decorator or one function call. Your agent keeps working as before.")}${step(3, "Run it once", "The trace shows up in your dashboard within seconds.")}</table>${codePanel("Python", ["pip install tracify-sdk", "", "from tracify import trace_agent", "", "@trace_agent()", "async def research_agent(query): ..."])}${codePanel("TypeScript", ["npm install tracify-sdk", "", 'import { traceAgent } from "tracify-sdk"', "", "const agent = traceAgent(async (q) => { ... })"])}<div style="height:16px;"></div>${button("Send your first trace", url)}<p style="margin:28px 0 0;font-family:${SANS};font-size:15px;line-height:25px;color:#33332f;">Building something real? Reply to this email and tell me what. I read every answer and I'm happy to help you get the first trace working.</p>${signoff()}`;
  const html = shell({ tag: "Welcome", greeting: hi, heading: "See what your agent actually did.", intro: "Your account is ready. Send one trace and you'll see every step, model call, tool call, cost and failure in one place.", content, footer: `You're getting this because you created a Tracify account. Questions? Just reply, or write to <a href="mailto:kb@tracify.tech" style="color:#4a4a45;">kb@tracify.tech</a>.` });
  const text = `${hi}\n\nYour Tracify account is ready. Send one trace and you'll see every step, model call, tool call, cost and failure in one place.\n\n1. Install the SDK\n   pip install tracify-sdk   (Python)\n   npm install tracify-sdk   (TypeScript)\n2. Wrap your agent with @trace_agent() or traceAgent(...)\n3. Run it once. The trace shows up in your dashboard within seconds.\n\nSend your first trace: ${url}\n\nBuilding something real? Reply and tell me what. I'm happy to help you get the first trace working.\n\nKristoffer\nFounder, Tracify\nkb@tracify.tech`;
  return { subject: "Welcome to Tracify. Send your first trace", html, text };
}

export function renderNoTraceEmail(args: { name?: string; projectName?: string; origin: string; projectId?: string }): RenderedEmail {
  const hi = `Hi ${firstName(args.name)},`;
  const project = (args.projectName ?? "").trim().slice(0, 80);
  const url = args.projectId ? `${args.origin}/dashboard/${encodeURIComponent(args.projectId)}/quickstart` : `${args.origin}/onboarding`;
  const docs = `${args.origin}/docs`;
  const intro = project
    ? `Your project <strong>${escapeHtml(project)}</strong> is set up, but no trace has arrived yet. That is usually one small thing. These are the three most common:`
    : "Your project is set up, but no trace has arrived yet. That is usually one small thing. These are the three most common:";
  const content = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">${step(1, "The key isn't reaching your code", "Check that <span style=\"font-family:" + MONO + ";\">TRACIFY_API_KEY</span> is set in the environment where the agent runs, not only on your laptop.")}${step(2, "The agent never ran through the wrapper", "Make sure the function you wrapped is the one that actually gets called, then run it once.")}${step(3, "The key was lost", "The key is shown once. If you didn't save it, make a new one on the API keys page. It takes a few seconds.")}</table>${button("Pick up where you left off", url)}<p style="margin:28px 0 0;font-family:${SANS};font-size:15px;line-height:25px;color:#33332f;">Still stuck? Reply to this email with the error you see, or what your agent does, and I'll help you get it working. There is also a <a href="${escapeHtml(docs)}" style="color:${INK};font-weight:700;">setup guide in the docs</a>.</p>${signoff()}`;
  const html = shell({ tag: "Setup", greeting: hi, heading: "Your first trace is one step away.", intro, content, footer: `You're getting this once because your project hasn't received a trace yet. Reply to this email if you'd rather not hear from us. Questions? <a href="mailto:kb@tracify.tech" style="color:#4a4a45;">kb@tracify.tech</a>.` });
  const text = `${hi}\n\n${project ? `Your project "${project}" is set up` : "Your project is set up"}, but no trace has arrived yet. The three most common causes:\n\n1. The key isn't reaching your code. Check TRACIFY_API_KEY is set where the agent runs.\n2. The agent never ran through the wrapper. Make sure the wrapped function is the one that gets called, then run it once.\n3. The key was lost. It is shown once; make a new one on the API keys page.\n\nPick up where you left off: ${url}\nSetup guide: ${docs}\n\nStill stuck? Reply with the error you see and I'll help.\n\nKristoffer\nFounder, Tracify\nkb@tracify.tech`;
  return { subject: "Your Tracify project is waiting for its first trace", html, text };
}
