import { AuthorBio } from "@/components/blog/author-bio";
import { NewsletterCta } from "@/components/blog/newsletter-cta";
import { PayloadRichText } from "@/components/blog/payload-rich-text";
import { ProgressBar } from "@/components/blog/progress-bar";
import { RelatedPosts } from "@/components/blog/related-posts";
import { ShareButtons } from "@/components/blog/share-buttons";
import { getReadingTime } from "@/components/blog/reading-time";
import {
  getCategoryTitles,
  getMedia,
  getMediaUrl,
  getPostDate,
  getPublishedPost,
  getPublishedPosts,
  getTagNames,
  type BlogPost,
} from "@/lib/payload-blog";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 60;

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
  const image = getMediaUrl(post.seo?.image || post.heroImage, "og");

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

function jsonLd(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: getPostDate(post),
    author: post.author
      ? { "@type": "Person", name: post.author }
      : { "@type": "Organization", name: "Tracify" },
    image: getMediaUrl(post.heroImage, "og") || undefined,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) notFound();

  const categories = getCategoryTitles(post);
  const tags = getTagNames(post);
  const heroUrl = getMediaUrl(post.heroImage, "hero");

  return (
    <div className="min-h-screen bg-[#eceae3] pt-[54px] text-black">
      <ProgressBar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(post)) }}
      />
      <div className="mx-auto max-w-[1240px] border-x border-black">
        <Link
          href="/blog"
          className="inline-block border-b border-r border-black bg-[#f4d44d] px-6 py-4 font-mono text-[9px] uppercase tracking-[0.13em] hover:bg-black hover:text-white"
        >
          ← Back to blog
        </Link>

        <article>
          <header className="border-b border-black px-6 py-14 md:px-10 md:py-20">
            <div className="mb-4 flex items-center gap-3 font-mono text-[12px] text-[#666666]">
              <time dateTime={getPostDate(post)}>{formatDate(getPostDate(post))}</time>
              <span>/</span>
              <span>{post.author}</span>
              <span>/</span>
              <span>{getReadingTime(post.content)} min read</span>
            </div>

            <h1 className="mt-6 max-w-5xl font-pixel text-6xl leading-[0.84] tracking-[-0.065em] md:text-8xl">{post.title}</h1>
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
                alt={getMedia(post.heroImage)?.alt || post.title}
                fill
                sizes="(min-width: 1240px) 1240px, 100vw"
                className="object-cover grayscale"
              />
            </div>
          ) : null}

          <div className="mx-auto max-w-[820px] px-6 py-12 md:px-10 md:py-16">
            <PayloadRichText data={post.content} />

            <div className="mt-12 flex flex-col gap-6 border-t border-black/20 pt-8">
              <ShareButtons title={post.title} />
              <AuthorBio author={post.author} />
            </div>

            <RelatedPosts posts={post.relatedPosts} />

            <div className="mt-10"><NewsletterCta /></div>

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
