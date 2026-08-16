"use client";

import { useState } from "react";

export function CodeCopyBlock({
  label,
  value,
  multiline = false,
  copyLabel = "Copy",
}: {
  label: string;
  value: string;
  multiline?: boolean;
  copyLabel?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div className="border border-black bg-[#050505]">
      <div className="flex items-center justify-between border-b border-white/15 px-3 py-2 text-[11px] uppercase tracking-wide text-white/50">
        <span>{label}</span>
        <button
          type="button"
          onClick={copy}
          className="text-white/70 transition-colors hover:text-[#f4d44d]"
        >
          {copied ? "Copied" : copyLabel}
        </button>
      </div>
      <pre
        className={
          multiline
            ? "overflow-x-auto whitespace-pre p-3 text-sm leading-6 text-[#f4d44d]"
            : "overflow-x-auto whitespace-pre p-3 text-sm text-[#f4d44d]"
        }
      >
        <code>{value}</code>
      </pre>
    </div>
  );
}
