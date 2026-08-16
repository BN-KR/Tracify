import { CategoryPills } from "@/components/blog/category-pills";
import { Pagination } from "@/components/blog/pagination";
import { getReadingTime } from "@/components/blog/reading-time";
import { FutureBand, FuturePage } from "@/components/marketing/future19-page";
import { getCategoryOptions, getPostDate, getPublishedPosts } from "@/lib/markdoc-blog";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Blog",
  description: "Engineering insights, agent patterns, and production AI from the Tracify team.",
  alternates: { canonical: "/blog" },
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const [posts, categoryOptions] = await Promise.all([
    getPublishedPosts(category),
    getCategoryOptions(),
  ]);
  const allCategories = categoryOptions.map((option) => option.value);

  return (
    <FuturePage>
      <header className="border-b border-black">
        <div className="mx-auto max-w-[1240px] border-x border-black">
          <div className="grid lg:grid-cols-[96px_1fr_260px]">
            <div className="hidden border-r border-black bg-[#f4d44d] p-5 lg:flex lg:flex-col lg:justify-between">
              <span className="font-mono text-[8px] uppercase tracking-[0.16em]">Field journal</span>
              <span className="origin-bottom-left -rotate-90 whitespace-nowrap font-pixel text-5xl tracking-[-0.06em]">ISSUE 01</span>
            </div>
            <div className="flex flex-col justify-between gap-12 px-5 py-12 sm:px-8 md:px-10 md:py-16">
              <div className="flex items-center justify-between border-b border-black pb-3 font-mono text-[8px] uppercase tracking-[0.14em]">
                <span>Tracify editorial desk</span>
                <span>{new Date().getFullYear()}</span>
              </div>
              <h1 className="max-w-3xl font-pixel text-[clamp(3rem,6vw,5.5rem)] leading-[0.88] tracking-[-0.055em]">Notes from inside the agent loop.</h1>
              <p className="max-w-2xl border-l-8 border-[#f4d44d] pl-5 text-base leading-7 text-black/58">Engineering reports on traces, evaluations, production failures, and the human decisions around them.</p>
            </div>
            <aside className="grid border-t border-black lg:border-l lg:border-t-0">
              <div className="flex items-center justify-center bg-black p-8 text-white">
                <span className="font-pixel text-[9rem] leading-none tracking-[-0.1em] text-[#f4d44d]">{String(posts.length).padStart(2, "0")}</span>
              </div>
              <div className="flex items-end border-t border-black p-6">
                <p className="font-mono text-[9px] uppercase leading-5 tracking-[0.13em] text-black/60">Published field notes<br />in the current view</p>
              </div>
            </aside>
          </div>
        </div>
      </header>

      <FutureBand label="Filter the record">
        <div className="border-x border-black px-5 py-5">
          {allCategories.length ? (
            <CategoryPills categories={allCategories} active={category} />
          ) : (
            <p className="font-mono text-[9px] uppercase tracking-[0.13em] text-black/60">All field notes</p>
          )}
        </div>
      </FutureBand>

      <FutureBand label="Editorial signal board">
        {!posts.length ? (
          <div className="border-x border-black bg-[#f4d44d] p-10">
            <p className="max-w-xl font-pixel text-5xl leading-[0.9] tracking-[-0.06em]">The next field note is being prepared.</p>
          </div>
        ) : (
          <div className="grid gap-px border-x border-black bg-black md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => {
              const isLead = index === 0;

              return (
                <article key={post.id} className={`${isLead ? "lg:col-span-2" : ""} min-w-0 bg-[#eceae3]`}>
                  <Link href={`/blog/${post.slug}`} className="group flex h-full flex-col">
                    {post.heroImage ? (
                      <div className={`relative overflow-hidden border-b border-black bg-black ${isLead ? "aspect-[16/7]" : "aspect-[16/10]"}`}>
                        <Image
                          src={post.heroImage.card || post.heroImage.src}
                          alt={post.heroImage.alt || post.title}
                          fill
                          sizes={isLead ? "(min-width: 1024px) 66vw, (min-width: 768px) 100vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"}
                          className="object-cover grayscale transition duration-500 group-hover:scale-[1.02] group-hover:grayscale-0"
                        />
                      </div>
                    ) : (
                      <div className={`${isLead ? "aspect-[16/7]" : "aspect-[16/10]"} flex items-end bg-black p-6 text-[#f4d44d]`}>
                        <span className="font-pixel text-6xl leading-none">{String(index + 1).padStart(2, "0")}</span>
                      </div>
                    )}

                    <div className={`flex flex-1 flex-col ${isLead ? "bg-[#f4d44d] p-6 md:p-8" : "p-6"}`}>
                      <div className="flex items-center justify-between gap-4 font-mono text-[8px] uppercase tracking-[0.13em] text-black/60">
                        <time dateTime={getPostDate(post)}>{formatDate(getPostDate(post))}</time>
                        <span>{getReadingTime(post.plainText)} min</span>
                      </div>
                      <h2 className={`mt-5 line-clamp-3 font-pixel leading-[0.92] tracking-[-0.05em] ${isLead ? "max-w-3xl text-4xl md:text-5xl" : "text-3xl"}`}>
                        {post.title}
                      </h2>
                      <p className="mt-4 line-clamp-3 text-sm leading-6 text-black/70">{post.excerpt}</p>
                      <span className="mt-auto pt-6 font-mono text-[8px] uppercase tracking-[0.12em] group-hover:underline group-hover:underline-offset-4">Read field note ↗</span>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        )}

        {posts.length ? (
          <div className="border-x border-t border-black p-5">
            <Pagination hasOlder={false} hasNewer={false} category={category} />
          </div>
        ) : null}
      </FutureBand>
    </FuturePage>
  );
}
