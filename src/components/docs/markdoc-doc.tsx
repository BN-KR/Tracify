import Markdoc from "@markdoc/markdoc";
import React from "react";
import { BlogCodeBlock } from "@/components/blog/blog-code-block";
import type { DocArticle } from "@/lib/markdoc-docs";

const components = { pre: BlogCodeBlock };

export function MarkdocDoc({ content }: Pick<DocArticle, "content">) {
  return (
    <div className="docs-markdoc">
      {Markdoc.renderers.react(content, React, {
        components,
        resolveTagName: (name, map) => (typeof map === "function" ? map(name) : map[name] ?? name),
      })}
    </div>
  );
}
