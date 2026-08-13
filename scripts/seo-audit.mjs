const origin = (process.argv.find((argument) => argument.startsWith("http")) || "https://www.tracify.tech").replace(/\/$/, "");
const canonicalOrigin = "https://www.tracify.tech";
const failures = [];

async function request(url) {
  try {
    return await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(10_000) });
  } catch (error) {
    failures.push(`${url}: request failed (${error.name})`);
    return null;
  }
}

function content(html, pattern) {
  return (html.match(pattern)?.[1] || "").replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, " ").replace(/\s+/g, " ").trim();
}

const sitemapResponse = await request(`${origin}/sitemap.xml`);
if (!sitemapResponse || sitemapResponse.status !== 200) throw new Error(`Sitemap returned HTTP ${sitemapResponse?.status || 0}`);
const sitemapXml = await sitemapResponse.text();
const sitemapUrls = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
const sitemapPaths = new Set(sitemapUrls.map((url) => new URL(url).pathname.replace(/\/$/, "") || "/"));
const canonicalOwners = new Map();
const internalPaths = new Set();

for (let index = 0; index < sitemapUrls.length; index += 10) {
  const batch = sitemapUrls.slice(index, index + 10);
  const pages = await Promise.all(batch.map(async (canonicalUrl) => {
    const fetchUrl = `${origin}${new URL(canonicalUrl).pathname}`;
    const response = await request(fetchUrl);
    return { canonicalUrl, response, html: response ? await response.text() : "" };
  }));

  for (const { canonicalUrl, response, html } of pages) {
    if (!response) continue;
    if (response.status !== 200) failures.push(`${canonicalUrl}: sitemap URL returned HTTP ${response.status}`);
    const title = content(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
    const description = content(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)/i) || content(html, /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i);
    const canonical = content(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)/i) || content(html, /<link[^>]+href=["']([^"']*)["'][^>]+rel=["']canonical["']/i);
    const h1 = content(html, /<h1(?:\s[^>]*)?>([\s\S]*?)<\/h1>/i);
    const og = new Set([...html.matchAll(/<meta[^>]+property=["']og:([^"']+)["']/gi)].map((match) => match[1]));
    const twitter = new Set([...html.matchAll(/<meta[^>]+name=["']twitter:([^"']+)["']/gi)].map((match) => match[1]));

    if (title.length < 30 || title.length > 65) failures.push(`${canonicalUrl}: title length is ${title.length}`);
    if (description.length < 70 || description.length > 160) failures.push(`${canonicalUrl}: description length is ${description.length}`);
    if (!h1) failures.push(`${canonicalUrl}: missing non-empty H1`);
    if (canonical !== canonicalUrl) failures.push(`${canonicalUrl}: canonical is ${canonical || "missing"}`);
    for (const property of ["title", "description", "url", "image"]) if (!og.has(property)) failures.push(`${canonicalUrl}: missing og:${property}`);
    for (const property of ["card", "title", "description", "image"]) if (!twitter.has(property)) failures.push(`${canonicalUrl}: missing twitter:${property}`);

    const priorOwner = canonicalOwners.get(canonical);
    if (priorOwner && priorOwner !== canonicalUrl) failures.push(`${canonicalUrl}: duplicate canonical also used by ${priorOwner}`);
    canonicalOwners.set(canonical, canonicalUrl);

    for (const match of html.matchAll(/<a\b[^>]*href=["']([^"'#]+)(?:#[^"']*)?["']/gi)) {
      try {
        const linked = new URL(match[1].replaceAll("&amp;", "&"), canonicalUrl);
        if (linked.origin === canonicalOrigin) internalPaths.add(linked.pathname.replace(/\/$/, "") || "/");
      } catch {}
    }
  }
}

for (const path of internalPaths) {
  const response = await request(`${origin}${path}`);
  if (!response) continue;
  if (response.status >= 300 && response.status < 400) failures.push(`${canonicalOrigin}${path}: internal link redirects to ${response.headers.get("location")}`);
  if (response.status >= 400) failures.push(`${canonicalOrigin}${path}: internal link returned HTTP ${response.status}`);
  if (response.status === 200 && !sitemapPaths.has(path)) {
    const html = await response.text();
    const noindex = /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html);
    if (!noindex) failures.push(`${canonicalOrigin}${path}: indexable internal page is missing from sitemap`);
  }
}

if (failures.length) {
  console.error(`SEO audit failed with ${failures.length} issue(s):\n- ${failures.join("\n- ")}`);
  process.exit(1);
}

console.log(`SEO audit passed: ${sitemapUrls.length} sitemap pages and ${internalPaths.size} internal destinations checked.`);
