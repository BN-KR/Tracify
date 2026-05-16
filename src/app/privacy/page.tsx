import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-white selection:text-black">
      <Navbar />
      
      <main className="max-w-3xl mx-auto px-6 pt-32 pb-24">
        <div className="mb-12">
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#666666] mb-4">
            Legal / Privacy
          </div>
          <h1 className="text-4xl md:text-5xl font-mono tracking-tight text-white">
            Privacy Policy
          </h1>
          <p className="mt-4 text-zinc-500 font-mono text-sm">
            Last Updated: May 16, 2026
          </p>
        </div>

        <div className="prose prose-invert max-w-none space-y-12 font-mono text-sm text-zinc-400 leading-relaxed">
          <section>
            <h2 className="text-white text-lg uppercase tracking-widest mb-4">1. Overview</h2>
            <p>
              5to1r ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our agent observability platform and services.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg uppercase tracking-widest mb-4">2. Data Collection</h2>
            <p>
              We collect information that you provide directly to us, such as when you create an account, as well as technical data generated through your use of the platform. This includes:
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li>Account information (name, email, organization).</li>
              <li>Telemetry data sent via our SDK (spans, tool calls, LLM logs).</li>
              <li>Usage data (IP address, browser type, platform interaction).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white text-lg uppercase tracking-widest mb-4">3. Use of Information</h2>
            <p>
              We use the collected data to provide, maintain, and improve our services, including:
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li>Processing and visualizing agent telemetry.</li>
              <li>Providing cost and performance analytics.</li>
              <li>Sending system alerts and notifications.</li>
              <li>Protecting against fraudulent or illegal activity.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white text-lg uppercase tracking-widest mb-4">4. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your data. All telemetry data is encrypted in transit and at rest. Access to your data is strictly limited to authorized personnel and automated systems necessary to provide the service.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg uppercase tracking-widest mb-4">5. Contact</h2>
            <p>
              If you have questions about this policy, please contact us at <Link href="mailto:privacy@5to1r.com" className="text-white underline underline-offset-4 decoration-zinc-700 hover:decoration-white transition-colors">privacy@5to1r.com</Link>.
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
