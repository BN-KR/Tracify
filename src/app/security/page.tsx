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
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-yellow-300/40">
      <main className="max-w-3xl mx-auto px-6 pt-32 pb-24">
        <div className="mb-12">
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#666666] mb-4">
            Platform / Security
          </div>
          <h1 className="text-4xl md:text-5xl font-mono tracking-tight text-white">
            Security
          </h1>
          <p className="mt-4 text-zinc-500 font-mono text-sm">
            How we protect your data and infrastructure.
          </p>
        </div>

        <div className="prose prose-invert max-w-none space-y-12 font-mono text-sm text-zinc-400 leading-relaxed">
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
                Each project's telemetry is fully isolated — no cross-project
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
