import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/marketing/footer";
import { Navbar } from "@/components/marketing/navbar";

export const metadata: Metadata = {
  title: "Contact | tracify",
  description: "Talk to the tracify team about observability, runtime control, and enterprise deployment.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-32">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">Contact</p>
        <h1 className="mt-5 font-pixel text-4xl leading-tight md:text-6xl">Bring your agent operations into focus.</h1>
        <p className="mt-6 max-w-2xl font-sans text-lg leading-relaxed text-zinc-400">For enterprise deployment, design-partner access, migration support, or product questions, send us your team, stack, and the workflow you need to make reliable.</p>
        <div className="mt-12 border border-zinc-800 bg-[#0a0a0a] p-8">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">Email</div>
          <a href="mailto:hello@tracify.tech" className="mt-3 inline-block font-mono text-xl text-white underline underline-offset-8 decoration-zinc-600 hover:decoration-white">hello@tracify.tech</a>
          <p className="mt-6 font-mono text-sm leading-relaxed text-zinc-500">Security issues should go to <Link href="mailto:security@tracify.tech" className="text-zinc-300 underline underline-offset-4">security@tracify.tech</Link>.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
