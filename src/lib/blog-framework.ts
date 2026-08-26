import type { BlogPost } from "./markdoc-blog";

export type BlogFrameworkIssue = {
  slug: string;
  code: "missing-hero" | "missing-interaction" | "too-few-sections" | "missing-action" | "too-short" | "too-long" | "missing-visual" | "missing-code" | "missing-note" | "missing-emphasis" | "missing-faq" | "faq-too-early" | "multiple-faq-sections";
  message: string;
};

const actionHeading = /^(?:.*\b(checklist|questions|takeaway|next step|final|closing|review)\b)/i;
const MIN_BODY_WORDS = 3000;
const MAX_BODY_WORDS = 10000;

export function countBlogBodyWords(body: string) {
  return (body.match(/\b[A-Za-z0-9][A-Za-z0-9’'-]*\b/g) ?? []).length;
}

export function validateBlogFramework(posts: Pick<BlogPost, "slug" | "draft" | "heroImage" | "body" | "headings">[]) {
  const issues: BlogFrameworkIssue[] = [];

  for (const post of posts.filter((candidate) => !candidate.draft)) {
    const wordCount = countBlogBodyWords(post.body);
    if (wordCount < MIN_BODY_WORDS) {
      issues.push({ slug: post.slug, code: "too-short", message: `Published posts need at least ${MIN_BODY_WORDS} body words; found ${wordCount}.` });
    } else if (wordCount > MAX_BODY_WORDS) {
      issues.push({ slug: post.slug, code: "too-long", message: `Published posts may not exceed ${MAX_BODY_WORDS} body words; found ${wordCount}.` });
    }
    if (!post.heroImage) {
      issues.push({ slug: post.slug, code: "missing-hero", message: "Published posts need a hero image." });
    }
    if (!/!\[[^\]]+\]\(\/media\/[^)]+\)/.test(post.body)) {
      issues.push({ slug: post.slug, code: "missing-visual", message: "Published posts need at least one meaningful in-article visual." });
    }
    const fence = String.fromCharCode(96).repeat(3);
    if (!new RegExp(`${fence}[\\s\\S]*?${fence}`).test(post.body)) {
      issues.push({ slug: post.slug, code: "missing-code", message: "Published posts need one practical or clearly illustrative code example." });
    }
    if (!/^>\s+\*\*(?:Note|Decision rule|Warning|Trade-off|Rollout rule|Runbook rule|Diagnostic shortcut):/im.test(post.body)) {
      issues.push({ slug: post.slug, code: "missing-note", message: "Published posts need a mid-article decision note, warning, or trade-off callout." });
    }
    if (!/\*\*[^*]+\*\*/.test(post.body)) {
      issues.push({ slug: post.slug, code: "missing-emphasis", message: "Published posts need restrained emphasis for a high-impact idea." });
    }
    const faqHeadings = post.headings.filter((heading) => /\b(?:FAQ|frequently asked questions)\b/i.test(heading.text));
    const faqItems = (post.body.match(/\{%\s*faq-item\b/g) ?? []).length;
    if (faqItems < 2 || faqHeadings.length === 0) {
      issues.push({ slug: post.slug, code: "missing-faq", message: "Published posts need one FAQ section with at least two shared accordion items." });
    } else if (faqHeadings.length > 1) {
      issues.push({ slug: post.slug, code: "multiple-faq-sections", message: "Published posts must have exactly one FAQ section." });
    } else {
      const faqIndex = post.body.search(/^##+\s+.*\b(?:FAQ|frequently asked questions)\b/im);
      if (faqIndex >= 0 && faqIndex < post.body.length * 0.65) {
        issues.push({ slug: post.slug, code: "faq-too-early", message: "The FAQ belongs after the main teaching content, not in the opening third." });
      }
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
