"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { defaultConsent, hasCurrentConsent, readConsent, writeConsent, type ConsentState } from "@/lib/consent";

export function ConsentBanner() {
  const pathname = usePathname();
  const [consent, setConsent] = useState<ConsentState>(defaultConsent);
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    // Consent is browser-owned state; initialize it after hydration to avoid a server/client mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConsent(readConsent());
    setVisible(!hasCurrentConsent());
  }, []);
  useEffect(() => { const reopen = () => { setConsent(readConsent()); setOpen(true); setVisible(true); }; window.addEventListener("tracify:open-consent", reopen); return () => window.removeEventListener("tracify:open-consent", reopen); }, []);
  // The authenticated dashboard and public Sandbox are reference-captured
  // surfaces; the marketing consent chrome is intentionally outside them.
  if (pathname === "/playground" || pathname.startsWith("/playground/") || pathname === "/dashboard" || pathname.startsWith("/dashboard/")) return null;
  if (!visible) return null;
  function save(analytics: boolean, marketing = false) { const next = writeConsent({ analytics, marketing }); setConsent(next); setVisible(false); setOpen(false); }
  return <aside role="dialog" aria-modal="false" aria-labelledby="consent-title" className="fixed inset-x-3 bottom-3 z-50 max-h-[calc(100vh-1.5rem)] overflow-auto border border-black bg-[#f4d44d] p-5 text-black shadow-[8px_8px_0_#000] md:inset-x-auto md:right-6 md:w-[440px]">
    <p id="consent-title" className="font-mono text-[10px] uppercase tracking-[0.14em]">Privacy preferences</p>
    <p className="mt-3 text-sm leading-6">Tracify uses necessary storage to keep the site working. Analytics is enabled by default to improve onboarding; you can reject it or change this choice at any time. Marketing cookies and scripts are not currently used.</p>
    {open ? <div className="mt-4 space-y-3 border-t border-black/30 pt-4 text-xs"><label className="flex items-center justify-between gap-4"><span><strong>Necessary</strong><br /><span className="opacity-65">Always on for security and sessions.</span></span><input aria-label="Necessary storage" type="checkbox" checked disabled /></label><label className="flex items-center justify-between gap-4"><span><strong>Analytics</strong><br /><span className="opacity-65">Optional product usage measurement.</span></span><input aria-label="Analytics" type="checkbox" checked={consent.analytics} onChange={e => setConsent({...consent, analytics: e.target.checked})} /></label><label className="flex items-center justify-between gap-4"><span><strong>Marketing</strong><br /><span className="opacity-65">No marketing cookies or scripts are currently used.</span></span><input aria-label="Marketing" type="checkbox" checked={consent.marketing} onChange={e => setConsent({...consent, marketing: e.target.checked})} /></label><span className="flex flex-wrap gap-3"><Link href="/privacy" className="underline">Privacy Policy</Link><Link href="/cookie-policy" className="underline">Cookie Policy</Link></span></div> : null}
    <div className="mt-5 flex flex-wrap gap-2"><button type="button" onClick={() => save(false, false)} className="h-10 border border-black px-3 font-mono text-[9px] uppercase">Reject optional</button><button type="button" onClick={() => open ? save(consent.analytics, consent.marketing) : setOpen(true)} className="h-10 border border-black px-3 font-mono text-[9px] uppercase">{open ? "Save choices" : "Preferences"}</button><button type="button" onClick={() => save(true, false)} className="h-10 bg-black px-3 font-mono text-[9px] uppercase text-white">Accept analytics</button></div>
  </aside>;
}
