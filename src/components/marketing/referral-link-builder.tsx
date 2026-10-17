"use client";

import { useId, useState } from "react";
import { normalizeReferral, referralLink } from "@/lib/referral";

export function ReferralLinkBuilder() {
  const id = useId();
  const [handle, setHandle] = useState("");
  const [copied, setCopied] = useState(false);
  const code = normalizeReferral(handle);
  const link = code ? referralLink(code) : "";

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* The link is shown on screen to copy by hand. */
    }
  }

  return (
    <div>
      <label htmlFor={id} className="font-mono text-[11px] uppercase tracking-[0.08em]">Your name or handle</label>
      <input
        id={id}
        value={handle}
        onChange={(e) => { setHandle(e.target.value); setCopied(false); }}
        placeholder="anna"
        autoComplete="off"
        maxLength={40}
        className="mt-2 min-h-12 w-full border border-black bg-white px-4 font-mono text-sm outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4d44d]"
      />
      <p className="mt-1.5 text-xs text-black/55">Letters, numbers, dash and underscore. Two characters at least.</p>

      <div className="mt-8 border border-black bg-[#090909] p-5 text-[#eceae3]" aria-live="polite">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/50">Your link</p>
        <p className="mt-3 break-all font-mono text-sm">{link || "Type a name above."}</p>
        <button
          type="button"
          disabled={!link}
          onClick={copy}
          className="mt-5 min-h-11 bg-[#f4d44d] px-5 font-mono text-[11px] uppercase tracking-[0.14em] text-black transition-colors enabled:hover:bg-white disabled:opacity-40"
        >
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>
      <p className="mt-6 text-sm leading-6 text-black/65">There is no reward scheme yet. For now the link only tells us which people brought someone in, and we remember the code in that person’s browser for the visit.</p>
    </div>
  );
}
