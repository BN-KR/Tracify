import {
  OnboardingProgress,
  type OnboardingStepId,
} from "@/components/onboarding/onboarding-progress";
import { OnboardingEscapeLink } from "@/components/onboarding/onboarding-escape-link";

export function OnboardingShell({
  currentStep,
  children,
}: {
  currentStep: OnboardingStepId;
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-svh bg-[#0A0A0A] px-4 py-8 font-mono text-[#CCCCCC]">
      <OnboardingEscapeLink currentStep={currentStep} />
      <div className="mx-auto flex min-h-[calc(100svh-64px)] w-full max-w-[720px] flex-col justify-center">
        <div className="mb-4 font-pixel text-lg text-white">5to1r</div>
        <section className="border border-[#2A2A2A] bg-[#111111]">
          <OnboardingProgress currentStep={currentStep} />
          <div className="p-6 md:p-8">{children}</div>
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
    <div className="mb-8">
      <h1 className="font-mono text-2xl normal-case tracking-normal text-white">
        {title}
      </h1>
      <p className="mt-3 max-w-xl font-sans text-sm leading-6 text-[#999999]">
        {description}
      </p>
    </div>
  );
}
