import { AuthorBio } from "@/components/blog/author-bio";
import { MarkdocRichText } from "@/components/blog/markdoc-rich-text";
import { BlogTableOfContents } from "@/components/blog/blog-table-of-contents";
import { ProgressBar } from "@/components/blog/progress-bar";
import { RelatedPosts } from "@/components/blog/related-posts";
import { ShareButtons } from "@/components/blog/share-buttons";
import { getReadingTime } from "@/components/blog/reading-time";
import {
  extractBlogFaqItems,
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
  const faqItems = extractBlogFaqItems(post.body);

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
    ...(faqItems.length
      ? [
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqItems.map((item) => ({
              "@type": "Question",
              name: item.question,
              acceptedAnswer: { "@type": "Answer", text: item.answer },
            })),
          },
        ]
      : []),
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
  const isMonitoringPost = post.slug === "ai-agent-monitoring";
  const articleClassName = isMonitoringPost ? "blog-post--monitoring" : undefined;

  return (
    <div className="min-h-screen bg-[#eceae3] text-black">
      <ProgressBar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(post)).replace(/</g, "\\u003c") }}
      />
      <article className={articleClassName}>
        <header className="relative isolate overflow-hidden bg-[#090909] text-[#eceae3]">
          <Image src="/images/reading/blog.png" alt="" fill priority unoptimized sizes="100vw" className="-z-10 object-cover object-right opacity-40 [image-rendering:pixelated]" />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#090909_30%,rgba(9,9,9,0.6)_70%,rgba(9,9,9,0.3)_100%)]" />
          <div className="mx-auto max-w-[1240px] px-5 pb-12 pt-10 sm:px-8 md:pb-16 md:pt-14">
            <Link href="/blog" className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#f4d44d] transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f4d44d]">
              ← All articles
            </Link>
            <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.12em] text-white/60">
              <time dateTime={getPostDate(post)}>{formatDate(getPostDate(post))}</time>
              <span aria-hidden="true">/</span>
              <span>{post.author}</span>
              <span aria-hidden="true">/</span>
              <span>{getReadingTime(post.plainText)} min read</span>
            </div>
            <h1 className="blog-post__title mt-6 max-w-4xl text-balance font-pixel text-[clamp(2.6rem,6.5vw,5.8rem)] leading-[0.9] tracking-[-0.055em]">{post.title}</h1>
            <p className="mt-7 max-w-2xl text-pretty text-base leading-7 text-white/70 md:text-lg md:leading-8">{post.excerpt}</p>

            {categories.length ? (
              <div className="mt-8 flex flex-wrap gap-2">
                {categories.map((category) => (
                  <span key={category} className="border border-[#f4d44d] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[#f4d44d]">{category}</span>
                ))}
              </div>
            ) : null}
          </div>
        </header>

        <div className="mx-auto max-w-[1240px] border-x border-black">
          {heroUrl ? (
            <div className="relative min-h-[320px] overflow-hidden border-b border-black bg-black md:min-h-[520px]">
              <Image
                src={heroUrl}
                alt={post.heroImage?.alt || post.title}
                fill
                sizes="(min-width: 1240px) 1240px, 100vw"
                className="object-cover"
              />
            </div>
          ) : null}

          <div className="blog-post__body mx-auto max-w-[820px] px-6 py-12 md:px-10 md:py-16">
            <BlogTableOfContents headings={post.headings} />
            <MarkdocRichText content={post.content} />

            <div className="mt-12 flex flex-col gap-6 border-t border-black/20 pt-8">
              <ShareButtons title={post.title} />
              <AuthorBio author={post.author} />
            </div>

            {!isMonitoringPost ? <RelatedPosts posts={post.relatedPosts} currentSlug={post.slug} categories={post.categories} /> : null}

            {tags.length ? (
              <div className="mt-12 border-t border-black/20 pt-8">
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span key={tag} className="border border-black/20 px-2 py-1 font-mono text-[11px] text-black/60">#{tag}</span>
                  ))}
                </div>
              </div>
            ) : null}

            {isMonitoringPost ? <RelatedPosts posts={post.relatedPosts} currentSlug={post.slug} categories={post.categories} heading="Recommended posts" /> : null}
          </div>
        </div>
      </article>
    </div>
  );
}
