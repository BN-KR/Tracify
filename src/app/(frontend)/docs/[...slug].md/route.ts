import { NextResponse } from "next/server";
import { getDocMarkdown, getDocsMarkdownIndex } from "@/lib/markdoc-docs";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<Record<string, string | string[] | undefined>> }) {
  const rawSlug = (await params).slug;
  const slug = Array.isArray(rawSlug) ? rawSlug.join("/") : String(rawSlug ?? "");
  if (!slug) return new NextResponse(getDocsMarkdownIndex(), { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
  const markdown = getDocMarkdown(slug);
  if (!markdown) return new NextResponse("Not found", { status: 404 });
  return new NextResponse(`${markdown}\n`, { headers: { "Content-Type": "text/markdown; charset=utf-8", "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400" } });
}
