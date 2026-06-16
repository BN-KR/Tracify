export function getReadingTime(body: any[]): number {
  if (!body || !Array.isArray(body)) return 0;
  const text = body
    .filter((block: any) => block?._type === "block" && block?.children)
    .flatMap((block: any) => block.children.map((child: any) => child.text || ""))
    .join(" ");
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}
