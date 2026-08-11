import { client, urlFor } from "@/lib/sanity/client";
import { postsQuery, postsByCategoryQuery, allCategoriesQuery } from "@/lib/sanity/queries";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getReadingTime } from "@/components/blog/reading-time";
import { CategoryPills } from "@/components/blog/category-pills";
import { Pagination } from "@/components/blog/pagination";
import { NewsletterCta } from "@/components/blog/newsletter-cta";
import { FutureBand, FutureMasthead, FuturePage } from "@/components/marketing/future19-page";

export const revalidate = 60;
export const metadata: Metadata = { title: "Blog", description: "Engineering insights, agent patterns, and production AI from the Tracify team.", alternates: { canonical: "/blog" } };

interface Post { _id: string; title: string; slug: string; date: string; excerpt: string; author: string; categories: string[]; coverImage: { alt?: string } | null; body: unknown[]; }
async function getPosts(category?: string): Promise<Post[]> { if (!client) return []; return client.fetch(category ? postsByCategoryQuery : postsQuery, category ? { category } : {}).catch(() => []); }
async function getAllCategories(): Promise<string[]> { if (!client) return []; const cats: string[] = await client.fetch(allCategoriesQuery).catch(() => []); return [...new Set(cats)].sort(); }
function formatDate(date: string) { return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }); }

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const [posts, allCategories] = await Promise.all([getPosts(category), getAllCategories()]);
  const [featured, ...rest] = posts;
  return <FuturePage>
    <FutureMasthead eyebrow="Journal / Field notes" title={<>Notes from inside the agent loop.</>} description="Engineering reports on traces, evaluations, production failures, and the human decisions around them." index="J01" aside={<div><p className="font-mono text-[9px] uppercase tracking-[0.13em] text-white/45">Publishing signal</p><p className="mt-5 font-pixel text-5xl leading-none tracking-[-0.06em] text-[#f4d44d]">{String(posts.length).padStart(2, "0")}</p><p className="mt-2 font-mono text-[8px] uppercase tracking-[0.13em] text-white/45">notes in view</p></div>} />
    <FutureBand label="Filter the record"><div className="border-x border-black px-5 py-5">{allCategories.length ? <CategoryPills categories={allCategories} active={category} /> : <p className="font-mono text-[9px] uppercase tracking-[0.13em] text-black/45">All field notes</p>}</div></FutureBand>
    <FutureBand label="Editorial signal board">
      {!client || !posts.length ? <div className="border-x border-black bg-[#f4d44d] p-10"><p className="max-w-xl font-pixel text-5xl leading-[0.9] tracking-[-0.06em]">{client ? "The next field note is being prepared." : "Connect Sanity to open the publishing desk."}</p></div> : null}
      {featured ? <div className="grid border-x border-black lg:grid-cols-[1.3fr_0.7fr]">
        <article className="min-h-[520px] border-black lg:border-r"><Link href={`/blog/${featured.slug}`} className="group flex h-full flex-col">
          {featured.coverImage ? <div className="relative min-h-64 flex-1 overflow-hidden border-b border-black bg-black"><Image src={urlFor(featured.coverImage)?.width(1200).height(700).url() || ""} alt={featured.coverImage.alt || featured.title} fill sizes="(min-width: 1024px) 65vw, 100vw" className="object-cover grayscale transition duration-500 group-hover:grayscale-0" /></div> : <div className="min-h-64 flex-1 border-b border-black bg-black p-8"><span className="font-pixel text-[clamp(5rem,13vw,10rem)] leading-none text-[#f4d44d]">01</span></div>}
          <div className="bg-[#f4d44d] p-6 md:p-8"><div className="flex flex-wrap gap-3 font-mono text-[8px] uppercase tracking-[0.13em]"><time dateTime={featured.date}>{formatDate(featured.date)}</time><span>/</span><span>{getReadingTime(featured.body)} min read</span></div><h2 className="mt-5 max-w-3xl font-pixel text-5xl leading-[0.88] tracking-[-0.06em] md:text-7xl">{featured.title}</h2>{featured.excerpt ? <p className="mt-5 max-w-2xl text-sm leading-6 text-black/60">{featured.excerpt}</p> : null}</div>
        </Link></article>
        <div className="grid sm:grid-cols-2 lg:grid-cols-1">{rest.map((post, index) => <article key={post._id} className={`min-h-64 border-t border-black first:border-t-0 sm:odd:border-r lg:border-r-0 ${index % 3 === 1 ? "bg-black text-white" : "bg-white/35"}`}><Link href={`/blog/${post.slug}`} className="group flex h-full flex-col justify-between p-6"><div className="flex justify-between font-mono text-[8px] uppercase tracking-[0.13em] opacity-45"><time dateTime={post.date}>{formatDate(post.date)}</time><span>0{index + 2}</span></div><div className="mt-16"><h2 className="font-pixel text-4xl leading-[0.92] tracking-[-0.05em]">{post.title}</h2><p className="mt-4 line-clamp-2 text-sm leading-6 opacity-55">{post.excerpt}</p><span className="mt-5 inline-block font-mono text-[8px] uppercase tracking-[0.12em] group-hover:text-[#d1af18]">Read note ↗</span></div></Link></article>)}</div>
      </div> : null}
      {posts.length ? <div className="border-x border-t border-black p-5"><Pagination hasOlder={false} hasNewer={false} category={category} /></div> : null}
    </FutureBand>
    <FutureBand tone="ink" label="Monthly dispatch"><div className="px-5 py-10 md:px-10"><NewsletterCta /></div></FutureBand>
  </FuturePage>;
}
