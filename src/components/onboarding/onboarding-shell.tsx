import {
  OnboardingProgress,
  type OnboardingStepId,
} from "@/components/onboarding/onboarding-progress";
import { OnboardingEscapeLink } from "@/components/onboarding/onboarding-escape-link";
import { OnboardingBackButton } from "@/components/onboarding/onboarding-back-button";
import { Suspense } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { CheckCircle2, KeyRound, PackagePlus, Radio, SquareDashedMousePointer } from "lucide-react";

const stepPresentation = {
  project: { code: "01", label: "Name the record", note: "Create the project boundary that will own traces, members, and operating policy.", icon: SquareDashedMousePointer, tone: "bg-[#f4d44d] text-black" },
  "api-key": { code: "02", label: "Issue the key", note: "Generate a scoped credential. The plaintext is shown once and never stored.", icon: KeyRound, tone: "bg-[#eceae3] text-black" },
  install: { code: "03", label: "Wire the runtime", note: "Choose the SDK path that matches the agent you are instrumenting.", icon: PackagePlus, tone: "bg-[#d9d5ca] text-black" },
  waiting: { code: "04", label: "Listen for evidence", note: "The ingest channel is open. Run the instrumented agent to send its first span.", icon: Radio, tone: "bg-white text-black" },
  success: { code: "05", label: "Open the trace", note: "The first span arrived. The operating record is ready for inspection.", icon: CheckCircle2, tone: "bg-[#f4d44d] text-black" },
} satisfies Record<OnboardingStepId, { code: string; label: string; note: string; icon: typeof KeyRound; tone: string }>;

export function OnboardingShell({
  currentStep,
  children,
}: {
  currentStep: OnboardingStepId;
  children: React.ReactNode;
}) {
  const presentation = stepPresentation[currentStep];
  const StepIcon = presentation.icon;
  return (
    <main className="relative min-h-svh bg-[#eceae3] font-mono text-black">
      <Suspense fallback={null}>
        <OnboardingEscapeLink currentStep={currentStep} />
      </Suspense>
      <header className="flex h-[54px] items-center border-b border-black px-5 md:px-8"><BrandLogo /></header>
      <div className="mx-auto grid min-h-[calc(100svh-54px)] max-w-[1440px] lg:grid-cols-[minmax(320px,0.72fr)_minmax(0,1.28fr)]">
        <aside className={`flex min-h-80 flex-col justify-between border-b border-black p-6 sm:p-8 md:p-10 lg:min-h-0 lg:border-b-0 lg:border-r ${presentation.tone}`}>
          <div className="flex items-start justify-between gap-6"><span className="font-pixel text-5xl leading-none tracking-[-0.08em] opacity-20">{presentation.code}</span><StepIcon className="size-9" strokeWidth={1.2} aria-hidden="true" /></div>
          <div className="my-12"><p className="font-mono text-[9px] uppercase tracking-[0.16em] opacity-55">Onboarding / active step</p><h1 className="mt-5 font-pixel text-4xl leading-[0.88] tracking-[-0.065em] md:text-5xl">{presentation.label}</h1><p className="mt-6 max-w-md font-sans text-sm leading-6 opacity-65">{presentation.note}</p></div>
          <OnboardingProgress currentStep={currentStep} />
        </aside>
        <section className="flex items-center px-5 py-10 sm:px-8 md:px-12 md:py-16">
          <div className="w-full max-w-[760px] border border-black bg-white text-black">
            <div className="border-b border-black/15 px-5 py-3 font-mono text-[8px] uppercase tracking-[0.15em] text-black/50">Setup console / {presentation.code}</div>
            <div className="p-6 md:p-8">
            <OnboardingBackButton currentStep={currentStep} />
            {children}
            </div>
          </div>
        </section>
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
      <h2 className="font-pixel text-4xl leading-none tracking-[-0.055em] text-black">
        {title}
      </h2>
      <p className="mt-3 max-w-xl font-sans text-sm leading-6 text-black/60">
        {description}
      </p>
    </div>
  );
}
