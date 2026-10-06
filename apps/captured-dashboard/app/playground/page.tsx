import { Suspense } from "react";
import { SandboxWorkspace } from "../../components/sandbox-workspace";

export default function PlaygroundPage() {
  return <Suspense fallback={null}><SandboxWorkspace /></Suspense>;
}
