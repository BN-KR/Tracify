import Link from "next/link";
import { AlertTriangle, ArrowUpRight, KeyRound, MailCheck, RotateCcw, ShieldCheck, UserPlus } from "lucide-react";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/brand-logo";

type AuthMode = "sign-in" | "sign-up" | "forgot-password" | "reset-password" | "invitation" | "error";

const copy = {
  "sign-in": { eyebrow: "Workspace access", title: "Return to the operating record.", note: "Your traces, evaluations, and release evidence stay behind one authenticated boundary.", marker: "Known operator", icon: KeyRound, tone: "bg-black text-white" },
  "sign-up": { eyebrow: "Create workspace", title: "Start with the first real trace.", note: "Create the workspace now. Connect a project when you are ready to send evidence.", marker: "New workspace", icon: UserPlus, tone: "bg-[#f4d44d] text-black" },
  "forgot-password": { eyebrow: "Account recovery", title: "Recover access without losing the record.", note: "We send a time-limited recovery path without revealing whether an account exists.", marker: "Recovery channel", icon: RotateCcw, tone: "bg-[#d9d5ca] text-black" },
  "reset-password": { eyebrow: "New credentials", title: "Replace the key. Keep the history.", note: "A successful reset invalidates existing sessions and restores a clean boundary.", marker: "Credential rotation", icon: ShieldCheck, tone: "bg-black text-white" },
  invitation: { eyebrow: "Team invitation", title: "Join the same evidence trail.", note: "Accept the organization invitation to inspect and improve runs with the team.", marker: "Organization link", icon: MailCheck, tone: "bg-[#f4d44d] text-black" },
  error: { eyebrow: "Authentication status", title: "The access path stopped here.", note: "The workspace remains protected. Review the status and return through a valid sign-in path.", marker: "Boundary event", icon: AlertTriangle, tone: "bg-black text-white" },
};

export function AuthShell({ mode, children }: { mode: AuthMode; children: ReactNode }) {
  const modeCopy = copy[mode];
  const ModeIcon = modeCopy.icon;

  return (
    <main className="min-h-screen bg-[#eceae3] text-black selection:bg-[#f4d44d]">
      <header className="flex h-[54px] items-center justify-between border-b border-black/20 px-5 md:px-8">
        <Link href="/" aria-label="Tracify home" className="active-press focus-visible:outline-2 focus-visible:outline-offset-4">
          <BrandLogo />
        </Link>
        <Link href="/" className="active-press flex min-h-11 items-center gap-2 font-mono text-[9px] uppercase tracking-[0.14em] hover:text-black/55">
          Return to site <ArrowUpRight className="size-3.5" />
        </Link>
      </header>

      <div className="mx-auto grid min-h-[calc(100vh-54px)] max-w-[1440px] lg:grid-cols-[minmax(360px,0.8fr)_minmax(0,1.2fr)]">
        <aside className={`flex min-h-72 flex-col justify-between border-b border-black p-6 sm:p-8 md:p-10 lg:min-h-0 lg:border-b-0 lg:border-r ${modeCopy.tone}`}>
          <div className="flex items-center justify-between gap-4 font-mono text-[9px] uppercase tracking-[0.15em] opacity-55"><span>{modeCopy.marker}</span><span>Auth / {mode}</span></div>
          <ModeIcon className="my-12 size-12" strokeWidth={1.15} aria-hidden="true" />
          <div><h1 className="max-w-2xl font-pixel text-[clamp(3.2rem,6vw,6.4rem)] leading-[0.82] tracking-[-0.075em]">{modeCopy.title}</h1><p className="mt-7 max-w-xl text-base leading-7 opacity-62">{modeCopy.note}</p></div>
        </aside>
        <section className="flex items-center justify-center px-5 py-10 sm:px-8 md:px-12 md:py-16">
          <div className="w-full max-w-[560px] border border-black bg-white">
            <div className="flex items-center justify-between border-b border-black px-5 py-4 font-mono text-[9px] uppercase tracking-[0.14em] text-black/45 md:px-7"><span>{modeCopy.eyebrow}</span><span>Secure form / 01</span></div>
            <div className="p-5 md:p-8">{children}</div>
          </div>
        </section>
      </div>
    </main>
  );
}
