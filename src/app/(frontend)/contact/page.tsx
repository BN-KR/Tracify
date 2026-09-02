import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Mail, MessagesSquare, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Book an Agent Failure Fit Call or talk to Tracify about agent observability, security, and deployment.",
  alternates: { canonical: "/contact" },
};

const fitCallSubject = "Agent Failure Fit Call";
const fitCallBody = `Hi Tracify,

I would like to book a 20-minute Agent Failure Fit Call.

Agent use case:
Failure symptom:
Framework or stack:
Sanitized staging evidence available:
Preferred times and timezone:`;

const fitCallHref = `mailto:hello@tracify.tech?subject=${encodeURIComponent(fitCallSubject)}&body=${encodeURIComponent(fitCallBody)}`;

const routes = [
  {
    title: "Agent Failure Fit Call",
    body: "A free 20-minute qualification call. Bring the symptom and your stack; we will decide whether Tracify can investigate it, what sanitized evidence is required, and whether the paid review fits. The call does not include written findings, regression cases, or a release recommendation.",
    icon: Mail,
    href: fitCallHref,
    action: "Book the fit call",
  },
  {
    title: "Enterprise",
    body: "Architecture, security, procurement, and rollout planning.",
    icon: MessagesSquare,
    href: `mailto:hello@tracify.tech?subject=${encodeURIComponent("Tracify Enterprise inquiry")}`,
    action: "Email enterprise",
  },
  {
    title: "Security",
    body: "Responsible disclosure and data-handling questions.",
    icon: ShieldCheck,
    href: `mailto:security@tracify.tech?subject=${encodeURIComponent("Tracify Security inquiry")}`,
    action: "Email security",
  },
] as const;

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#eceae3] pt-[54px] text-black">
      <header className="border-b border-black">
        <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="p-6 sm:p-8 md:p-10 md:py-16 lg:border-r lg:border-black">
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-black/50">
              One failure / one decision / five business days
            </p>
            <h1 className="mt-10 max-w-5xl font-pixel text-[clamp(3.5rem,8vw,8rem)] leading-[0.8] tracking-[-0.08em]">
              Bring the messy agent.
            </h1>
            <p className="mt-8 max-w-2xl text-base leading-7 text-black/65">
              Start with a free 20-minute fit call. We will qualify one real
              failure and the sanitized staging evidence needed to investigate
              it—without turning the call into a free diagnosis.
            </p>
            <a
              href={fitCallHref}
              className="mt-8 inline-flex min-h-12 items-center gap-3 border border-black bg-black px-5 font-mono text-[9px] uppercase tracking-[0.13em] text-white transition-colors hover:bg-[#f4d44d] hover:text-black"
            >
              Book an Agent Failure Fit Call
              <ArrowUpRight className="size-4" />
            </a>
          </div>
          <aside className="border-t border-black bg-[#f4d44d] p-6 lg:border-t-0 lg:p-8">
            <p className="font-mono text-[9px] uppercase tracking-[0.15em]">
              Bring this context
            </p>
            <ol className="mt-12 divide-y divide-black border-y border-black">
              {[
                "The incorrect agent behavior",
                "The customer or engineering consequence",
                "Runtime and framework",
                "Sanitized staging evidence available",
              ].map((item, index) => (
                <li
                  key={item}
                  className="grid min-h-16 grid-cols-[44px_1fr] items-center text-sm"
                >
                  <span className="font-mono text-[8px] opacity-40">
                    0{index + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </header>

      <section className="border-b border-black">
        <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[300px_1fr]">
          <aside className="border-black bg-black p-6 text-white lg:border-r lg:p-8">
            <div className="sticky top-[86px]">
              <Mail
                className="size-9 text-[#f4d44d]"
                strokeWidth={1.2}
              />
              <p className="mt-16 font-pixel text-5xl leading-[0.9] tracking-[-0.06em]">
                Choose the channel that owns the answer.
              </p>
              <p className="mt-6 text-sm leading-6 text-white/55">
                No form maze. Each route opens a direct email with the right
                context.
              </p>
            </div>
          </aside>
          <div>
            {routes.map((route, index) => {
              const Icon = route.icon;
              return (
                <a
                  key={route.title}
                  href={route.href}
                  className="group grid min-h-52 border-b border-black p-6 last:border-b-0 hover:bg-[#f4d44d] sm:grid-cols-[80px_1fr_auto] sm:items-center sm:gap-6 md:p-9"
                >
                  <span className="font-pixel text-5xl text-black/18">
                    0{index + 1}
                  </span>
                  <span>
                    <Icon className="mb-5 size-6" strokeWidth={1.25} />
                    <strong className="font-pixel text-5xl tracking-[-0.06em]">
                      {route.title}
                    </strong>
                    <span className="mt-3 block max-w-xl text-sm leading-6 text-black/58">
                      {route.body}
                    </span>
                  </span>
                  <span className="mt-6 flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.12em] sm:mt-0">
                    {route.action}
                    <ArrowUpRight className="size-4" />
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-black bg-[#d9d5ca]">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-5 py-12 md:flex-row md:items-center md:justify-between md:px-10">
          <p className="font-pixel text-5xl leading-[0.9] tracking-[-0.06em]">
            Prefer to inspect before we talk?
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/demo"
              className="flex min-h-12 items-center border border-black bg-black px-5 font-mono text-[9px] uppercase tracking-[0.13em] text-white"
            >
              Open demo
            </Link>
            <Link
              href="/security"
              className="flex min-h-12 items-center border border-black px-5 font-mono text-[9px] uppercase tracking-[0.13em]"
            >
              Review security
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
