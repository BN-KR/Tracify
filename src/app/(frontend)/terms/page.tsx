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
        <header className="relative overflow-hidden border-b border-black bg-black px-6 py-10 text-white md:px-10 md:py-12"><div className="absolute -right-6 -top-10 rotate-6 border-2 border-[#f4d44d] px-6 py-3 font-mono text-sm uppercase tracking-[0.15em] text-[#f4d44d] opacity-70">Agreement</div><p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#f4d44d]">Terms / effective 16.05.26</p><h1 className="mt-12 max-w-4xl font-pixel text-[clamp(3rem,6vw,5.5rem)] leading-[0.88] tracking-[-0.055em]">The rules of the working relationship.</h1><div className="mt-10 flex flex-wrap gap-x-10 gap-y-3 border-t border-white/20 pt-5 font-mono text-[8px] uppercase tracking-[0.13em] text-white/60"><span>Use</span><span>Limits</span><span>Billing</span><span>Responsibility</span><span>Jurisdiction</span></div></header>

        <div className="grid text-[15px] leading-7 text-black/65 md:grid-cols-2 [&_a]:!text-black [&_h2]:!text-black [&_h2]:mb-6 [&_h2]:font-pixel [&_h2]:text-4xl [&_h2]:tracking-[-0.05em] [&_li]:my-2 [&_section]:min-h-80 [&_section]:border-b [&_section]:border-black [&_section]:p-6 [&_section:nth-child(2)]:bg-[#f4d44d] [&_section:nth-child(3)]:bg-white/50 [&_section:nth-child(4)]:bg-black [&_section:nth-child(4)]:text-white/65 [&_section:nth-child(4)_h2]:!text-white [&_ul]:list-square [&_ul]:pl-5 md:[&_section]:border-r md:[&_section]:p-9">
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
