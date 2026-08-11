import { client } from "@/lib/sanity/client";
import { postSlugsQuery } from "@/lib/sanity/queries";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.tracify.tech";

  let slugs: string[] = [];
  if (client) {
    slugs = await client.fetch(postSlugsQuery).catch(() => []);
  }

  const blogPosts = slugs.map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const productFeatures = ["trace-viewer", "cost-dashboard", "tool-calls", "llm-calls", "failures", "reports", "runtime-control", "evaluation-engine", "lifecycle"];
  const useCases = ["research", "support", "automation", "tool-calling"];
  const documentation = ["python", "typescript", "api", "prompts", "evaluation", "lifecycle", "integrations", "self-hosting"];

  return [
    { url: baseUrl, changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/pricing`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/roadmap`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/integrations`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/security`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/status`, lastModified: new Date(), changeFrequency: "daily", priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/changelog`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/demo`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/docs`, changeFrequency: "monthly", priority: 0.8 },
    ...documentation.map((slug) => ({ url: `${baseUrl}/docs/${slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...productFeatures.map((slug) => ({ url: `${baseUrl}/product/${slug}`, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...useCases.map((slug) => ({ url: `${baseUrl}/use-cases/${slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...blogPosts,
  ];
}
