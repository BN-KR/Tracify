import {
  onboardingSteps,
  type OnboardingStepId,
} from "@/components/onboarding/onboarding-progress";
import { OnboardingEscapeLink } from "@/components/onboarding/onboarding-escape-link";
import { OnboardingBackButton } from "@/components/onboarding/onboarding-back-button";
import { Suspense } from "react";
import Link from "next/link";
import { DitherField } from "@/components/auth/dither-field";
import { StepArtwork } from "@/components/onboarding/step-artwork";
import { BrandLogo } from "@/components/brand-logo";

const stepPresentation = {
  project: { code: "01", label: "Name your project", note: "One project per agent or product. Every run, tool call and cost lands in it." },
  "api-key": { code: "02", label: "Grab your key", note: "Your agent uses this key to talk to Tracify. It is shown once, so save it now." },
  install: { code: "03", label: "Add the SDK", note: "A few lines of code. Pick the setup that matches how you build." },
  waiting: { code: "04", label: "Send a first run", note: "Run your agent once. This page lights up the moment Tracify hears it." },
  success: { code: "05", label: "You're live", note: "Your first run arrived. Open it and see every step as a map." },
} satisfies Record<OnboardingStepId, { code: string; label: string; note: string }>;

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
    <main className="relative isolate min-h-svh bg-[#dcd9ce] font-mono text-black">
      <DitherField className="opacity-10" />
      <Suspense fallback={null}>
        <OnboardingEscapeLink currentStep={currentStep} />
      </Suspense>
      <div className="mx-auto flex min-h-svh w-full max-w-[1100px] flex-col px-5 pb-12 pt-12 sm:px-8">
        <header className="flex flex-wrap items-start justify-between gap-x-8 gap-y-5">
          <Link href="/" aria-label="Tracify home"><BrandLogo className="text-black" /></Link>
          <PixelStepper activeIndex={activeIndex} />
        </header>
        <div className="mt-10 flex flex-1 flex-col items-center justify-center gap-8 xl:flex-row xl:items-center">
          <div className="w-full max-w-[680px]">
            <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-black/60">Step {activeIndex + 1} of {onboardingSteps.length} · about 2 minutes total</p>
            <div className="dark-card border border-black bg-[#090909] text-[#eceae3] shadow-[0_32px_64px_-32px_rgba(9,9,9,0.7)]">
              <div className="h-[3px] bg-[#f4d44d]" />
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-white/50 md:px-9">
                <span>{presentation.label}</span>
                <span>{presentation.code} / 05</span>
              </div>
              <div className="p-6 md:p-9">
                <OnboardingBackButton currentStep={currentStep} />
                {children}
              </div>
            </div>
          </div>
          <div className="hidden w-[340px] shrink-0 xl:block"><StepArtwork step={currentStep} /></div>
        </div>
      </div>
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
