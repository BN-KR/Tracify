"use client";

import { Check, Copy } from "lucide-react";
import React, { useMemo, useState } from "react";

function textFromChildren(value: React.ReactNode): string {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) return value.map(textFromChildren).join("");
  if (React.isValidElement(value)) {
    return textFromChildren((value as React.ReactElement<{ children?: React.ReactNode }>).props.children);
  }
  return "";
}

export function BlogCodeBlock({
  children,
  "data-language": dataLanguage,
}: {
  children?: React.ReactNode;
  "data-language"?: string;
}) {
  const [copied, setCopied] = useState(false);
  const code = useMemo(() => textFromChildren(children).replace(/\n$/, ""), [children]);
  const child = React.Children.toArray(children).find(React.isValidElement) as React.ReactElement<{ className?: string }> | undefined;
  const language = dataLanguage || child?.props.className?.replace(/^language-/, "") || "code";

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="blog-code-block" data-language={language}>
      <div className="blog-code-block__toolbar">
        <span>{language}</span>
        <button type="button" onClick={copyCode} aria-label={`Copy ${language} code`}>
          {copied ? <Check aria-hidden="true" size={14} /> : <Copy aria-hidden="true" size={14} />}
          {copied ? "Copied" : "Copy code"}
        </button>
      </div>
      <pre>{children}</pre>
    </div>
  );
}
