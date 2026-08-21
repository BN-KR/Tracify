import type { BlogPost } from "./markdoc-blog";

export type BlogFrameworkIssue = {
  slug: string;
  code: "missing-hero" | "missing-interaction" | "too-few-sections" | "missing-action";
  message: string;
};

const actionHeading = /^(?:.*\b(checklist|questions|takeaway|next step|final|closing|review)\b)/i;

export function validateBlogFramework(posts: Pick<BlogPost, "slug" | "draft" | "heroImage" | "body" | "headings">[]) {
  const issues: BlogFrameworkIssue[] = [];

  for (const post of posts.filter((candidate) => !candidate.draft)) {
    if (!post.heroImage) {
      issues.push({ slug: post.slug, code: "missing-hero", message: "Published posts need a hero image." });
    }
    if (!/\{%\s*trace-scenario\b/.test(post.body)) {
      issues.push({ slug: post.slug, code: "missing-interaction", message: "Published posts need one purposeful interactive scenario." });
    }
    if (post.headings.filter((heading) => heading.level === 2).length < 6) {
      issues.push({ slug: post.slug, code: "too-few-sections", message: "Published posts need at least six substantive H2 sections." });
    }
    if (!post.headings.some((heading) => actionHeading.test(heading.text))) {
      issues.push({ slug: post.slug, code: "missing-action", message: "Published posts need a checklist, review, takeaway, or next-step section." });
    }
  }

  return issues;
}
