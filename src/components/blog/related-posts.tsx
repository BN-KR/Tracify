import { getPublishedPosts } from "@/lib/markdoc-blog";
import Image from "next/image";
import Link from "next/link";

export function RelatedPosts({ posts }: { posts?: string[] | null }) {
  const slugs = new Set(posts ?? []);
  const related = getPublishedPosts().filter((post) => slugs.has(post.slug)).slice(0, 3);
  if (!related.length) return null;

  return (
    <div className="mt-12 border-t border-black/20 pt-8">
      <h3 className="mb-6 font-mono text-[16px] font-bold text-black">Related posts</h3>
      <div className="grid gap-4 md:grid-cols-3">
        {related.map((post) => {
          const image = post.heroImage?.card || post.heroImage?.src;
          return (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="flex flex-col gap-3 border border-black bg-white/35 p-4 transition-colors hover:bg-[#f4d44d]"
            >
              {image ? (
                <div className="relative aspect-video overflow-hidden border border-black">
                  <Image src={image} alt="" fill sizes="(min-width: 768px) 240px, 100vw" className="object-cover grayscale" />
                </div>
              ) : null}
              <span className="font-mono text-[13px] leading-snug text-black">{post.title}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
