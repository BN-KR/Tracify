import { CategoryPills } from "@/components/blog/category-pills";
import { Pagination } from "@/components/blog/pagination";
import { getReadingTime } from "@/components/blog/reading-time";
import { BlogArchive } from "@/components/blog/blog-archive";
import { Reveal, Ticker } from "@/components/marketing/landing/reveal";
import { PageHeader } from "@/components/marketing/page-header";
import { getCategoryOptions, getPostDate, getPublishedPosts, type BlogPost } from "@/lib/markdoc-blog";
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

const positions = ["0% 0%", "100% 30%", "50% 100%", "20% 60%", "80% 90%", "60% 10%"];

function Visual({ post, index, className }: { post: BlogPost; index: number; className: string }) {
  return (
    post.heroImage ? (
      <div className={`relative overflow-hidden bg-[#090909] ${className}`}>
        <Image
          src={post.heroImage.card || post.heroImage.src}
          alt={post.heroImage.alt || post.title}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover transition duration-700 group-hover:scale-[1.04]"
        />
      </div>
    ) : (
      <div className={`relative overflow-hidden bg-[#090909] ${className}`}>
        <Image
          src="/images/reading/blog.png"
          alt=""
          fill
          unoptimized
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="scale-[1.6] object-cover opacity-90 transition duration-700 [image-rendering:pixelated] group-hover:scale-[1.75]"
          style={{ objectPosition: positions[index % positions.length] }}
        />
        <span className="absolute bottom-4 left-4 bg-[#f4d44d] px-2 py-1 font-pixel text-2xl leading-none text-black">{String(index + 1).padStart(2, "0")}</span>
      </div>
    )
  );
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[] }>;
}) {
  const { category } = await searchParams;
  const selectedCategories = category === undefined ? [] : Array.isArray(category) ? category : [category];
  const [posts, categoryOptions] = await Promise.all([
    getPublishedPosts(selectedCategories),
    getCategoryOptions(),
  ]);
  const allCategories = categoryOptions.map((option) => option.value);

  const [lead, ...others] = posts;
  const rest = others.slice(0, 6);
  const archive = others.slice(6);
  return (
    <main className="min-h-screen bg-[#eceae3] text-black">
      <PageHeader
        eyebrow="The Tracify blog"
        title="Notes from inside the agent loop."
        lede="Engineering reports on traces, evaluations, production failures, and the human decisions around them."
        image="/images/reading/blog.png"
      >
        <span className="border border-white/25 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-white/70">{posts.length} {posts.length === 1 ? "article" : "articles"}</span>
        <Link href="/blog/rss.xml" className="border border-[#f4d44d] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[#f4d44d] transition-colors hover:bg-[#f4d44d] hover:text-black">RSS feed</Link>
      </PageHeader>

      <div className="overflow-hidden border-b border-black bg-[#090909] py-4 text-[#eceae3]">
        <Ticker items={allCategories.length ? allCategories.map((c) => c.replace(/-/g, " ")) : ["traces", "evals", "failures"]} />
      </div>

      <div className="border-b border-black bg-[#eceae3]">
        <div className="mx-auto max-w-[1240px] px-5 py-5 sm:px-8">
          {allCategories.length ? (
            <CategoryPills categories={allCategories} active={selectedCategories} />
          ) : (
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-black/60">All articles</p>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-[1240px] px-5 py-12 sm:px-8 md:py-16">
        {!lead ? (
          <div className="bg-[#f4d44d] p-10">
            <p className="max-w-xl font-pixel text-5xl leading-[0.9] tracking-[-0.06em]">The next article is being written.</p>
          </div>
        ) : (
          <>
            <Reveal>
              <Link href={`/blog/${lead.slug}`} className="group grid border border-black bg-[#090909] text-[#eceae3] lg:grid-cols-[1.25fr_1fr]">
                <Visual post={lead} index={0} className="aspect-[16/10] lg:aspect-auto lg:min-h-[380px]" />
                <div className="flex flex-col justify-between gap-10 p-6 md:p-10">
                  <div>
                    <p className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#f4d44d]">
                      <span className="size-2 bg-[#f4d44d]" aria-hidden="true" />Latest
                    </p>
                    <h2 className="mt-5 text-balance font-pixel text-[clamp(2rem,4vw,3.4rem)] leading-[0.93] tracking-[-0.055em]">{lead.title}</h2>
                    <p className="mt-5 line-clamp-4 text-base leading-7 text-white/65">{lead.excerpt}</p>
                  </div>
                  <div className="flex items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.14em] text-white/55">
                    <span><time dateTime={getPostDate(lead)}>{formatDate(getPostDate(lead))}</time> · {getReadingTime(lead.plainText)} min read</span>
                    <span className="bg-[#f4d44d] px-4 py-2 text-black transition-colors group-hover:bg-white">Read →</span>
                  </div>
                </div>
              </Link>
            </Reveal>

            {rest.length ? (
              <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {rest.map((post, i) => (
                  <Reveal key={post.id} delay={(i % 3) * 0.06}>
                    <Link href={`/blog/${post.slug}`} className="group flex h-full flex-col border border-black bg-[#eceae3] transition-colors hover:bg-[#fff4b5]">
                      <div className="relative">
                        <Visual post={post} index={i + 1} className="aspect-[16/10] border-b border-black" />
                        {post.categories[0] ? <span className="absolute right-3 top-3 bg-[#f4d44d] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-black">{post.categories[0]}</span> : null}
                      </div>
                      <div className="flex flex-1 flex-col p-5 md:p-6">
                        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-black/60">
                          <time dateTime={getPostDate(post)}>{formatDate(getPostDate(post))}</time> · {getReadingTime(post.plainText)} min
                        </p>
                        <h2 className="mt-4 line-clamp-3 text-balance font-pixel text-[1.7rem] leading-[0.96] tracking-[-0.05em]">{post.title}</h2>
                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-black/70">{post.excerpt}</p>
                        <span className="mt-auto pt-6 font-mono text-[10px] uppercase tracking-[0.14em] underline-offset-4 group-hover:underline">Read article →</span>
                      </div>
                    </Link>
                  </Reveal>
                ))}
              </div>
            ) : null}

            {archive.length ? (
              <BlogArchive
                items={archive.map((post) => ({
                  slug: post.slug!,
                  title: post.title,
                  date: getPostDate(post),
                  label: formatDate(getPostDate(post)),
                  minutes: getReadingTime(post.plainText),
                  categories: post.categories,
                }))}
              />
            ) : null}

            <div className="mt-10">
              <Pagination hasOlder={false} hasNewer={false} categories={selectedCategories} />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
