import { sandboxWorkspace } from "./sandbox-data";
import type { WorkspaceAdapter, WorkspaceCapability } from "./contracts";

const capabilities = new Set<WorkspaceCapability>([
  "read", "filter", "create", "update", "delete", "annotate", "configure",
]);

/**
 * The root Sandbox adapter exposes the same normalized boundary as live
 * adapters. UI-local reducer state owns mutations; this dispatch method is
 * intentionally side-effect free and exists for capability-aware consumers.
 */
export const sandboxAdapter: WorkspaceAdapter = {
  mode: "sandbox",
  capabilities,
  workspace: sandboxWorkspace,
  async dispatch(action) {
    return {
      ok: true,
      mode: "sandbox",
      message: `Sandbox ${action.type} simulated for ${action.surface}`,
      recordId: action.recordId,
    };
  },
};
