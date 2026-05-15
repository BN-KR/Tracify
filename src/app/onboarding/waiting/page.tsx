import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { WaitingStep } from "@/components/onboarding/waiting-step";

export default function OnboardingWaitingPage() {
  return (
    <OnboardingShell currentStep="waiting">
      <WaitingStep />
    </OnboardingShell>
  );
}
