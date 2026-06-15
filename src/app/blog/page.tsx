import { client, urlFor } from "@/lib/sanity/client";
import { postsQuery } from "@/lib/sanity/queries";
import type { Metadata } from "next";
import Link from "next/link";

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

async function getPosts(): Promise<Post[]> {
  if (!client) return [];
  return await client.fetch(postsQuery).catch(() => []);
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#050505" }}>
      <div className="max-w-[900px] mx-auto px-6 py-24">
        <div className="mb-16">
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

        <div className="flex flex-col gap-8">
          {posts.map((post) => (
            <article
              key={post._id}
              className="border border-[#2A2A2A] bg-[#0A0A0A] hover:border-[#444444] transition-colors"
            >
              <Link href={`/blog/${post.slug}`} className="block p-6 md:p-8">
                {post.coverImage && (
                  <div className="mb-6 overflow-hidden border border-[#2A2A2A]">
                    <img
                      src={urlFor(post.coverImage)?.width(900).height(450).url() || ""}
                      alt={post.coverImage?.alt || post.title}
                      className="w-full h-auto object-cover"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 text-[12px] font-mono text-[#666666]">
                    <time dateTime={post.date}>{formatDate(post.date)}</time>
                    {post.author && (
                      <>
                        <span className="text-[#2A2A2A]">/</span>
                        <span>{post.author}</span>
                      </>
                    )}
                  </div>
                  <h2 className="font-mono text-[22px] font-bold text-white leading-snug">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="font-sans text-[14px] text-[#999999] leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}
                  {post.categories && post.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
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
      </div>
    </div>
  );
}
