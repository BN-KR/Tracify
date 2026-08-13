import { SERIES_MANIFEST } from "./organic-series-manifest.ts";

const errors = [];
const max = { excerpt: 220, metaTitle: 70, metaDescription: 180 };

if (SERIES_MANIFEST.length !== 10) errors.push(`Expected exactly 10 entries, found ${SERIES_MANIFEST.length}.`);

const slugs = new Set();
for (const entry of SERIES_MANIFEST) {
  if (!entry.slug || slugs.has(entry.slug)) errors.push(`Slug must be unique: ${entry.slug || "(missing)"}.`);
  slugs.add(entry.slug);
  if (entry.relatedSlugs.length < 2) errors.push(`${entry.slug}: at least two related slugs are required.`);
  if (!entry.primaryKeyword?.trim()) errors.push(`${entry.slug}: primary keyword is required.`);
  if (!entry.unsplash?.sourceUrl?.trim() || !entry.unsplash?.description?.trim()) errors.push(`${entry.slug}: Unsplash source data is required.`);
  if (!entry.tracifyLink?.startsWith("/docs/") && !entry.tracifyLink?.startsWith("/product/")) errors.push(`${entry.slug}: a Tracify /docs/ or /product/ link is required.`);
  for (const [field, limit] of Object.entries(max)) {
    const value = field === "excerpt" ? entry.excerpt : entry.seo[field];
    if (!value?.trim()) errors.push(`${entry.slug}: ${field} is required.`);
    else if (value.length > limit) errors.push(`${entry.slug}: ${field} exceeds ${limit} characters.`);
  }
}

if (errors.length) {
  console.error("Organic-series manifest validation failed:\n- " + errors.join("\n- "));
  process.exit(1);
}

console.log(`Organic-series manifest validation passed for ${SERIES_MANIFEST.length} entries.`);
