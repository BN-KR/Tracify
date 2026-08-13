type TextNode = { detail: 0; format: 0; mode: "normal"; style: ""; text: string; type: "text"; version: 1 };
type ElementNode = { children: LexicalNode[]; direction: null; format: ""; indent: 0; type: string; version: 1 };
export type LexicalNode = TextNode | ElementNode | Record<string, unknown>;

const text = (value: string): TextNode => ({ detail: 0, format: 0, mode: "normal", style: "", text: value, type: "text", version: 1 });
const element = (type: string, children: LexicalNode[]): ElementNode => ({ children, direction: null, format: "", indent: 0, type, version: 1 });

export const heading = (tag: "h2" | "h3" | "h4", value: string) => ({ ...element("heading", [text(value)]), tag });
export const paragraph = (value: string) => element("paragraph", [text(value)]);
export const link = (label: string, url: string) => ({ ...element("link", [text(label)]), fields: { linkType: "custom", url } });

const list = (listType: "bullet" | "number", values: string[]) => ({
  ...element("list", values.map((value, index) => ({ ...element("listitem", [paragraph(value)]), value: listType === "number" ? index + 1 : 1 }))),
  listType,
  start: 1,
  tag: listType === "bullet" ? "ul" : "ol",
});

export const bullets = (values: string[]) => list("bullet", values);
export const numbered = (values: string[]) => list("number", values);
export const quote = (value: string) => element("quote", [text(value)]);
export const media = (mediaId: number) => ({ relationTo: "media", type: "upload", value: mediaId, version: 1 });
export const createDocument = (children: LexicalNode[]) => ({ root: { children, direction: null, format: "", indent: 0, type: "root", version: 1 } });
