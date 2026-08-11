import { InstallStep } from "@/components/onboarding/install-step";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";

export default function OnboardingInstallPage() {
  return (
    <OnboardingShell currentStep="install">
      <InstallStep />
    </OnboardingShell>
  );
}
