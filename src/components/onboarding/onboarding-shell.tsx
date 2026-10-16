import {
  onboardingSteps,
  type OnboardingStepId,
} from "@/components/onboarding/onboarding-progress";
import { OnboardingEscapeLink } from "@/components/onboarding/onboarding-escape-link";
import { OnboardingBackButton } from "@/components/onboarding/onboarding-back-button";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { DitherField } from "@/components/auth/dither-field";
import { StepArtwork } from "@/components/onboarding/step-artwork";
import { BrandLogo } from "@/components/brand-logo";

const stepPresentation = {
  project: { code: "01", label: "Name your project", note: "One project per agent or product. Every run, tool call and cost lands in it.", img: "map-flat" },
  "api-key": { code: "02", label: "Grab your key", note: "Your agent uses this key to talk to Tracify. It is shown once, so save it now.", img: "span-anatomy" },
  install: { code: "03", label: "Add the SDK", note: "A few lines of code. Pick the setup that matches how you build.", img: "logs-wall" },
  waiting: { code: "04", label: "Send a first run", note: "Run your agent once. This page lights up the moment Tracify hears it.", img: "capture-streams" },
  success: { code: "05", label: "You're live", note: "Your first run arrived. Open it and see every step as a map.", img: "horizon-sun" },
} satisfies Record<OnboardingStepId, { code: string; label: string; note: string; img: string }>;

function PixelStepper({ activeIndex }: { activeIndex: number }) {
  return (
    <ol className="flex w-full max-w-md items-stretch gap-1.5" aria-label="Setup progress">
      {onboardingSteps.map((step, i) => {
        const done = i < activeIndex;
        const active = i === activeIndex;
        return (
          <li key={step.id} className="min-w-0 flex-1" aria-current={active ? "step" : undefined}>
            <div className={`h-2 ${done ? "bg-black" : active ? "animate-mono-pulse bg-[#f4d44d] outline outline-1 outline-black" : "bg-black/15"}`} />
            <p className={`mt-1.5 hidden truncate font-mono text-[9px] uppercase tracking-[0.1em] sm:block ${active ? "text-black" : done ? "text-black/60" : "text-black/30"}`}>{step.label}</p>
          </li>
        );
      })}
    </ol>
  );
}

export function OnboardingShell({
  currentStep,
  children,
}: {
  currentStep: OnboardingStepId;
  children: React.ReactNode;
}) {
  const presentation = stepPresentation[currentStep];
  const activeIndex = onboardingSteps.findIndex((step) => step.id === currentStep);
  return (
    <main className="relative grid min-h-svh bg-[#f4f2ec] font-mono text-black lg:grid-cols-[minmax(0,1.1fr)_minmax(380px,0.9fr)]">
      <section className="relative isolate flex flex-col overflow-hidden px-5 pb-12 pt-12 sm:px-8 md:px-12 lg:min-h-svh">
      <Suspense fallback={null}>
        <OnboardingEscapeLink currentStep={currentStep} />
      </Suspense>
        <DitherField className="opacity-30" />
        <header className="flex flex-wrap items-start justify-between gap-x-8 gap-y-5">
          <Link href="/" aria-label="Tracify home"><BrandLogo className="text-black" /></Link>
          <PixelStepper activeIndex={activeIndex} />
        </header>
        <div className="mx-auto mt-10 flex w-full max-w-[680px] flex-1 flex-col justify-center lg:mt-0">
          <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-black/55">Step {activeIndex + 1} of {onboardingSteps.length} · about 2 minutes total</p>
          <div className="border border-black/80 bg-white text-black shadow-[0_1px_0_rgba(0,0,0,0.04),0_24px_48px_-24px_rgba(9,9,9,0.35)]">
            <div className="flex items-center justify-between border-b border-black/10 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-black/50 md:px-9">
              <span className="flex items-center gap-2"><span className="size-2 bg-[#f4d44d] outline outline-1 outline-black" aria-hidden="true" />{presentation.label}</span>
              <span>{presentation.code} / 05</span>
            </div>
            <div className="p-6 md:p-9">
              <OnboardingBackButton currentStep={currentStep} />
              {children}
            </div>
          </div>
        </div>
      </section>
      <aside className="relative isolate order-first m-3 flex min-h-[200px] flex-col justify-between overflow-hidden border border-black bg-[#090909] p-6 text-[#eceae3] shadow-[6px_6px_0_#f4d44d] sm:m-4 sm:p-8 md:p-10 lg:order-none lg:m-5 lg:min-h-[calc(100svh-2.5rem)]">
        <Image key={presentation.img} src={`/images/landing/${presentation.img}.png`} alt="" fill priority unoptimized sizes="(min-width:1024px) 40vw, 100vw" className="-z-10 object-cover opacity-30 [image-rendering:pixelated]" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,#090909_8%,rgba(9,9,9,0.65)_55%,rgba(9,9,9,0.3)_100%)]" />
        <div className="flex items-start justify-between gap-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#f4d44d]">{presentation.label}</p>
          <span className="font-pixel text-6xl leading-none tracking-[-0.08em] text-[#f4d44d] lg:text-8xl">{presentation.code}</span>
        </div>
        <div className="mt-6 lg:mt-14">
          <p className="max-w-sm font-sans text-sm leading-6 text-white/70 sm:text-base sm:leading-7">{presentation.note}</p>
          <div className="mt-8 hidden lg:block"><StepArtwork step={currentStep} /></div>
        </div>
      </aside>
    </main>
  );
}

export function OnboardingHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-8 border-b border-black/15 pb-6">
      <h1 className="font-pixel text-[clamp(2rem,5vw,3.25rem)] leading-[0.95] tracking-[-0.06em] text-black">
        {title}
      </h1>
      <p className="mt-4 max-w-xl font-sans text-sm leading-6 text-black/65 sm:text-base sm:leading-7">
        {description}
      </p>
    </div>
  );
}
