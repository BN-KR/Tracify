import { sandboxWorkspace } from "./sandbox-data";
import type { WorkspaceAdapter, WorkspaceCapability } from "./contracts";

const capabilities = new Set<WorkspaceCapability>([
  "read", "filter", "create", "update", "delete", "annotate", "configure",
]);

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
