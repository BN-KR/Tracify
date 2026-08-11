import React from "react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of service",
  description: "Tracify terms of service.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#eceae3] pt-[54px] text-black selection:bg-yellow-300/40">
      <main className="mx-auto max-w-[1240px] border-x border-black">
        <header className="grid border-b border-black md:grid-cols-[1fr_280px]">
        <div className="px-6 py-14 md:px-10 md:py-20">
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#666666] mb-4">
            Legal / Terms
          </div>
          <h1 className="font-pixel text-6xl leading-none tracking-[-0.06em] md:text-8xl">
            Terms of Service
          </h1>
          <p className="mt-5 font-mono text-[9px] uppercase tracking-[0.13em] text-black/45">
            Last Updated: May 16, 2026
          </p>
        </div><div className="flex items-end bg-[#f4d44d] p-7"><p className="font-mono text-[9px] uppercase leading-5 tracking-[0.13em]">Contract record<br/>Plain-language surface</p></div></header>

        <div className="max-w-3xl px-6 py-12 text-[15px] leading-7 text-black/65 md:px-10 [&_a]:!text-black [&_h2]:!text-black [&_h2]:mb-4 [&_h2]:mt-14 [&_h2]:border-t [&_h2]:border-black [&_h2]:pt-5 [&_h2]:font-pixel [&_h2]:text-4xl [&_h2]:tracking-[-0.05em] [&_li]:my-2 [&_ul]:list-square [&_ul]:pl-5">
          <section>
            <h2 className="text-white text-lg uppercase tracking-widest mb-4">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using the Tracify platform, you agree to be bound
              by these Terms of Service and all applicable laws and regulations.
              If you do not agree with any of these terms, you are prohibited
              from using or accessing this site.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg uppercase tracking-widest mb-4">
              2. Use License
            </h2>
            <p>
              Permission is granted to temporarily use the platform for personal
              or commercial agent observability purposes. This is the grant of a
              license, not a transfer of title, and under this license you may
              not:
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li>
                Attempt to decompile or reverse engineer any software contained
                on the platform.
              </li>
              <li>
                Remove any copyright or other proprietary notations from the
                materials.
              </li>
              <li>
                Use the platform in any way that violates applicable law or
                regulation.
              </li>
              <li>
                Exceed the usage limits defined by your current plan tier.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-white text-lg uppercase tracking-widest mb-4">
              3. Disclaimer
            </h2>
            <p>
              The materials on Tracify are provided on an &apos;as is&apos; basis. Tracify
              makes no warranties, expressed or implied, and hereby disclaims
              and negates all other warranties including, without limitation,
              implied warranties or conditions of merchantability, fitness for a
              particular purpose, or non-infringement of intellectual property
              or other violation of rights.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg uppercase tracking-widest mb-4">
              4. Limitations
            </h2>
            <p>
              In no event shall Tracify or its suppliers be liable for any
              damages (including, without limitation, damages for loss of data
              or profit, or due to business interruption) arising out of the use
              or inability to use the platform, even if Tracify has been
              notified orally or in writing of the possibility of such damage.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg uppercase tracking-widest mb-4">
              5. Governing Law
            </h2>
            <p>
              These terms and conditions are governed by and construed in
              accordance with the laws of the jurisdiction in which Tracify
              operates and you irrevocably submit to the exclusive jurisdiction
              of the courts in that State or location.
            </p>
          </section>
        </div>

        <div className="mt-24 pt-8 border-t border-zinc-900">
          <Link
            href="/"
            className="text-white font-mono text-xs uppercase tracking-widest hover:opacity-70 transition-opacity"
          >
            ← Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}
