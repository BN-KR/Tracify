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
    <div className="border border-[#2A2A2A] bg-[#0A0A0A]">
      <div className="flex items-center justify-between border-b border-[#2A2A2A] px-3 py-2 text-[11px] uppercase tracking-wide text-[#666666]">
        <span>{label}</span>
        <button
          type="button"
          onClick={copy}
          className="text-[#999999] transition-colors hover:text-white"
        >
          {copied ? "Copied" : copyLabel}
        </button>
      </div>
      <pre
        className={
          multiline
            ? "overflow-x-auto whitespace-pre p-3 text-sm leading-6 text-[#CCCCCC]"
            : "overflow-x-auto whitespace-pre p-3 text-sm text-[#CCCCCC]"
        }
      >
        <code>{value}</code>
      </pre>
    </div>
  );
}
