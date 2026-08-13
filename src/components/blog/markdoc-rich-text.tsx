import Markdoc from "@markdoc/markdoc";
import React from "react";

import type { BlogPost } from "@/lib/markdoc-blog";

export function MarkdocRichText({ content }: Pick<BlogPost, "content">) {
  return (
    <div className="markdoc-blog-richtext">
      {Markdoc.renderers.react(content, React)}
    </div>
  );
}
