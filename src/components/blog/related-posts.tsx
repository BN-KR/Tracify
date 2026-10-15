import { getPublishedPosts } from "@/lib/markdoc-blog";
import { selectRelatedPosts } from "@/lib/related-posts";
import Image from "next/image";
import Link from "next/link";

export function RelatedPosts({
  posts,
  currentSlug,
  categories,
  heading = "Related posts",
}: {
  posts?: string[] | null;
  currentSlug: string;
  categories: string[];
  heading?: string;
}) {
  const related = selectRelatedPosts({
    posts: getPublishedPosts(),
    preferredSlugs: posts,
    currentSlug,
    categories,
  });
  if (!related.length) return null;

  return (
    <div className="mt-12 border-t border-black/20 pt-8">
      <h3 className="mb-6 font-pixel text-3xl leading-none tracking-[-0.05em] text-black">{heading}</h3>
      <div className="grid gap-4 md:grid-cols-3">
        {related.map((post) => {
          const image = post.heroImage?.card || post.heroImage?.src;
          return (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group flex flex-col gap-3 border border-black bg-[#090909] p-4 text-[#eceae3] transition-colors hover:bg-[#f4d44d] hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
            >
              {image ? (
                <div className="relative aspect-video overflow-hidden border border-black">
                  <Image src={image} alt="" fill sizes="(min-width: 768px) 240px, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />
                </div>
              ) : null}
              <span className="font-pixel text-xl leading-[1.05] tracking-[-0.04em]">{post.title}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
