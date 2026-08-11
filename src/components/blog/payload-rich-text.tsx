import type { DefaultNodeTypes, SerializedLinkNode } from "@payloadcms/richtext-lexical";
import {
  LinkJSXConverter,
  RichText,
  type JSXConvertersFunction,
} from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "lexical";

const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }) => {
  const document = linkNode.fields.doc;
  if (!document || document.relationTo !== "posts" || typeof document.value !== "object") {
    return "/blog";
  }
  return `/blog/${document.value.slug}`;
};

const converters: JSXConvertersFunction<DefaultNodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkJSXConverter({ internalDocToHref }),
});

export function PayloadRichText({ data }: { data: SerializedEditorState }) {
  return <RichText className="payload-blog-richtext" converters={converters} data={data} />;
}
