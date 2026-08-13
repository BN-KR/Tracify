const key = "9f31b4a78c6d42e1a5b8f2037dc94e61";
const origin = "https://www.tracify.tech";
const shouldSubmit = process.argv.includes("--submit");

const sitemapResponse = await fetch(`${origin}/sitemap.xml`);
if (!sitemapResponse.ok) {
  throw new Error(`Could not load sitemap: HTTP ${sitemapResponse.status}`);
}

const sitemap = await sitemapResponse.text();
const urlList = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
if (!urlList.length) throw new Error("The production sitemap did not contain any URLs.");

const payload = {
  host: "www.tracify.tech",
  key,
  keyLocation: `${origin}/${key}.txt`,
  urlList,
};

if (!shouldSubmit) {
  console.log(`IndexNow dry run: ${urlList.length} canonical URLs are ready to submit.`);
  console.log("Run `npm run seo:indexnow -- --submit` after the key file is live in production.");
} else {
  const keyResponse = await fetch(payload.keyLocation);
  if (!keyResponse.ok || (await keyResponse.text()).trim() !== key) {
    throw new Error(`IndexNow key is not live at ${payload.keyLocation}. Deploy first, then retry.`);
  }

  const response = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload),
  });

  if (![200, 202].includes(response.status)) {
    throw new Error(`IndexNow rejected the submission: HTTP ${response.status} ${await response.text()}`);
  }

  console.log(`IndexNow accepted ${urlList.length} canonical URLs (HTTP ${response.status}).`);
}
