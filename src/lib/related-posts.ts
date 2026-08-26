import type { BlogPost } from "./markdoc-blog";

export type RelatedPostCandidate = Pick<BlogPost, "id" | "slug" | "title" | "draft" | "categories" | "publishedAt" | "heroImage">;

export function selectRelatedPosts({
  posts,
  preferredSlugs,
  currentSlug,
  categories,
  limit = 3,
}: {
  posts: RelatedPostCandidate[];
  preferredSlugs?: string[] | null;
  currentSlug: string;
  categories: string[];
  limit?: number;
}) {
  const eligible = posts.filter((post) => !post.draft && post.slug !== currentSlug);
  const bySlug = new Map(eligible.map((post) => [post.slug, post]));
  const selected: RelatedPostCandidate[] = [];
  const seen = new Set<string>();

  function add(post: RelatedPostCandidate | undefined) {
    if (!post || seen.has(post.slug) || selected.length >= limit) return;
    selected.push(post);
    seen.add(post.slug);
  }

  for (const slug of preferredSlugs ?? []) add(bySlug.get(slug));

  const newestFirst = (left: RelatedPostCandidate, right: RelatedPostCandidate) =>
    Date.parse(right.publishedAt) - Date.parse(left.publishedAt);
  const categorySet = new Set(categories);
  eligible
    .filter((post) => post.categories.some((category) => categorySet.has(category)))
    .sort(newestFirst)
    .forEach(add);
  eligible.sort(newestFirst).forEach(add);

  return selected;
}
