"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/** Copies text to the clipboard and confirms with a short label swap. */
export function CopyButton({ text, label = "Copy", className = "" }: { text: string; label?: string; className?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          window.setTimeout(() => setDone(false), 1800);
        } catch {
          setDone(false);
        }
      }}
      className={`inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] ${className}`}
    >
      {done ? <Check className="size-3.5" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
      <span aria-live="polite">{done ? "Copied" : label}</span>
    </button>
  );
}
