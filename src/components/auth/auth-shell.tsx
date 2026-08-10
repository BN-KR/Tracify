import Link from "next/link";
import { ArrowUpRight, Check, Radio } from "lucide-react";
import type { ReactNode } from "react";

type AuthMode = "sign-in" | "sign-up" | "forgot-password" | "reset-password" | "invitation" | "error";

const copy: Record<AuthMode, { index: string; eyebrow: string; title: string; description: string }> = {
  "sign-in": { index: "01", eyebrow: "Workspace access", title: "Welcome back.", description: "Sign in to inspect runs, evaluate changes, and ship with evidence." },
  "sign-up": { index: "02", eyebrow: "Create workspace", title: "Start tracing.", description: "Create an account and send your first production trace in minutes." },
  "forgot-password": { index: "03", eyebrow: "Account recovery", title: "Reset access.", description: "We will send a secure, time-limited reset link to your inbox." },
  "reset-password": { index: "04", eyebrow: "New credentials", title: "Choose a password.", description: "Use at least eight characters. Your other sessions will be revoked." },
  invitation: { index: "05", eyebrow: "Team invitation", title: "Join the workspace.", description: "Accept the invitation with the same email address it was sent to." },
  error: { index: "06", eyebrow: "Authentication status", title: "Access interrupted.", description: "The authentication request could not be completed. You can safely try again." },
};

export function AuthShell({ mode, children }: { mode: AuthMode; children: ReactNode }) {
  const content = copy[mode];

  return (
    <main className="min-h-screen bg-[#eceae3] text-black selection:bg-[#f4d44d]">
      <header className="flex h-[54px] items-center justify-between border-b border-black/20 px-5 md:px-8">
        <Link href="/" className="active-press relative font-pixel text-xl tracking-[-0.06em] focus-visible:outline-2 focus-visible:outline-offset-4">
          <span className="absolute -inset-x-2 -inset-y-1 -z-0 bg-[#f4d44d]" aria-hidden="true" />
          <span className="relative">tracify</span>
        </Link>
        <Link href="/" className="active-press flex min-h-11 items-center gap-2 font-mono text-[9px] uppercase tracking-[0.14em] hover:text-black/55">
          Return to site <ArrowUpRight className="size-3.5" />
        </Link>
      </header>

      <div className="mx-auto grid min-h-[calc(100vh-54px)] max-w-[1440px] lg:grid-cols-[0.92fr_1.08fr]">
        <section className="flex flex-col justify-between border-b border-black/20 px-5 py-7 md:px-10 md:py-14 lg:border-b-0 lg:border-r lg:px-14 lg:py-16">
          <div>
            <div className="flex items-center justify-between border-b border-black/20 pb-4 font-mono text-[9px] uppercase tracking-[0.15em] text-black/45">
              <span>Auth system {content.index}</span><span>Future 19</span>
            </div>
            <span className="mt-6 inline-flex items-center gap-2 bg-black px-3 py-2 font-mono text-[8px] uppercase tracking-[0.14em] text-white md:mt-8">
              <Radio className="size-3 text-[#f4d44d]" /> secure connection
            </span>
            <h1 className="mt-6 max-w-xl font-pixel text-5xl leading-[0.82] tracking-[-0.075em] sm:text-7xl md:mt-8 xl:text-8xl">{content.title}</h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-black/55 md:mt-6 md:text-base md:leading-7">{content.description}</p>
          </div>

          <div className="mt-12 hidden border-l border-t border-black/20 sm:grid sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {["Own your data", "Fast setup", "Secure sessions"].map((item) => (
              <div key={item} className="flex min-h-20 items-center gap-3 border-b border-r border-black/20 bg-white/45 px-4 font-mono text-[9px] uppercase tracking-[0.12em]">
                <Check className="size-3.5" /> {item}
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-8 md:px-10 md:py-16">
          <div className="w-full max-w-[540px] border border-black/25 bg-white shadow-[12px_12px_0_#111] md:shadow-[18px_18px_0_#111]">
            <div className="flex items-center justify-between border-b border-black/20 px-5 py-4 font-mono text-[9px] uppercase tracking-[0.14em] text-black/45 md:px-7">
              <span>{content.eyebrow}</span><span>tracify / auth</span>
            </div>
            <div className="p-5 md:p-8">{children}</div>
          </div>
        </section>
      </div>
    </main>
  );
}
