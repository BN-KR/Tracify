export type BlogLinkSource = {
  slug: string;
  draft: boolean;
  body: string;
};

export type BlogInternalLinkIssue = {
  slug: string;
  code:
    | "too-few"
    | "self-link"
    | "missing-target"
    | "draft-target"
    | "generic-anchor"
    | "bare-anchor";
  message: string;
};

const internalBlogLink = /(?<!!)\[([^\]]+)\]\(\/blog\/([a-z0-9-]+)(?:#[^)]+)?\)/g;
const genericAnchors = new Set(["click here", "read more", "related guide"]);

export function validateBlogInternalLinks(posts: BlogLinkSource[]): BlogInternalLinkIssue[] {
  const postsBySlug = new Map(posts.map((post) => [post.slug, post]));
  const published = posts.filter((post) => !post.draft);
  const issues: BlogInternalLinkIssue[] = [];

  for (const post of published) {
    const validTargets = new Set<string>();

    for (const match of post.body.matchAll(internalBlogLink)) {
      const anchor = match[1].trim();
      const targetSlug = match[2];
      const target = postsBySlug.get(targetSlug);
      let valid = true;

      if (targetSlug === post.slug) {
        issues.push({ slug: post.slug, code: "self-link", message: `Links to itself: ${targetSlug}` });
        valid = false;
      } else if (!target) {
        issues.push({ slug: post.slug, code: "missing-target", message: `Missing target: ${targetSlug}` });
        valid = false;
      } else if (target.draft) {
        issues.push({ slug: post.slug, code: "draft-target", message: `Target is a draft: ${targetSlug}` });
        valid = false;
      }

      if (genericAnchors.has(anchor.toLowerCase())) {
        issues.push({ slug: post.slug, code: "generic-anchor", message: `Generic anchor: ${anchor}` });
        valid = false;
      } else if (/^\/?blog\//i.test(anchor) || /^https?:\/\//i.test(anchor)) {
        issues.push({ slug: post.slug, code: "bare-anchor", message: `Bare URL anchor: ${anchor}` });
        valid = false;
      }

      if (valid) validTargets.add(targetSlug);
    }

    const requiredTargets = Math.min(2, published.length - 1);
    if (validTargets.size < requiredTargets) {
      issues.push({
        slug: post.slug,
        code: "too-few",
        message: `Expected ${requiredTargets} distinct contextual blog links; found ${validTargets.size}`,
      });
    }
  }

  return issues;
}
