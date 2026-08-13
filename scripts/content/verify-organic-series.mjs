import { SERIES_MANIFEST } from "./organic-series-manifest.ts";
import { existsSync, readFileSync } from "node:fs";
import { relative, resolve } from "node:path";

const errors = [];
const max = { excerpt: 220, metaTitle: 70, metaDescription: 180 };
const mediaRegistryPath = "scripts/content/media-sources.json";
const mediaDirectory = "public/media/organic-series/";
const mediaDirectoryPath = resolve(mediaDirectory);
let mediaSources = [];

try {
  mediaSources = JSON.parse(readFileSync(mediaRegistryPath, "utf8"));
  if (!Array.isArray(mediaSources)) errors.push("Media registry must be an array.");
} catch {
  errors.push(`Media registry is required at ${mediaRegistryPath}.`);
}

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

const mediaBySlug = new Map();
const sourceUrls = new Set();
const downloadUrls = new Set();
const localPaths = new Set();
for (const media of mediaSources) {
  if (!media?.slug?.trim()) {
    errors.push("Media entry slug is required.");
    continue;
  }
  if (mediaBySlug.has(media.slug)) errors.push(`Duplicate media entry slug: ${media.slug}.`);
  mediaBySlug.set(media.slug, media);
  if (!/^https:\/\/unsplash\.com\/photos\/.+-[A-Za-z0-9_-]+$/.test(media.sourceUrl ?? "")) errors.push(`${media.slug}: sourceUrl must be a specific Unsplash photo URL.`);
  if (!/^https:\/\/images\.unsplash\.com\/.+/.test(media.downloadUrl ?? "")) errors.push(`${media.slug}: downloadUrl must be a direct Unsplash image URL.`);
  if ((media.altText?.trim().length ?? 0) < 12) errors.push(`${media.slug}: altText must be at least 12 characters.`);
  const localPath = media.localPath ? resolve(media.localPath) : null;
  if (!localPath || relative(mediaDirectoryPath, localPath).startsWith("..")) errors.push(`${media.slug}: localPath must be within ${mediaDirectory}.`);
  else if (!existsSync(localPath)) errors.push(`${media.slug}: local image is missing at ${media.localPath}.`);
  for (const [value, label, set] of [[media.sourceUrl, "sourceUrl", sourceUrls], [media.downloadUrl, "downloadUrl", downloadUrls], [media.localPath, "localPath", localPaths]]) {
    if (!value?.trim()) continue;
    if (set.has(value)) errors.push(`${media.slug}: ${label} must be unique.`);
    set.add(value);
  }
}

if (mediaSources.length !== SERIES_MANIFEST.length) errors.push(`Expected ${SERIES_MANIFEST.length} media entries, found ${mediaSources.length}.`);
for (const entry of SERIES_MANIFEST) {
  const media = mediaBySlug.get(entry.slug);
  if (!media) errors.push(`${entry.slug}: media registry entry is required.`);
  else if (entry.unsplash.sourceUrl !== media.sourceUrl) errors.push(`${entry.slug}: manifest sourceUrl must match the media registry.`);
}

if (errors.length) {
  console.error("Organic-series manifest validation failed:\n- " + errors.join("\n- "));
  process.exit(1);
}

console.log(`Organic-series manifest validation passed for ${SERIES_MANIFEST.length} entries.`);
