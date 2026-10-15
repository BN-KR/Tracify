import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin/", "/dashboard/", "/onboarding/", "/api/", "/sign-in", "/sign-up", "/forgot-password", "/reset-password", "/accept-invitation", "/auth/", "/alternative", "/library", "/operations-preview", "/tracify-preview", "/tracing-preview", "/cloud/", "/pricing/checkout", "/dash"] },
    sitemap: "https://www.tracify.tech/sitemap.xml",
  };
}
