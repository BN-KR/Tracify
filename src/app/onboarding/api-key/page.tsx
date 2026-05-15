import { ApiKeyStep } from "@/components/onboarding/api-key-step";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";

export default function OnboardingApiKeyPage() {
  return (
    <OnboardingShell currentStep="api-key">
      <ApiKeyStep />
    </OnboardingShell>
  );
}
