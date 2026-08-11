import React from "react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "Tracify privacy policy and information about how we handle data.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#eceae3] pt-[54px] text-black selection:bg-yellow-300/40">
      <main className="mx-auto max-w-[1240px] border-x border-black">
        <header className="grid border-b border-black md:grid-cols-[1fr_280px]">
        <div className="px-6 py-14 md:px-10 md:py-20">
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#666666] mb-4">
            Legal / Privacy
          </div>
          <h1 className="font-pixel text-6xl leading-none tracking-[-0.06em] md:text-8xl">
            Privacy Policy
          </h1>
          <p className="mt-5 font-mono text-[9px] uppercase tracking-[0.13em] text-black/45">
            Last Updated: May 16, 2026
          </p>
        </div><div className="flex items-end bg-black p-7 text-white"><p className="border-l-4 border-[#f4d44d] pl-4 font-mono text-[9px] uppercase leading-5 tracking-[0.13em] text-white/55">Policy record<br/>Readable by humans</p></div></header>

        <div className="max-w-3xl px-6 py-12 text-[15px] leading-7 text-black/65 md:px-10 [&_a]:!text-black [&_h2]:!text-black [&_h2]:mb-4 [&_h2]:mt-14 [&_h2]:border-t [&_h2]:border-black [&_h2]:pt-5 [&_h2]:font-pixel [&_h2]:text-4xl [&_h2]:tracking-[-0.05em] [&_li]:my-2 [&_ul]:list-square [&_ul]:pl-5">
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
