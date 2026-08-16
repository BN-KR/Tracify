import Link from "next/link";

import { OnboardingHeader } from "@/components/onboarding/onboarding-shell";

export function SuccessStep({
  projectId,
  runId,
}: {
  projectId: string;
  runId: string;
}) {
  return (
    <div>
      <OnboardingHeader
        title="First span received."
        description="Your run is live. Click to inspect every step."
      />
      <div className="mb-6 border border-black/15 bg-[#f3f2ed] p-4 text-sm">
        <div className="mb-2 text-[#10B981]">received</div>
        <div className="text-black/55">runId</div>
        <div className="break-all text-black/70">{runId}</div>
      </div>
      <Link
        href={`/dashboard/${projectId}/runs/${runId}`}
        className="inline-flex h-10 items-center border border-black bg-black px-4 font-mono text-[13px] text-white transition-colors hover:bg-[#CCCCCC]"
      >
        Open trace
      </Link>
    </div>
  );
}
