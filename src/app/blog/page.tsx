import { client, urlFor } from "@/lib/sanity/client";
import { postsQuery, postsByCategoryQuery, allCategoriesQuery } from "@/lib/sanity/queries";
import type { Metadata } from "next";
import Link from "next/link";
import { getReadingTime } from "@/components/blog/reading-time";
import { CategoryPills } from "@/components/blog/category-pills";
import { Pagination } from "@/components/blog/pagination";
import { NewsletterCta } from "@/components/blog/newsletter-cta";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Blog — tracify",
  description: "Engineering insights, agent patterns, and production AI from the tracify team.",
  openGraph: {
    title: "Blog — tracify",
    description: "Engineering insights, agent patterns, and production AI from the tracify team.",
    type: "website",
  },
};

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
  body: any[];
  seo: {
    metaTitle: string;
    metaDescription: string;
    ogImage: any;
    canonicalUrl: string;
  };
}

async function getPosts(category?: string): Promise<Post[]> {
  if (!client) return [];
  if (category) {
    return await client.fetch(postsByCategoryQuery, { category }).catch(() => []);
  }
  return await client.fetch(postsQuery).catch(() => []);
}

async function getAllCategories(): Promise<string[]> {
  if (!client) return [];
  const cats: string[] = await client.fetch(allCategoriesQuery).catch(() => []);
  return [...new Set(cats)].sort();
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPage(props: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await props.searchParams;
  const [posts, allCategories] = await Promise.all([
    getPosts(category),
    getAllCategories(),
  ]);

  const featured = posts.length > 0 ? posts[0] : null;
  const rest = posts.length > 1 ? posts.slice(1) : [];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#050505" }}>
      <div className="max-w-[900px] mx-auto px-6 py-24">
        <div className="mb-12">
          <Link
            href="/"
            className="font-mono text-[13px] text-[#666666] hover:text-white transition-colors"
          >
            ← Back to home
          </Link>
          <h1 className="font-mono text-[44px] font-bold text-white mt-6 mb-4 tracking-tight">
            Blog
          </h1>
          <p className="font-sans text-[16px] text-[#999999] max-w-[600px] leading-relaxed">
            Engineering insights, agent patterns, and production AI from the tracify team.
          </p>
        </div>

        {!client && (
          <div className="border border-[#2A2A2A] bg-[#0A0A0A] p-8">
            <p className="font-mono text-[14px] text-[#666666]">
              Blog is not yet configured. Set up your Sanity project to start posting.
            </p>
          </div>
        )}

        {client && posts.length === 0 && (
          <div className="border border-[#2A2A2A] bg-[#0A0A0A] p-8 text-center">
            <p className="font-mono text-[14px] text-[#666666]">
              No posts yet. Check back soon.
            </p>
          </div>
        )}

        {allCategories.length > 0 && (
          <div className="mb-10">
            <CategoryPills categories={allCategories} active={category} />
          </div>
        )}

        {featured && (
          <article className="mb-10 border border-[#2A2A2A] bg-[#0A0A0A] hover:border-[#444444] transition-colors">
            <Link href={`/blog/${featured.slug}`} className="block md:flex">
              {featured.coverImage && (
                <div className="md:w-1/2 overflow-hidden border-r border-[#2A2A2A]">
                  <img
                    src={urlFor(featured.coverImage)?.width(900).height(500).url() || ""}
                    alt={featured.coverImage?.alt || featured.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6 md:p-8 flex flex-col justify-center md:w-1/2">
                <div className="flex items-center gap-3 text-[12px] font-mono text-[#666666] mb-3">
                  <time dateTime={featured.date}>{formatDate(featured.date)}</time>
                  {featured.author && (
                    <>
                      <span className="text-[#2A2A2A]">/</span>
                      <span>{featured.author}</span>
                    </>
                  )}
                </div>
                <h2 className="font-mono text-[24px] font-bold text-white leading-snug mb-3">
                  {featured.title}
                </h2>
                {featured.excerpt && (
                  <p className="font-sans text-[14px] text-[#999999] leading-relaxed line-clamp-3 mb-3">
                    {featured.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-3 font-mono text-[11px] text-[#666666]">
                  <span>{getReadingTime(featured.body)} min read</span>
                </div>
              </div>
            </Link>
          </article>
        )}

        <div className="flex flex-col gap-6">
          {rest.map((post) => (
            <article
              key={post._id}
              className="border border-[#2A2A2A] bg-[#0A0A0A] hover:border-[#444444] transition-colors"
            >
              <Link href={`/blog/${post.slug}`} className="block p-6 md:p-8">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 text-[12px] font-mono text-[#666666]">
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
                  <h2 className="font-mono text-[20px] font-bold text-white leading-snug">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="font-sans text-[14px] text-[#999999] leading-relaxed line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                  {post.categories && post.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
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
                </div>
              </Link>
            </article>
          ))}
        </div>

        {posts.length > 0 && (
          <div className="mt-10">
            <Pagination hasOlder={false} hasNewer={false} category={category} />
          </div>
        )}

        <div className="mt-12">
          <NewsletterCta />
        </div>
      </div>
    </div>
  );
}
