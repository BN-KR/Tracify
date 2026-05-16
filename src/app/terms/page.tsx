import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-white selection:text-black">
      <Navbar />
      
      <main className="max-w-3xl mx-auto px-6 pt-32 pb-24">
        <div className="mb-12">
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#666666] mb-4">
            Legal / Terms
          </div>
          <h1 className="text-4xl md:text-5xl font-mono tracking-tight text-white">
            Terms of Service
          </h1>
          <p className="mt-4 text-zinc-500 font-mono text-sm">
            Last Updated: May 16, 2026
          </p>
        </div>

        <div className="prose prose-invert max-w-none space-y-12 font-mono text-sm text-zinc-400 leading-relaxed">
          <section>
            <h2 className="text-white text-lg uppercase tracking-widest mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the 5to1r platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg uppercase tracking-widest mb-4">2. Use License</h2>
            <p>
              Permission is granted to temporarily use the platform for personal or commercial agent observability purposes. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li>Attempt to decompile or reverse engineer any software contained on the platform.</li>
              <li>Remove any copyright or other proprietary notations from the materials.</li>
              <li>Use the platform in any way that violates applicable law or regulation.</li>
              <li>Exceed the usage limits defined by your current plan tier.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white text-lg uppercase tracking-widest mb-4">3. Disclaimer</h2>
            <p>
              The materials on 5to1r are provided on an 'as is' basis. 5to1r makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg uppercase tracking-widest mb-4">4. Limitations</h2>
            <p>
              In no event shall 5to1r or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the platform, even if 5to1r has been notified orally or in writing of the possibility of such damage.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg uppercase tracking-widest mb-4">5. Governing Law</h2>
            <p>
              These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which 5to1r operates and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
            </p>
          </section>
        </div>

        <div className="mt-24 pt-8 border-t border-zinc-900">
          <Link href="/" className="text-white font-mono text-xs uppercase tracking-widest hover:opacity-70 transition-opacity">
            ← Back to home
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
