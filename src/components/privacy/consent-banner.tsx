"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { defaultConsent, readConsent, writeConsent, type ConsentState } from "@/lib/consent";

export function ConsentBanner() {
  const [consent, setConsent] = useState<ConsentState>(defaultConsent);
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  useEffect(() => { const current = readConsent(); setConsent(current); setVisible(!localStorage.getItem("tracify.consent")); }, []);
  if (!visible) return null;
  function save(analytics: boolean, marketing = false) { const next = writeConsent({ analytics, marketing }); setConsent(next); setVisible(false); setOpen(false); }
  return <aside role="dialog" aria-label="Privacy preferences" className="fixed inset-x-3 bottom-3 z-50 border border-black bg-[#f4d44d] p-5 text-black shadow-[8px_8px_0_#000] md:inset-x-auto md:right-6 md:w-[440px]">
    <p className="font-mono text-[10px] uppercase tracking-[0.14em]">Your privacy, in plain language</p>
    <p className="mt-3 text-sm leading-6">Tracify uses necessary storage to keep the site working. Analytics is on by default to help us improve onboarding. You can turn it off at any time.</p>
    {open ? <div className="mt-4 space-y-3 border-t border-black/30 pt-4 text-xs"><label className="flex items-center justify-between gap-4"><span><strong>Necessary</strong><br /><span className="opacity-65">Always on for security and sessions.</span></span><input type="checkbox" checked disabled /></label><label className="flex items-center justify-between gap-4"><span><strong>Analytics</strong><br /><span className="opacity-65">Optional product usage measurement.</span></span><input type="checkbox" checked={consent.analytics} onChange={e => setConsent({...consent, analytics: e.target.checked})} /></label><span className="flex gap-3"><Link href="/cookie-policy" className="underline">Cookie Policy</Link><Link href="/privacy" className="underline">Privacy Policy</Link></span></div> : null}
    <div className="mt-5 flex flex-wrap gap-2"><button onClick={() => save(false)} className="h-10 border border-black px-3 font-mono text-[9px] uppercase">Turn analytics off</button><button onClick={() => open ? save(consent.analytics, false) : setOpen(true)} className="h-10 border border-black px-3 font-mono text-[9px] uppercase">{open ? "Save choices" : "Customize"}</button><button onClick={() => save(true)} className="h-10 bg-black px-3 font-mono text-[9px] uppercase text-white">Keep analytics on</button></div>
  </aside>;
}
