import React from "react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security",
  description: "Learn how Tracify protects AI agent telemetry with encryption, project isolation, access controls, and incident response practices.",
  alternates: { canonical: "/security" },
};

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-[#eceae3] pt-[54px] text-black selection:bg-yellow-300/40">
      <main className="mx-auto max-w-[1240px] border-x border-black">
        <header className="grid border-b border-black bg-[#f4d44d] md:grid-cols-[1fr_320px]"><div className="flex min-h-[400px] flex-col justify-between px-6 py-10 md:px-10 md:py-12"><div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.15em]"><span>Security control room</span><span>Trust / 01</span></div><h1 className="my-8 max-w-3xl font-pixel text-[clamp(3rem,6vw,5.5rem)] leading-[0.88] tracking-[-0.055em]">Trust is a system.</h1><p className="max-w-xl text-base leading-7 text-black/68">How data is isolated, encrypted, governed, and investigated across the Tracify operating record.</p></div><div className="relative flex min-h-64 items-center justify-center overflow-hidden border-t border-black bg-black md:border-l md:border-t-0"><div className="absolute size-60 rounded-full border border-white/20"/><div className="absolute size-44 rounded-full border border-white/20"/><div className="absolute size-28 rounded-full border border-[#f4d44d]"/><div className="z-10 flex size-20 rotate-45 items-center justify-center bg-[#f4d44d]"><span className="-rotate-45 font-mono text-[8px] uppercase tracking-[0.12em]">Verified<br/>layers</span></div></div></header>

        <div className="grid gap-0 text-sm leading-6 text-black/62 md:grid-cols-2 [&_a]:!text-black [&_code]:!text-black [&_h2]:!text-black [&_h2]:mb-4 [&_h2]:font-pixel [&_h2]:text-4xl [&_h2]:tracking-[-0.05em] [&_li]:my-2 [&_section]:border-b [&_section]:border-black [&_section]:p-6 [&_ul]:list-square [&_ul]:pl-5 md:[&_section]:p-9 md:[&_section:nth-child(odd)]:border-r">
          <section>
            <h2 className="text-white text-lg uppercase tracking-widest mb-4">
              Encryption
            </h2>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li>All data is encrypted in transit using TLS 1.3.</li>
              <li>Data at rest is encrypted using AES-256.</li>
              <li>
                API keys are hashed with SHA-256 before storage — raw keys are
                never persisted.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-white text-lg uppercase tracking-widest mb-4">
              Data Isolation
            </h2>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li>
                Each project&apos;s telemetry is fully isolated — no cross-project
                data leakage.
              </li>
              <li>
                Spans are scoped to a project ID derived from a hashed API key.
              </li>
              <li>
                Runtime cost counters are per-project with atomic enforcement.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-white text-lg uppercase tracking-widest mb-4">
              Access Control
            </h2>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li>
                Authentication is handled by Better Auth with encrypted OAuth tokens, CSRF protection, and persistent rate limiting.
              </li>
              <li>
                API keys use the prefix{" "}
                <code className="text-white">tracify_sk_live_</code> and can be
                rotated at any time.
              </li>
              <li>
                Team-scoped role-based access control (RBAC) is enforced at the
                Convex layer.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-white text-lg uppercase tracking-widest mb-4">
              Runtime Enforcement
            </h2>
            <p>
              The orchestration layer operates with a strict observe-first
              policy. All retry, fallback, and cost ceiling rules are evaluated
              in <code className="text-white">observe</code> mode by default.
              Switching to <code className="text-white">enforce</code> mode is a
              deliberate action that can be reverted instantly via the kill
              switch.
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li>
                Cost ceilings are enforced server-side — the SDK cannot bypass
                them.
              </li>
              <li>
                Latency abort uses network-level AbortController (TypeScript)
                and CancellationToken (Python).
              </li>
              <li>
                Fail-open semantics ensure monitoring never blocks your
                production traffic.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-white text-lg uppercase tracking-widest mb-4">
              Infrastructure
            </h2>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li>
                Convex provides the database and real-time infrastructure with
                built-in DDoS protection.
              </li>
              <li>
                Tinybird handles analytics ingestion with column-level
                encryption.
              </li>
              <li>
                Inngest provides durable, retryable event processing with
                exactly-once semantics.
              </li>
              <li>
                Redis is used for ephemeral rate limiting and cost counter
                caching.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-white text-lg uppercase tracking-widest mb-4">
              Incident Response
            </h2>
            <p>
              In the event of a security incident, affected users will be
              notified within 72 hours via email. We maintain an internal
              incident response playbook and conduct quarterly security reviews.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg uppercase tracking-widest mb-4">
              Reporting Vulnerabilities
            </h2>
            <p>
              If you discover a security vulnerability, please report it to{" "}
              <Link
                href="mailto:security@tracify.tech"
                className="text-white underline underline-offset-4 decoration-zinc-700 hover:decoration-white transition-colors"
              >
                security@tracify.tech
              </Link>
              . We aim to acknowledge all reports within 24 hours.
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
