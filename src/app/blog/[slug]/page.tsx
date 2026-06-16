import { client, urlFor } from "@/lib/sanity/client";
import { postQuery, postSlugsQuery } from "@/lib/sanity/queries";
import { PortableText } from "@portabletext/react";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getReadingTime } from "@/components/blog/reading-time";
import { AuthorBio } from "@/components/blog/author-bio";
import { ShareButtons } from "@/components/blog/share-buttons";
import { ProgressBar } from "@/components/blog/progress-bar";
import { TableOfContents } from "@/components/blog/table-of-contents";
import { NewsletterCta } from "@/components/blog/newsletter-cta";
import { RelatedPosts } from "@/components/blog/related-posts";

export const revalidate = 60;

interface Post {
  _id: string;
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  author: string;
  categories: string[];
  tags: string[];
  coverImage: any;
  seo: {
    metaTitle: string;
    metaDescription: string;
    ogImage: any;
    canonicalUrl: string;
  };
  body: any[];
}

async function getPost(slug: string): Promise<Post | null> {
  if (!client) return null;
  return await client.fetch(postQuery, { slug }).catch(() => null);
}

export async function generateStaticParams() {
  if (!client) return [];
  const slugs: string[] = await client.fetch(postSlugsQuery).catch(() => []);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) return {};

  const metaTitle = post.seo?.metaTitle || `${post.title} — tracify Blog`;
  const metaDescription = post.seo?.metaDescription || post.excerpt || "";
  const ogImage = post.seo?.ogImage || post.coverImage;

  return {
    title: metaTitle,
    description: metaDescription,
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      type: "article",
      publishedTime: post.date,
      authors: post.author ? [post.author] : undefined,
      images: ogImage
        ? [{ url: urlFor(ogImage)?.width(1200).height(630).url() || "" }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
      images: ogImage
        ? [{ url: urlFor(ogImage)?.width(1200).height(630).url() || "" }]
        : undefined,
    },
    alternates: post.seo?.canonicalUrl
      ? { canonical: post.seo.canonicalUrl }
      : undefined,
    robots: {
      index: true,
      follow: true,
    },
  };
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function jsonLd(post: Post) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || "",
    datePublished: post.date,
    author: post.author
      ? { "@type": "Person", name: post.author }
      : { "@type": "Organization", name: "Tracify" },
    image: post.coverImage
      ? urlFor(post.coverImage)?.width(1200).height(630).url()
      : undefined,
  };
}

function HeadingWithAnchor({ level, children, style }: any) {
  const text = typeof children === "string" ? children : "";
  const id = slugify(text);
  const Tag = level;
  const sizeClasses: Record<string, string> = {
    h2: "font-mono text-[24px] md:text-[28px] font-bold text-white mt-12 mb-4 leading-snug",
    h3: "font-mono text-[18px] md:text-[20px] font-bold text-white mt-10 mb-3 leading-snug",
    h4: "font-mono text-[16px] font-bold text-white mt-8 mb-2 leading-snug",
  };
  return (
    <Tag id={id} className={sizeClasses[level] || style}>
      {children}
    </Tag>
  );
}

const portableTextComponents = {
  block: {
    normal: ({ children }: any) => (
      <p className="font-sans text-[15px] md:text-[16px] text-[#CCCCCC] leading-[1.8] mb-5">
        {children}
      </p>
    ),
    h2: ({ children }: any) => (
      <HeadingWithAnchor level="h2">{children}</HeadingWithAnchor>
    ),
    h3: ({ children }: any) => (
      <HeadingWithAnchor level="h3">{children}</HeadingWithAnchor>
    ),
    h4: ({ children }: any) => (
      <HeadingWithAnchor level="h4">{children}</HeadingWithAnchor>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-2 border-[#444444] pl-4 my-6 font-mono text-[14px] text-[#999999] italic">
        {children}
      </blockquote>
    ),
    code: ({ children }: any) => (
      <pre className="border border-[#2A2A2A] bg-[#0A0A0A] p-4 my-6 overflow-x-auto font-mono text-[13px] text-[#CCCCCC] leading-relaxed">
        <code>{children}</code>
      </pre>
    ),
  },
  list: {
    bullet: ({ children }: any) => (
      <ul className="list-disc pl-6 mb-5 font-sans text-[15px] md:text-[16px] text-[#CCCCCC] leading-[1.8] space-y-1">
        {children}
      </ul>
    ),
    number: ({ children }: any) => (
      <ol className="list-decimal pl-6 mb-5 font-sans text-[15px] md:text-[16px] text-[#CCCCCC] leading-[1.8] space-y-1">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }: any) => <li>{children}</li>,
    number: ({ children }: any) => <li>{children}</li>,
  },
  marks: {
    strong: ({ children }: any) => (
      <strong className="font-bold text-white">{children}</strong>
    ),
    em: ({ children }: any) => <em className="italic">{children}</em>,
    code: ({ children }: any) => (
      <code className="font-mono text-[13px] bg-[#0A0A0A] border border-[#2A2A2A] px-1 py-0.5 text-[#CCCCCC]">
        {children}
      </code>
    ),
    link: ({ children, value }: any) => (
      <a
        href={value?.href}
        target={value?.blank ? "_blank" : undefined}
        rel={value?.blank ? "noopener noreferrer" : undefined}
        className="text-white underline underline-offset-4 decoration-[#444444] hover:decoration-white transition-colors"
      >
        {children}
      </a>
    ),
    internalLink: ({ children, value }: any) => {
      const slug = value?.reference?.slug;
      return slug ? (
        <Link
          href={`/blog/${slug}`}
          className="text-white underline underline-offset-4 decoration-[#444444] hover:decoration-white transition-colors"
        >
          {children}
        </Link>
      ) : (
        <>{children}</>
      );
    },
  },
  types: {
    image: ({ value }: any) => (
      <figure className="my-8 border border-[#2A2A2A] overflow-hidden">
        <img
          src={urlFor(value)?.width(900).height(500).url() || ""}
          alt={value?.alt || ""}
          className="w-full h-auto object-cover"
        />
        {value?.caption && (
          <figcaption className="font-mono text-[12px] text-[#666666] text-center py-3 px-4 border-t border-[#2A2A2A]">
            {value.caption}
          </figcaption>
        )}
      </figure>
    ),
    code: ({ value }: any) => (
      <div className="my-6 border border-[#2A2A2A]">
        {value?.language && (
          <div className="font-mono text-[10px] uppercase tracking-widest text-[#666666] bg-[#050505] px-4 py-1.5 border-b border-[#2A2A2A]">
            {value.language}
          </div>
        )}
        <pre className="bg-[#0A0A0A] p-4 overflow-x-auto font-mono text-[13px] text-[#CCCCCC] leading-relaxed m-0">
          <code>{value?.code || ""}</code>
        </pre>
      </div>
    ),
  },
};

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#050505" }}>
      <ProgressBar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd(post)),
        }}
      />
      <div className="max-w-[720px] mx-auto px-6 py-24">
        <Link
          href="/blog"
          className="font-mono text-[13px] text-[#666666] hover:text-white transition-colors inline-block mb-12"
        >
          ← Back to blog
        </Link>

        <article>
          <header className="mb-10">
            <div className="flex items-center gap-3 text-[12px] font-mono text-[#666666] mb-4">
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              {post.author && (
                <>
                  <span className="text-[#2A2A2A]">/</span>
                  <span>{post.author}</span>
                </>
              )}
              <span className="text-[#2A2A2A]">/</span>
              <span>{getReadingTime(post.body)} min read</span>
            </div>

            <h1 className="font-mono text-[32px] md:text-[40px] font-bold text-white leading-tight mb-4">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="font-sans text-[16px] text-[#999999] leading-relaxed max-w-[600px]">
                {post.excerpt}
              </p>
            )}

            {post.categories && post.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {post.categories.map((cat) => (
                  <span
                    key={cat}
                    className="font-mono text-[11px] text-[#666666] uppercase tracking-wider border border-[#2A2A2A] px-2 py-0.5"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            )}
          </header>

          {post.coverImage && (
            <div className="mb-10 border border-[#2A2A2A] overflow-hidden">
              <img
                src={urlFor(post.coverImage)?.width(900).height(450).url() || ""}
                alt={post.coverImage?.alt || post.title}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          <div className="flex gap-10">
            <div className="hidden lg:block w-[200px] shrink-0">
              <div className="sticky top-24">
                <TableOfContents body={post.body} />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="lg:hidden mb-8">
                <TableOfContents body={post.body} />
              </div>

              <div className="prose-custom">
                <PortableText
                  value={post.body}
                  components={portableTextComponents}
                />
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-[#2A2A2A] flex flex-col gap-6">
            <ShareButtons title={post.title} />

            <AuthorBio author={post.author} />
          </div>

          <RelatedPosts categories={post.categories} />

          <div className="mt-10">
            <NewsletterCta />
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-[#2A2A2A]">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-[11px] text-[#666666] border border-[#2A2A2A] px-2 py-1"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
