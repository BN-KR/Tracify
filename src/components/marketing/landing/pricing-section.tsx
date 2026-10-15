"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { pricingCheckoutHref } from "@/lib/billing-links";

// Plans and prices mirror the /pricing page. Change them there first.
const plans = [
  { name: "Free", monthly: 0, tag: "To get started", spans: "50k", retention: "7 days", members: "1", projects: "1", features: ["Trace viewer", "Cost visibility", "Community support"] },
  { name: "Pro", monthly: 19, tag: "Most popular", spans: "500k", retention: "30 days", members: "5", projects: "3", features: ["Evaluations + datasets", "Prompt versions", "Slack alerts"] },
  { name: "Team", monthly: 39, tag: "For teams", spans: "2m", retention: "90 days", members: "20", projects: "Unlimited", features: ["Release gates", "Collaboration + reviews", "Priority support"] },
] as const;

export function PricingSection() {
  const [annual, setAnnual] = useState(false);
  const reduce = useReducedMotion();
  const interval = annual ? "annual" : "monthly";

  return (
    <div>
      <div className="mt-10 flex w-fit border border-black bg-white p-1 font-mono text-[9px] uppercase tracking-[0.12em] md:self-end">
        <button type="button" onClick={() => setAnnual(false)} aria-pressed={!annual} className={`min-h-11 px-4 ${!annual ? "bg-black text-white" : "hover:bg-[#f4d44d]"}`}>
          Monthly
        </button>
        <button type="button" onClick={() => setAnnual(true)} aria-pressed={annual} className={`min-h-11 px-4 ${annual ? "bg-[#f4d44d]" : "hover:bg-[#f4d44d]"}`}>
          Annual −20%
        </button>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan, i) => {
          const price = annual ? plan.monthly * 0.8 : plan.monthly;
          const featured = plan.name === "Pro";
          return (
            <motion.article
              key={plan.name}
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              whileHover={reduce ? undefined : { y: -6 }}
              className={`flex flex-col border border-black p-6 shadow-[6px_6px_0_#090909] ${featured ? "bg-[#f4d44d]" : "bg-white"}`}
            >
              <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-black/60">{plan.tag}</p>
              <h3 className="mt-3 font-pixel text-5xl leading-none tracking-[-0.065em]">{plan.name}</h3>
              <div className="mt-6 border-y border-black py-4">
                <span className="font-pixel text-5xl tracking-[-0.07em]">${price % 1 ? price.toFixed(2) : price}</span>
                <span className="ml-2 font-mono text-[9px] uppercase text-black/60">/ month</span>
                {annual && plan.monthly > 0 ? <p className="mt-2 font-mono text-[8px] uppercase text-black/60">Billed annually</p> : null}
              </div>
              <ul className="mt-5 grid gap-3 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <Check className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
              <dl className="mt-6 grid gap-2 border-t border-black pt-4 font-mono text-[9px] uppercase tracking-[0.08em]">
                {[["Spans / mo", plan.spans], ["Retention", plan.retention], ["Members", plan.members], ["Projects", plan.projects]].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <dt className="text-black/60">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
              <Link
                href={plan.name === "Free" ? "/sign-up" : pricingCheckoutHref(plan.name.toLowerCase() as "pro" | "team", interval)}
                className="mt-auto flex min-h-12 items-center justify-between border border-black bg-black px-4 font-mono text-[9px] uppercase tracking-[0.12em] text-white hover:bg-white hover:text-black"
                style={{ marginTop: "2rem" }}
              >
                {plan.name === "Free" ? "Start free" : `Choose ${plan.name}`}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </motion.article>
          );
        })}

        <motion.article
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ delay: 0.24, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          whileHover={reduce ? undefined : { y: -6 }}
          className="flex flex-col border border-black bg-black p-6 text-white shadow-[6px_6px_0_#f4d44d]"
        >
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/60">For larger rollouts</p>
          <h3 className="mt-3 font-pixel text-5xl leading-none tracking-[-0.065em]">Enterprise</h3>
          <div className="mt-6 border-y border-white/40 py-4">
            <span className="font-pixel text-5xl tracking-[-0.07em]">Custom</span>
          </div>
          <ul className="mt-5 grid gap-3 text-sm text-white/80">
            {["Unlimited spans, custom retention", "SSO (SAML / OIDC)", "On-prem deployment", "Rollout support"].map((f) => (
              <li key={f} className="flex items-start gap-3">
                <Check className="mt-0.5 size-4 shrink-0 text-[#f4d44d]" aria-hidden="true" />
                {f}
              </li>
            ))}
          </ul>
          <Link
            href="/contact"
            className="mt-auto flex min-h-12 items-center justify-between border border-[#f4d44d] bg-[#f4d44d] px-4 font-mono text-[9px] uppercase tracking-[0.12em] text-black hover:bg-white"
            style={{ marginTop: "2rem" }}
          >
            Talk to us
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </motion.article>
      </div>
      <p className="mt-6 font-mono text-[9px] uppercase tracking-[0.1em] text-black/55">
        Every plan includes the trace viewer. <Link href="/pricing" className="underline underline-offset-4 hover:text-black">Compare every plan →</Link>
      </p>
    </div>
  );
}
