import type { Metadata } from "next";

export const SITE_URL = "https://www.tracify.tech";
export const SITE_NAME = "Tracify";

type PageMetadataInput = {
  title: string;
  description: string;
  /** Canonical path such as `/pricing`. Always the final www URL, no redirects. */
  path: string;
  /** Optional absolute or root-relative image. Falls back to the generated site card. */
  image?: string;
  type?: "website" | "article";
};

/**
 * One place that builds the title, canonical, Open Graph and X card values so
 * every public page ships the full set the SEO release checklist requires.
 */
export function pageMetadata({ title, description, path, image, type = "website" }: PageMetadataInput): Metadata {
  const images = image ? [{ url: image }] : undefined;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title: `${title} | ${SITE_NAME}`, description, url: path, siteName: SITE_NAME, locale: "en_US", type, images },
    twitter: { card: "summary_large_image", title: `${title} | ${SITE_NAME}`, description, images: image ? [image] : undefined },
  };
}

/** Utility routes (auth, onboarding, checkout, previews) must never be indexed. */
export const noIndex: Metadata = { robots: { index: false, follow: false } };

export function breadcrumbJsonLd(items: ReadonlyArray<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

export function faqJsonLd(items: ReadonlyArray<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

/** Serialises JSON-LD safely for an inline script tag. */
export function jsonLdString(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
