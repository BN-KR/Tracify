import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { ProjectStep } from "@/components/onboarding/project-step";

export default function OnboardingProjectPage() {
  return (
    <OnboardingShell currentStep="project">
      <ProjectStep />
    </OnboardingShell>
  );
}
