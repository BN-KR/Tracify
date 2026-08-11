import { redirect } from "next/navigation";

import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { SuccessStep } from "@/components/onboarding/success-step";

export default async function OnboardingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string; runId?: string }>;
}) {
  const { projectId, runId } = await searchParams;
  if (!projectId || !runId) redirect("/onboarding/waiting");

  return (
    <OnboardingShell currentStep="success">
      <SuccessStep projectId={projectId} runId={runId} />
    </OnboardingShell>
  );
}
