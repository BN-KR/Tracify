import Markdoc from "@markdoc/markdoc";
import React from "react";
import type { DocArticle } from "@/lib/markdoc-docs";

export function MarkdocDoc({ content }: Pick<DocArticle, "content">) {
  return <article className="docs-markdoc">{Markdoc.renderers.react(content, React)}</article>;
}
