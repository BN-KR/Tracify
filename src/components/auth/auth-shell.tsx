"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { BrandLogo } from "@/components/brand-logo";
import { PixelWaterfall, type WaterfallRow } from "@/components/auth/pixel-waterfall";
import { getRegionForHostname, getTracifyRegion } from "@/lib/regions";

type AuthMode = "sign-in" | "sign-up" | "forgot-password" | "reset-password" | "invitation" | "error";

const copy = {
  "sign-in": { img: "/images/landing/hero-graph.png", eyebrow: "Workspace access", title: "Pick up where the last run left off.", note: "Your traces, evaluations, and release evidence stay behind one authenticated boundary.", marker: "Known operator" },
  "sign-up": { img: "/images/landing/capture-streams.png", eyebrow: "Create workspace", title: "See your first agent run as a map.", note: "Create the workspace now. Connect a project when you are ready to send evidence.", marker: "New workspace" },
  "forgot-password": { img: "/images/landing/logs-wall.png", eyebrow: "Account recovery", title: "Locked out? Back in a minute.", note: "We send a time-limited recovery path without revealing whether an account exists.", marker: "Recovery channel" },
  "reset-password": { img: "/images/landing/horizon-sun.png", eyebrow: "New credentials", title: "New password. Same history.", note: "A successful reset invalidates existing sessions and restores a clean boundary.", marker: "Credential rotation" },
  invitation: { img: "/images/landing/globe-orbits.png", eyebrow: "Team invitation", title: "Join your team's traces.", note: "Accept the organization invitation to inspect and improve runs with the team.", marker: "Organization link" },
  error: { img: "/images/landing/failure-shatter.png", eyebrow: "Authentication status", title: "That sign-in didn't go through.", note: "The workspace remains protected. Review the status and return through a valid sign-in path.", marker: "Boundary event" },
};


const rows: WaterfallRow[] = [
  { label: "request", start: 0, width: 100 },
  { label: "plan", start: 4, width: 22 },
  { label: "search_docs", start: 24, width: 38 },
  { label: "llm.call", start: 30, width: 60 },
  { label: "write_reply", start: 66, width: 30 },
];

export function AuthShell({ mode, children }: { mode: AuthMode; children: ReactNode }) {
  const modeCopy = copy[mode];
  const reduce = useReducedMotion();
  const [regionId, setRegionId] = useState(getTracifyRegion().id);
  useEffect(() => {
    // The host is only available in the browser; this replaces the deployment fallback after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRegionId(getRegionForHostname(window.location.host) ?? getTracifyRegion().id);
  }, []);
  const region = getTracifyRegion(regionId);

  return (
    <main className="grid min-h-svh bg-[#eceae3] text-black selection:bg-[#f4d44d] lg:grid-cols-[minmax(420px,1.05fr)_minmax(0,1fr)]">
      <aside className="relative isolate flex min-h-[340px] flex-col justify-between overflow-hidden bg-[#090909] p-6 text-[#eceae3] sm:p-8 md:p-10 lg:min-h-svh">
        <Image src={modeCopy.img} alt="" fill priority unoptimized sizes="(min-width:1024px) 55vw, 100vw" className="-z-10 object-cover opacity-55 [image-rendering:pixelated]" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,#090909_8%,rgba(9,9,9,0.78)_55%,rgba(9,9,9,0.4)_100%)]" />
        <div className="flex items-center justify-between">
          <Link href="/" aria-label="Tracify home" className="active-press focus-visible:outline-2 focus-visible:outline-offset-4"><BrandLogo className="text-[#eceae3]" /></Link>
          <Link href="https://www.tracify.tech" className="active-press hidden min-h-11 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-white/60 hover:text-white sm:flex">Back to site <ArrowUpRight className="size-3.5" /></Link>
        </div>
        <div className="mt-16 lg:mt-0">
          <motion.p initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#f4d44d]">{modeCopy.marker}</motion.p>
          <motion.h1 initial={reduce ? false : { opacity: 0, clipPath: "inset(0 0 100% 0)" }} animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }} transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }} className="mt-4 max-w-xl font-pixel text-[clamp(2.6rem,5.2vw,5.4rem)] leading-[0.88] tracking-[-0.065em]">{modeCopy.title}</motion.h1>
          <p className="mt-5 max-w-md text-sm leading-6 text-white/65 sm:text-base sm:leading-7">{modeCopy.note}</p>
          <PixelWaterfall rows={rows} loop className="mt-10 hidden max-w-lg lg:grid [@media(max-height:860px)]:lg:hidden" />
        </div>
      </aside>
      <section className="flex flex-col px-5 py-6 sm:px-8 md:px-12">
        <div className="flex justify-end">
          <Link href={`/cloud?next=/${mode === "sign-up" ? "sign-up" : "sign-in"}`} className="inline-flex min-h-11 items-center font-mono text-[9px] uppercase tracking-[0.14em] hover:text-black/55">{region.flag} {region.shortName} region · Change</Link>
        </div>
        <div className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-[520px] border border-black bg-white shadow-[8px_8px_0_#f4d44d]">
            <div className="flex items-center justify-between border-b border-black px-5 py-4 font-mono text-[9px] uppercase tracking-[0.14em] text-black/55 md:px-7"><span>{modeCopy.eyebrow}</span><span>{region.shortName}</span></div>
            <div className="p-5 md:p-8">{children}</div>
          </div>
        </div>
      </section>
    </main>
  );
}
