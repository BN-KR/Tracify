import { client, urlFor } from "@/lib/sanity/client";
import Link from "next/link";

interface RelatedPost {
  _id: string;
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  coverImage: any;
}

export async function RelatedPosts({
  categories,
  currentId,
}: {
  categories: string[];
  currentId?: string;
}) {
  if (!client || !categories?.length) return null;

  const posts: RelatedPost[] = await client
    .fetch(
      `*[_type == "post" && _id != $currentId && count(categories[@ in $categories]) > 0 && defined(slug.current)] | order(publishedAt desc) [0...3] {
        _id,
        title,
        "slug": slug.current,
        "date": publishedAt,
        excerpt,
        coverImage
      }`,
      { categories, currentId: currentId || "" }
    )
    .catch(() => []);

  if (!posts.length) return null;

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  return (
    <div className="mt-12 pt-8 border-t border-[#2A2A2A]">
      <h3 className="font-mono text-[16px] font-bold text-white mb-6">
        Related posts
      </h3>
      <div className="grid gap-4 md:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post._id}
            href={`/blog/${post.slug}`}
            className="border border-[#2A2A2A] bg-[#0A0A0A] hover:border-[#444444] transition-colors p-4 flex flex-col gap-2"
          >
            {post.coverImage && (
              <div className="overflow-hidden border border-[#2A2A2A]">
                <img
                  src={urlFor(post.coverImage)?.width(400).height(200).url() || ""}
                  alt=""
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
              </div>
            )}
            <time className="font-mono text-[10px] text-[#666666]">
              {formatDate(post.date)}
            </time>
            <span className="font-mono text-[13px] text-white leading-snug line-clamp-2">
              {post.title}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
