import { client } from "@/lib/sanity/client";
import { postsQuery } from "@/lib/sanity/queries";

export const dynamic = "force-static";

async function getPosts() {
  if (!client) return [];
  return await client.fetch(postsQuery).catch(() => []);
}

function escapeXml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatRssDate(dateString: string) {
  return new Date(dateString).toUTCString();
}

export async function GET() {
  const baseUrl = "https://www.tracify.tech";
  const posts = await getPosts();

  const items = posts
    .map(
      (post: any) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${baseUrl}/blog/${escapeXml(post.slug)}</link>
      <guid isPermaLink="true">${baseUrl}/blog/${escapeXml(post.slug)}</guid>
      <description>${escapeXml(post.excerpt || "")}</description>
      <pubDate>${formatRssDate(post.date)}</pubDate>
      ${post.author ? `<author>${escapeXml(post.author)}</author>` : ""}
      ${post.categories?.map((cat: string) => `<category>${escapeXml(cat)}</category>`).join("") || ""}
    </item>`
    )
    .join("");

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>tracify Blog</title>
  <link>${baseUrl}/blog</link>
  <description>Engineering insights, agent patterns, and production AI from the tracify team.</description>
  <language>en</language>
  <lastBuildDate>${formatRssDate(new Date().toISOString())}</lastBuildDate>
  <atom:link href="${baseUrl}/blog/rss.xml" rel="self" type="application/rss+xml"/>
  ${items}
</channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
