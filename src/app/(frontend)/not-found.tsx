import Link from "next/link";
import { ArrowLeft, Gauge, SearchX } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-[#eceae3] px-6 py-12 text-black">
      <section className="w-full max-w-3xl border border-black bg-white">
        <div className="border-b border-black px-5 py-3">
          <div className="flex items-center justify-between gap-4 font-mono text-[11px] uppercase tracking-widest text-black/55">
            <span>tracify.error</span>
            <span>404</span>
          </div>
        </div>

        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_220px] lg:p-10">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 border border-black bg-[#f4d44d] px-3 py-2 font-mono text-[11px] uppercase tracking-widest text-black">
              <SearchX className="size-4" />
              route not found
            </div>

            <div>
              <h1 className="font-pixel text-4xl uppercase leading-[1.1] tracking-tighter text-black sm:text-6xl" style={{ fontFamily: "var(--font-pixel)" }}>
                404 - Nothing is tracing here.
              </h1>
              <p className="mt-5 max-w-xl font-mono text-sm leading-6 text-black/60">
                The page you requested does not exist, moved, or belongs to a
                project you cannot access.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "gap-2",
                )}
              >
                <Gauge className="size-4" />
                Go to dashboard
              </Link>
              <Link
                href="/"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "gap-2",
                )}
              >
                <ArrowLeft className="size-4" />
                Back home
              </Link>
            </div>
          </div>

          <div className="border border-black bg-[#050505] p-4 font-mono text-[11px] text-white/55">
            <div className="mb-4 text-[#f4d44d]">trace.check</div>
            <div className="space-y-3">
              <TraceLine label="route" value="missing" />
              <TraceLine label="status" value="not_found" />
              <TraceLine label="retry" value="manual" />
              <TraceLine label="action" value="return" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function TraceLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-t border-white/10 pt-3 first:border-t-0 first:pt-0">
      <span>{label}</span>
      <span className="text-white/85">{value}</span>
    </div>
  );
}
