import config from "@payload-config";
import { getPayload, type Where } from "payload";

import type { Category, Media, Post } from "@/payload-types";

export type BlogPost = Post;

export function isPayloadConfigured() {
  if (process.env.VERCEL !== "1") return true;
  return Boolean(
    (process.env.DATABASE_URL || process.env.POSTGRES_URL) && process.env.PAYLOAD_SECRET,
  );
}

async function getPayloadClient() {
  if (!isPayloadConfigured()) return null;
  return getPayload({ config });
}

export async function getPublishedPosts(category?: string): Promise<BlogPost[]> {
  const payload = await getPayloadClient();
  if (!payload) return [];

  const where: Where = {
    _status: { equals: "published" },
  };

  if (category) {
    where["categories.slug"] = { equals: category };
  }

  try {
    const result = await payload.find({
      collection: "posts",
      depth: 2,
      draft: false,
      limit: 100,
      overrideAccess: true,
      sort: "-publishedAt",
      where,
    });
    return result.docs;
  } catch {
    return [];
  }
}

export async function getPublishedPost(slug: string): Promise<BlogPost | null> {
  const payload = await getPayloadClient();
  if (!payload) return null;

  try {
    const result = await payload.find({
      collection: "posts",
      depth: 3,
      draft: false,
      limit: 1,
      overrideAccess: true,
      where: {
        and: [{ slug: { equals: slug } }, { _status: { equals: "published" } }],
      },
    });
    return result.docs[0] ?? null;
  } catch {
    return null;
  }
}

export async function getCategoryOptions(): Promise<Array<{ label: string; value: string }>> {
  const payload = await getPayloadClient();
  if (!payload) return [];

  try {
    const result = await payload.find({
      collection: "categories",
      depth: 0,
      limit: 100,
      overrideAccess: true,
      sort: "title",
    });
    return result.docs
      .filter((category): category is Category & { slug: string } => Boolean(category.slug))
      .map((category) => ({ label: category.title, value: category.slug }));
  } catch {
    return [];
  }
}

export function getCategoryTitles(post: BlogPost): string[] {
  return (post.categories ?? [])
    .map((category) => (typeof category === "object" ? category.title : null))
    .filter((title): title is string => Boolean(title));
}

export function getMedia(value: number | Media | null | undefined): Media | null {
  return value && typeof value === "object" ? value : null;
}

export function getMediaUrl(value: number | Media | null | undefined, size?: keyof NonNullable<Media["sizes"]>) {
  const media = getMedia(value);
  if (!media) return null;
  const sizedUrl = size && media.sizes?.[size]?.url;
  return sizedUrl || media.url || null;
}

export function getPostDate(post: BlogPost) {
  return post.publishedAt || post.createdAt;
}

export function getTagNames(post: BlogPost) {
  return (post.tags ?? []).map((item) => item.tag).filter(Boolean);
}
