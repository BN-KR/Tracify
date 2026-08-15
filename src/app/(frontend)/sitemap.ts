import { getPostDate, getPublishedPosts } from "@/lib/markdoc-blog";
import { getDocs } from "@/lib/markdoc-docs";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.tracify.tech";

  const posts = await getPublishedPosts();
  const blogPosts = posts.filter((post) => post.slug).map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(getPostDate(post)),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const productFeatures = ["trace-viewer", "cost-dashboard", "tool-calls", "llm-calls", "failures", "reports", "runtime-control", "evaluation-engine", "lifecycle"];
  const useCases = ["research", "support", "automation", "tool-calling"];
  const documentation = getDocs().map((doc) => doc.slug);

  return [
    { url: baseUrl, changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/blog`, lastModified: posts[0] ? new Date(getPostDate(posts[0])) : undefined, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/pricing`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/roadmap`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/integrations`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/security`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/status`, changeFrequency: "daily", priority: 0.5 },
    { url: `${baseUrl}/contact`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/changelog`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/demo`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/docs`, changeFrequency: "monthly", priority: 0.8 },
    ...documentation.map((slug) => ({ url: `${baseUrl}/docs/${slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...productFeatures.map((slug) => ({ url: `${baseUrl}/product/${slug}`, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...useCases.map((slug) => ({ url: `${baseUrl}/use-cases/${slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...blogPosts,
  ];
}
