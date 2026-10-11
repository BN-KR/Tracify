import { Suspense } from "react";
import { SandboxWorkspace } from "../../components/sandbox-workspace";
import { WorkspaceLoadingState } from "../../features/dashboard-workspace/captured-workspace";

export default function PlaygroundPage() {
  return <Suspense fallback={<WorkspaceLoadingState />}><SandboxWorkspace /></Suspense>;
}
