import { AuthorBio } from "@/components/blog/author-bio";
import { MarkdocRichText } from "@/components/blog/markdoc-rich-text";
import { ProgressBar } from "@/components/blog/progress-bar";
import { RelatedPosts } from "@/components/blog/related-posts";
import { ShareButtons } from "@/components/blog/share-buttons";
import { getReadingTime } from "@/components/blog/reading-time";
import {
  getPostDate,
  getPublishedPost,
  getPublishedPosts,
  type BlogPost,
} from "@/lib/markdoc-blog";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 60;
export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.filter((post) => post.slug).map((post) => ({ slug: post.slug! }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) return {};

  const metaTitle = post.seo?.metaTitle || `${post.title} — Tracify Blog`;
  const metaDescription = post.seo?.metaDescription || post.excerpt;
  const image = post.seo.image?.og || post.seo.image?.src || post.heroImage?.og || post.heroImage?.src;

  return {
    title: metaTitle,
    description: metaDescription,
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      type: "article",
      publishedTime: getPostDate(post),
      authors: post.author ? [post.author] : undefined,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
      images: image ? [{ url: image }] : undefined,
    },
    alternates: {
      canonical: post.seo?.canonicalUrl || `/blog/${slug}`,
    },
    robots: { index: true, follow: true },
  };
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function absoluteUrl(value: string) {
  return value.startsWith("http") ? value : `https://www.tracify.tech${value}`;
}

function jsonLd(post: BlogPost) {
  const canonical = post.seo?.canonicalUrl || `https://www.tracify.tech/blog/${post.slug}`;
  const image = post.heroImage?.og || post.heroImage?.src;
  return [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt,
      datePublished: getPostDate(post),
      mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
      author: post.author === "Tracify Team"
        ? { "@type": "Organization", name: "Tracify", url: "https://www.tracify.tech" }
        : { "@type": "Person", name: post.author },
      publisher: { "@type": "Organization", name: "Tracify", url: "https://www.tracify.tech" },
      image: image ? absoluteUrl(image) : undefined,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Tracify", item: "https://www.tracify.tech/" },
        { "@type": "ListItem", position: 2, name: "Blog", item: "https://www.tracify.tech/blog" },
        { "@type": "ListItem", position: 3, name: post.title, item: canonical },
      ],
    },
  ];
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) notFound();

  const categories = post.categories;
  const tags = post.tags;
  const heroUrl = post.heroImage?.hero || post.heroImage?.src;

  return (
    <div className="min-h-screen bg-[#eceae3] pt-[54px] text-black">
      <ProgressBar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(post)).replace(/</g, "\\u003c") }}
      />
      <div className="mx-auto max-w-[1240px] border-x border-black">
        <Link
          href="/blog"
          className="inline-block border-b border-r border-black bg-[#f4d44d] px-6 py-4 font-mono text-[9px] uppercase tracking-[0.13em] hover:bg-black hover:text-black"
        >
          ← Back to blog
        </Link>

        <article>
          <header className="border-b border-black px-6 py-10 md:px-10 md:py-12">
            <div className="mb-4 flex items-center gap-3 font-mono text-[12px] text-black/55">
              <time dateTime={getPostDate(post)}>{formatDate(getPostDate(post))}</time>
              <span>/</span>
              <span>{post.author}</span>
              <span>/</span>
              <span>{getReadingTime(post.plainText)} min read</span>
            </div>

            <h1 className="mt-6 max-w-4xl font-pixel text-5xl leading-[0.9] tracking-[-0.045em] md:text-7xl">{post.title}</h1>
            <p className="mt-7 max-w-2xl text-base leading-7 text-black/58">{post.excerpt}</p>

            {categories.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {categories.map((category) => (
                  <span key={category} className="border border-black px-2 py-1 font-mono text-[8px] uppercase tracking-wider">{category}</span>
                ))}
              </div>
            ) : null}
          </header>

          {heroUrl ? (
            <div className="relative min-h-[320px] overflow-hidden border-b border-black bg-black md:min-h-[520px]">
              <Image
                src={heroUrl}
                alt={post.heroImage?.alt || post.title}
                fill
                sizes="(min-width: 1240px) 1240px, 100vw"
                className="object-cover grayscale"
              />
            </div>
          ) : null}

          <div className="mx-auto max-w-[820px] px-6 py-12 md:px-10 md:py-16">
            <MarkdocRichText content={post.content} />

            <div className="mt-12 flex flex-col gap-6 border-t border-black/20 pt-8">
              <ShareButtons title={post.title} />
              <AuthorBio author={post.author} />
            </div>

            <RelatedPosts posts={post.relatedPosts} />

            {tags.length ? (
              <div className="mt-12 border-t border-black/20 pt-8">
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span key={tag} className="border border-black/20 px-2 py-1 font-mono text-[11px] text-black/60">#{tag}</span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </article>
      </div>
    </div>
  );
}
