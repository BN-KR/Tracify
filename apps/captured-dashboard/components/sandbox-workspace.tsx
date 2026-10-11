"use client";

import { useCallback, useState } from "react";
import { CapturedWorkspace } from "../features/dashboard-workspace/captured-workspace";
import { sandboxAdapter, type SandboxAction, type SandboxActionResult } from "../features/dashboard-workspace/sandbox-adapter";
import type { WorkspaceCapability } from "../features/dashboard-workspace/contracts";

// The reducer maps each action to the sandbox capability that governs it.
// The adapter rejects anything outside the declared capability set, and the
// store is module-scoped in memory only: client navigations keep simulated
// mutations, a full reload returns to the seeded reference data, and nothing
// is persisted to storage, cookies, or a backend.
const ACTION_CAPABILITIES: Record<SandboxAction["type"], WorkspaceCapability> = {
  create: "create",
  update: "update",
  delete: "delete",
  annotate: "annotate",
  review: "annotate",
  claim: "annotate",
  configure: "configure",
  reset: "configure",
};

export function SandboxWorkspace({ segments = [] }: { segments?: string[] }) {
  const [workspace, setWorkspace] = useState(() => sandboxAdapter.read());

  const onAction = useCallback(async (action: SandboxAction): Promise<SandboxActionResult> => {
    if (!sandboxAdapter.can(ACTION_CAPABILITIES[action.type])) {
      return { ok: false, mode: "sandbox", message: "Sandbox capability gate refused this simulation" };
    }
    const result = sandboxAdapter.apply(action);
    setWorkspace(sandboxAdapter.read());
    return result;
  }, []);

  return (
    <CapturedWorkspace
      workspace={workspace}
      segments={segments}
      onAction={onAction}
    />
  );
}
