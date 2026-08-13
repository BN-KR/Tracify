import React from "react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tracify privacy and data handling policy",
  description: "Read how Tracify collects, uses, stores, protects, and deletes account information and AI agent telemetry across the service.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#eceae3] pt-[54px] text-black selection:bg-yellow-300/40">
      <main className="mx-auto max-w-[1240px] border-x border-black">
        <header className="grid border-b border-black md:grid-cols-[220px_1fr]">
          <div className="flex min-h-44 items-center justify-center bg-black text-[#f4d44d] md:min-h-[400px]"><span className="font-pixel text-[7rem] leading-none" aria-hidden="true">◉</span></div>
          <div className="flex flex-col justify-between border-t border-black px-6 py-10 md:border-l md:border-t-0 md:px-10 md:py-12"><div className="flex justify-between font-mono text-[8px] uppercase tracking-[0.15em] text-black/55"><span>Data handling record</span><span>16.05.26</span></div><h1 className="my-8 max-w-4xl font-pixel text-[clamp(3rem,6vw,5.5rem)] leading-[0.88] tracking-[-0.055em]">What enters. What stays. What leaves.</h1><p className="max-w-xl text-base leading-7 text-black/68">The privacy policy, arranged around the lifecycle of information rather than a wall of legal prose.</p></div>
        </header>

        <div className="grid md:grid-cols-[220px_1fr]"><aside className="hidden border-r border-black bg-[#f4d44d] p-6 md:block"><div className="sticky top-24 font-mono text-[9px] uppercase leading-8 tracking-[0.13em]"><p>01 / Collection</p><p>02 / Use</p><p>03 / Protection</p><p>04 / Control</p></div></aside><div className="max-w-3xl px-6 py-12 text-[15px] leading-7 text-black/65 md:px-10 [&_a]:!text-black [&_h2]:!text-black [&_h2]:mb-4 [&_h2]:mt-14 [&_h2]:border-l-8 [&_h2]:border-[#f4d44d] [&_h2]:pl-5 [&_h2]:font-pixel [&_h2]:text-4xl [&_h2]:tracking-[-0.05em] [&_li]:my-2 [&_ul]:list-square [&_ul]:pl-5">
          <section>
            <h2 className="text-white text-lg uppercase tracking-widest mb-4">
              1. Overview
            </h2>
            <p>
              Tracify (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting your
              privacy. This Privacy Policy explains how we collect, use, and
              safeguard your information when you use our agent observability
              platform and services.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg uppercase tracking-widest mb-4">
              2. Data Collection
            </h2>
            <p>
              We collect information that you provide directly to us, such as
              when you create an account, as well as technical data generated
              through your use of the platform. This includes:
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li>Account information (name, email, organization).</li>
              <li>
                Telemetry data sent via our SDK (spans, tool calls, LLM logs).
              </li>
              <li>
                Usage data (IP address, browser type, platform interaction).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-white text-lg uppercase tracking-widest mb-4">
              3. Use of Information
            </h2>
            <p>
              We use the collected data to provide, maintain, and improve our
              services, including:
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li>Processing and visualizing agent telemetry.</li>
              <li>Providing cost and performance analytics.</li>
              <li>Sending system alerts and notifications.</li>
              <li>Protecting against fraudulent or illegal activity.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white text-lg uppercase tracking-widest mb-4">
              4. Data Security
            </h2>
            <p>
              We implement industry-standard security measures to protect your
              data. All telemetry data is encrypted in transit and at rest.
              Access to your data is strictly limited to authorized personnel
              and automated systems necessary to provide the service.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg uppercase tracking-widest mb-4">
              5. Contact
            </h2>
            <p>
              If you have questions about this policy, please contact us at{" "}
              <Link
                href="mailto:privacy@tracify.tech"
                className="text-white underline underline-offset-4 decoration-zinc-700 hover:decoration-white transition-colors"
              >
                privacy@tracify.tech
              </Link>
              .
            </p>
          </section>
        </div></div>

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
