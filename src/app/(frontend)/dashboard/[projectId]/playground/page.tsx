import { PromptPlayground } from "@/components/dashboard/prompt-playground";
import { ImproveLifecycleNav } from "@/components/dashboard/improve-lifecycle-nav";
import { CapturedWorkspace } from "@/features/dashboard-workspace/components/captured-workspace";
import { createLiveWorkspace } from "@/features/dashboard-workspace/live-workspace";

type PlaygroundSearchParams = { model?: string | string[]; compare?: string | string[] };

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PlaygroundPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<PlaygroundSearchParams>;
}) {
  const { projectId } = await params;
  const query = await searchParams;
  const workspace = createLiveWorkspace({ id: projectId, name: "Project", organizationName: "Workspace" });
  return (
    <CapturedWorkspace workspace={workspace} childrenOnly segments={["playground"]}>
      <ImproveLifecycleNav projectId={projectId} active="compare" />
      <PromptPlayground
        projectId={projectId}
        initialModel={firstParam(query.model)}
        initialComparisonModel={firstParam(query.compare)}
      />
    </CapturedWorkspace>
  );
}
