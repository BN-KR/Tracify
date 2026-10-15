import {
  onboardingSteps,
  type OnboardingStepId,
} from "@/components/onboarding/onboarding-progress";
import { OnboardingEscapeLink } from "@/components/onboarding/onboarding-escape-link";
import { OnboardingBackButton } from "@/components/onboarding/onboarding-back-button";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { PixelWaterfall, type WaterfallRow } from "@/components/auth/pixel-waterfall";
import { StepArtwork } from "@/components/onboarding/step-artwork";
import { BrandLogo } from "@/components/brand-logo";

const stepPresentation = {
  project: { code: "01", label: "Name your project", note: "A project holds the traces, teammates and settings for one agent or product.", img: "map-flat" },
  "api-key": { code: "02", label: "Get your key", note: "Your agent uses this key to send runs to Tracify. You will only see it once, so copy it.", img: "span-anatomy" },
  install: { code: "03", label: "Add the SDK", note: "Paste a few lines into your agent. Pick the setup that matches how you build it.", img: "logs-wall" },
  waiting: { code: "04", label: "Send a first run", note: "Run your agent once. This page lights up the moment Tracify hears it.", img: "capture-streams" },
  success: { code: "05", label: "You're live", note: "Your first run arrived. Open it and see every step as a map.", img: "horizon-sun" },
} satisfies Record<OnboardingStepId, { code: string; label: string; note: string; img: string }>;

export function OnboardingShell({
  currentStep,
  children,
}: {
  currentStep: OnboardingStepId;
  children: React.ReactNode;
}) {
  const presentation = stepPresentation[currentStep];
  const activeIndex = onboardingSteps.findIndex((step) => step.id === currentStep);
  const rows: WaterfallRow[] = onboardingSteps.map((step, i) => ({
    label: step.label,
    start: i * 17,
    width: 100 - i * 17 > 34 ? 34 + (i === activeIndex ? 12 : 0) : 100 - i * 17,
    state: i < activeIndex ? "done" : i === activeIndex ? "active" : "idle",
  }));
  return (
    <main className="relative grid min-h-svh bg-[#eceae3] font-mono text-black lg:grid-cols-[minmax(380px,0.9fr)_minmax(0,1.1fr)]">
      <Suspense fallback={null}>
        <OnboardingEscapeLink currentStep={currentStep} />
      </Suspense>
      <aside className="relative isolate flex min-h-[300px] flex-col justify-between overflow-hidden bg-[#090909] p-6 text-[#eceae3] sm:p-8 md:p-10 lg:min-h-svh">
        <Image key={presentation.img} src={`/images/landing/${presentation.img}.png`} alt="" fill priority unoptimized sizes="(min-width:1024px) 45vw, 100vw" className="-z-10 object-cover opacity-50 [image-rendering:pixelated]" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,#090909_10%,rgba(9,9,9,0.6)_60%,rgba(9,9,9,0.3)_100%)]" />
        <div className="flex items-start justify-between gap-6">
          <Link href="/" aria-label="Tracify home"><BrandLogo className="text-[#eceae3]" /></Link>
          <span className="font-pixel text-5xl leading-none tracking-[-0.08em] text-[#f4d44d]">{presentation.code}</span>
        </div>
        <div className="mt-14">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#f4d44d]">Step {activeIndex + 1} of {onboardingSteps.length}</p>
          <h1 className="mt-4 font-pixel text-[clamp(2.4rem,4.6vw,4.4rem)] leading-[0.9] tracking-[-0.065em]">{presentation.label}</h1>
          <p className="mt-5 max-w-md font-sans text-sm leading-6 text-white/65 sm:text-base sm:leading-7">{presentation.note}</p>
          <div className="mt-8 hidden lg:block [@media(max-height:820px)]:hidden"><StepArtwork step={currentStep} /></div>
          <PixelWaterfall rows={rows} className="mt-8 max-w-md" />
        </div>
      </aside>
      <section className="flex items-center px-5 py-10 sm:px-8 md:px-12 md:py-16">
        <div className="mx-auto w-full max-w-[720px] border border-black bg-white text-black shadow-[8px_8px_0_#f4d44d]">
          <div className="border-b border-black/15 px-5 py-3 font-mono text-[9px] uppercase tracking-[0.15em] text-black/50">Setup / {presentation.code} of 05</div>
          <div className="p-6 md:p-8">
            <OnboardingBackButton currentStep={currentStep} />
            {children}
          </div>
        </div>
      </section>
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
      <h2 className="font-pixel text-4xl leading-none tracking-[-0.055em] text-black">
        {title}
      </h2>
      <p className="mt-3 max-w-xl font-sans text-sm leading-6 text-black/60">
        {description}
      </p>
    </div>
  );
}
