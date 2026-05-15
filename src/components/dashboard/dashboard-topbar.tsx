"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getOnboardingHref } from "@/lib/onboarding-navigation";

export function DashboardTopbar() {
  const onboardingHref = getOnboardingHref();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#2A2A2A] bg-[#0A0A0A] px-4 font-mono lg:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <div className="min-w-0">
          <div className="truncate text-[14px] text-white">Overview</div>
          <div className="hidden text-[11px] text-[#666666] sm:block">
            dashboard / research-agent-prod
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[12px] text-[#999999]">
        <Button asChild variant="ghost" size="sm" className="h-8 px-3 text-[12px]">
          <Link href={onboardingHref}>Onboarding</Link>
        </Button>
        <div className="hidden h-8 items-center border border-[#2A2A2A] bg-[#111111] px-2 text-[#F59E0B] sm:flex">
          running
        </div>
        <div className="flex h-8 items-center border border-[#2A2A2A] bg-[#111111] px-2 text-[#CCCCCC]">
          K
        </div>
        <Link
          href="https://docs.5to1r.com"
          className="flex h-8 items-center gap-2 border border-[#2A2A2A] bg-[#111111] px-2 text-[#999999] transition-colors hover:bg-[#161616] hover:text-white"
        >
          <BookOpen className="size-4" />
          <span className="hidden sm:inline">Docs</span>
        </Link>
      </div>
    </header>
  );
}
