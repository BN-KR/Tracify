import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/brand-logo";

type AuthMode = "sign-in" | "sign-up" | "forgot-password" | "reset-password" | "invitation" | "error";

const copy: Record<AuthMode, string> = {
  "sign-in": "Workspace access",
  "sign-up": "Create workspace",
  "forgot-password": "Account recovery",
  "reset-password": "New credentials",
  invitation: "Team invitation",
  error: "Authentication status",
};

export function AuthShell({ mode, children }: { mode: AuthMode; children: ReactNode }) {
  const eyebrow = copy[mode];

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

      <div className="mx-auto flex min-h-[calc(100vh-54px)] max-w-[1440px] items-center justify-center px-5 py-8 md:px-10 md:py-16">
        <section className="flex w-full items-center justify-center">
          <div className="w-full max-w-[540px] border border-black/25 bg-white shadow-[12px_12px_0_#111] md:shadow-[18px_18px_0_#111]">
            <div className="flex items-center justify-between border-b border-black/20 px-5 py-4 font-mono text-[9px] uppercase tracking-[0.14em] text-black/45 md:px-7">
              <span>{eyebrow}</span><span>tracify / auth</span>
            </div>
            <div className="p-5 md:p-8">{children}</div>
          </div>
        </section>
      </div>
    </main>
  );
}
