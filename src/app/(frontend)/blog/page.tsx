import { CategoryPills } from "@/components/blog/category-pills";
import { NewsletterCta } from "@/components/blog/newsletter-cta";
import { Pagination } from "@/components/blog/pagination";
import { getReadingTime } from "@/components/blog/reading-time";
import { FutureBand, FuturePage } from "@/components/marketing/future19-page";
import {
  getCategoryOptions,
  getMedia,
  getMediaUrl,
  getPostDate,
  getPublishedPosts,
  isPayloadConfigured,
} from "@/lib/payload-blog";
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
  const [featured, ...rest] = posts;

  return (
    <FuturePage>
      <header className="border-b border-black">
        <div className="mx-auto max-w-[1240px] border-x border-black">
          <div className="grid min-h-[560px] lg:grid-cols-[150px_1fr_300px]">
            <div className="hidden border-r border-black bg-[#f4d44d] p-5 lg:flex lg:flex-col lg:justify-between">
              <span className="font-mono text-[8px] uppercase tracking-[0.16em]">Field journal</span>
              <span className="origin-bottom-left -rotate-90 whitespace-nowrap font-pixel text-7xl tracking-[-0.07em]">ISSUE 01</span>
            </div>
            <div className="flex flex-col justify-between px-5 py-12 sm:px-8 md:px-10 md:py-16">
              <div className="flex items-center justify-between border-b border-black pb-3 font-mono text-[8px] uppercase tracking-[0.14em]">
                <span>Tracify editorial desk</span>
                <span>{new Date().getFullYear()}</span>
              </div>
              <h1 className="max-w-4xl font-pixel text-[clamp(4.5rem,10vw,9rem)] leading-[0.76] tracking-[-0.08em]">Notes from inside the agent loop.</h1>
              <p className="max-w-2xl border-l-8 border-[#f4d44d] pl-5 text-base leading-7 text-black/58">Engineering reports on traces, evaluations, production failures, and the human decisions around them.</p>
            </div>
            <aside className="grid border-t border-black lg:border-l lg:border-t-0">
              <div className="flex items-center justify-center bg-black p-8 text-white">
                <span className="font-pixel text-[9rem] leading-none tracking-[-0.1em] text-[#f4d44d]">{String(posts.length).padStart(2, "0")}</span>
              </div>
              <div className="flex items-end border-t border-black p-6">
                <p className="font-mono text-[9px] uppercase leading-5 tracking-[0.13em] text-black/50">Published field notes<br />in the current view</p>
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
            <p className="font-mono text-[9px] uppercase tracking-[0.13em] text-black/45">All field notes</p>
          )}
        </div>
      </FutureBand>

      <FutureBand label="Editorial signal board">
        {!isPayloadConfigured() || !posts.length ? (
          <div className="border-x border-black bg-[#f4d44d] p-10">
            <p className="max-w-xl font-pixel text-5xl leading-[0.9] tracking-[-0.06em]">
              {isPayloadConfigured()
                ? "The next field note is being prepared."
                : "Connect Payload to open the publishing desk."}
            </p>
          </div>
        ) : null}

        {featured ? (
          <div className="grid border-x border-black lg:grid-cols-[1.3fr_0.7fr]">
            <article className="min-h-[520px] border-black lg:border-r">
              <Link href={`/blog/${featured.slug}`} className="group flex h-full flex-col">
                {getMediaUrl(featured.heroImage, "hero") ? (
                  <div className="relative min-h-64 flex-1 overflow-hidden border-b border-black bg-black">
                    <Image
                      src={getMediaUrl(featured.heroImage, "hero")!}
                      alt={getMedia(featured.heroImage)?.alt || featured.title}
                      fill
                      sizes="(min-width: 1024px) 65vw, 100vw"
                      className="object-cover grayscale transition duration-500 group-hover:grayscale-0"
                    />
                  </div>
                ) : (
                  <div className="min-h-64 flex-1 border-b border-black bg-black p-8">
                    <span className="font-pixel text-[clamp(5rem,13vw,10rem)] leading-none text-[#f4d44d]">01</span>
                  </div>
                )}
                <div className="bg-[#f4d44d] p-6 md:p-8">
                  <div className="flex flex-wrap gap-3 font-mono text-[8px] uppercase tracking-[0.13em]">
                    <time dateTime={getPostDate(featured)}>{formatDate(getPostDate(featured))}</time>
                    <span>/</span>
                    <span>{getReadingTime(featured.content)} min read</span>
                  </div>
                  <h2 className="mt-5 max-w-3xl font-pixel text-5xl leading-[0.88] tracking-[-0.06em] md:text-7xl">{featured.title}</h2>
                  <p className="mt-5 max-w-2xl text-sm leading-6 text-black/60">{featured.excerpt}</p>
                </div>
              </Link>
            </article>

            <div className="grid sm:grid-cols-2 lg:grid-cols-1">
              {rest.map((post, index) => (
                <article
                  key={post.id}
                  className={`min-h-64 border-t border-black first:border-t-0 sm:odd:border-r lg:border-r-0 ${index % 3 === 1 ? "bg-black text-white" : "bg-white/35"}`}
                >
                  <Link href={`/blog/${post.slug}`} className="group flex h-full flex-col justify-between p-6">
                    <div className="flex justify-between font-mono text-[8px] uppercase tracking-[0.13em] opacity-45">
                      <time dateTime={getPostDate(post)}>{formatDate(getPostDate(post))}</time>
                      <span>{String(index + 2).padStart(2, "0")}</span>
                    </div>
                    <div className="mt-16">
                      <h2 className="font-pixel text-4xl leading-[0.92] tracking-[-0.05em]">{post.title}</h2>
                      <p className="mt-4 line-clamp-2 text-sm leading-6 opacity-55">{post.excerpt}</p>
                      <span className="mt-5 inline-block font-mono text-[8px] uppercase tracking-[0.12em] group-hover:text-[#d1af18]">Read note ↗</span>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        ) : null}

        {posts.length ? (
          <div className="border-x border-t border-black p-5">
            <Pagination hasOlder={false} hasNewer={false} category={category} />
          </div>
        ) : null}
      </FutureBand>

      <FutureBand tone="ink" label="Monthly dispatch">
        <div className="px-5 py-10 md:px-10"><NewsletterCta /></div>
      </FutureBand>
    </FuturePage>
  );
}
