import Markdoc from "@markdoc/markdoc";
import React from "react";

import { BlogCodeBlock } from "@/components/blog/blog-code-block";
import { slugifyBlogHeading, type BlogPost } from "@/lib/markdoc-blog";

function textFromChildren(value: React.ReactNode): string {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) return value.map(textFromChildren).join("");
  if (React.isValidElement(value)) {
    return textFromChildren((value as React.ReactElement<{ children?: React.ReactNode }>).props.children);
  }
  return "";
}

function BlogH2({ children }: { children?: React.ReactNode }) {
  return <h2 id={slugifyBlogHeading(textFromChildren(children))}>{children}</h2>;
}

function BlogH3({ children }: { children?: React.ReactNode }) {
  return <h3 id={slugifyBlogHeading(textFromChildren(children))}>{children}</h3>;
}

function TraceScenario({ title, prompt, outcome }: { title: string; prompt: string; outcome: string }) {
  return (
    <aside className="my-8 border border-black bg-[#f4d44d] p-5 text-black" aria-label={title}>
      <p className="font-mono text-[10px] uppercase tracking-[0.14em]">{title}</p>
      <p className="mt-3 text-lg font-medium">{prompt}</p>
      <details className="mt-4 border-t border-black/30 pt-3">
        <summary className="cursor-pointer font-mono text-xs uppercase tracking-[0.1em]">Reveal the trace signal</summary>
        <p className="mt-3 text-sm leading-6">{outcome}</p>
      </details>
    </aside>
  );
}

export function MarkdocRichText({ content }: Pick<BlogPost, "content">) {
  return (
    <div className="markdoc-blog-richtext">
      {Markdoc.renderers.react(content, React, {
        components: { "trace-scenario": TraceScenario, h2: BlogH2, h3: BlogH3, pre: BlogCodeBlock },
      })}
    </div>
  );
}
