import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t border-zinc-900 bg-black pt-24 pb-12">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="flex flex-col items-start justify-between gap-12 md:flex-row md:items-center">
          <div className="flex flex-col gap-4">
            <Link href="/" className="font-pixel text-lg text-white">
              tracify
            </Link>
            <p className="max-w-xs font-mono text-[11px] uppercase tracking-widest text-zinc-500">
              Agent observability infrastructure for serious builders.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-12 gap-y-6">
            <div className="flex flex-col gap-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white">Product</span>
              <div className="flex flex-col gap-2">
                <Link href="/pricing" className="font-mono text-[11px] uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">Pricing</Link>
                <Link href="/product/trace-viewer" className="font-mono text-[11px] uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">Products</Link>
                <Link href="/roadmap" className="font-mono text-[11px] uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">Roadmap</Link>
                <Link href="/blog" className="font-mono text-[11px] uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">Blog</Link>
                <Link href="/docs" className="font-mono text-[11px] uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">Documentation</Link>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white">Legal</span>
              <div className="flex flex-col gap-2">
                <Link href="/security" className="font-mono text-[11px] uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">Security</Link>
                <Link href="/privacy" className="font-mono text-[11px] uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="font-mono text-[11px] uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">Terms of Service</Link>
                <Link href="/status" className="font-mono text-[11px] uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">System Status</Link>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white">Developers</span>
              <div className="flex flex-col gap-2">
                <Link href="/integrations" className="font-mono text-[11px] uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">Integrations</Link>
                <Link href="/contact" className="font-mono text-[11px] uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">Contact</Link>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white">Contact</span>
              <div className="flex flex-col gap-2">
                <Link href="https://x.com/tracify" target="_blank" className="font-mono text-[11px] uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">X / Twitter</Link>
                <Link href="mailto:hello@tracify.tech" className="font-mono text-[11px] uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">Email</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-24 flex flex-col items-start justify-between gap-6 border-t border-zinc-900 pt-8 md:flex-row md:items-center">
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-zinc-600">
            © {new Date().getFullYear()} tracify. Built for the next trillion spans.
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-600">Systems Operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
