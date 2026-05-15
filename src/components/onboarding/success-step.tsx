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
      <div className="mb-6 border border-[#2A2A2A] bg-[#0A0A0A] p-4 text-sm">
        <div className="mb-2 text-[#10B981]">received</div>
        <div className="text-[#666666]">runId</div>
        <div className="break-all text-[#CCCCCC]">{runId}</div>
      </div>
      <Link
        href={`/dashboard/${projectId}/runs/${runId}`}
        className="inline-flex h-10 items-center border border-white bg-white px-4 font-mono text-[13px] text-black transition-colors hover:bg-[#CCCCCC]"
      >
        Open trace
      </Link>
    </div>
  );
}
