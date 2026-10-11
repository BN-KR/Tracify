import { sandboxWorkspace } from "./sandbox-data";
import type {
  DashboardWorkspace,
  WorkspaceAction,
  WorkspaceAdapter,
  WorkspaceCapability,
  WorkspaceRecord,
  WorkspaceSurface,
} from "./contracts";

export type SandboxCollectionKey = Exclude<WorkspaceSurface, "home" | "settings">;

export type SandboxActionResult = { ok: boolean; mode: "sandbox"; message: string; recordId?: string };

// Every sandbox mutation flows through this single reducer contract. The
// renderer never calls a network or a database; the `reset` action restores
// the seeded reference data, so all simulated work stays inside the
// in-memory sandbox boundary.
export type SandboxAction =
  | { type: "create"; surface: SandboxCollectionKey; record: WorkspaceRecord }
  | { type: "update"; surface: SandboxCollectionKey; recordId: string; patch: Partial<WorkspaceRecord>; operation?: "save-version" | "toggle" | "state" }
  | { type: "delete"; surface: SandboxCollectionKey; recordId: string }
  | { type: "annotate"; sessionId: string; record: WorkspaceRecord }
  | { type: "review"; annotationId: string; label: string; score?: number; notes: string }
  | { type: "claim" }
  | { type: "configure"; target: "project-settings"; name: string }
  | { type: "configure"; target: "dataset-append"; sessionId: string; datasetId: string }
  | { type: "reset" };

const capabilities = new Set<WorkspaceCapability>([
  "read", "filter", "create", "update", "delete", "annotate", "configure",
]);

function isCollectionSurface(surface: WorkspaceSurface): surface is SandboxCollectionKey {
  return surface !== "home" && surface !== "settings";
}

function updateCollection(
  state: DashboardWorkspace,
  key: SandboxCollectionKey,
  records: WorkspaceRecord[],
): DashboardWorkspace {
  return { ...state, collections: { ...state.collections, [key]: { ...state.collections[key], records } } };
}

// Pure reducer: the same state plus the same action always produce the same
// next state. All record identity comes from the action, never from time.
export function sandboxWorkspaceReducer(state: DashboardWorkspace, action: SandboxAction): DashboardWorkspace {
  switch (action.type) {
    case "create":
      return updateCollection(state, action.surface, [action.record, ...state.collections[action.surface].records]);
    case "update":
      return updateCollection(
        state,
        action.surface,
        state.collections[action.surface].records.map((record) => (record.id === action.recordId ? { ...record, ...action.patch } : record)),
      );
    case "delete":
      return updateCollection(state, action.surface, state.collections[action.surface].records.filter((record) => record.id !== action.recordId));
    case "annotate":
      return updateCollection(state, "annotation-queues", [action.record, ...state.collections["annotation-queues"].records]);
    case "review":
      return updateCollection(
        state,
        "annotation-queues",
        state.collections["annotation-queues"].records.map((record) =>
          record.id === action.annotationId
            ? { ...record, status: action.label || "reviewed", score: action.score == null ? record.score : String(action.score), output: action.notes }
            : record,
        ),
      );
    case "claim": {
      const claimed = state.collections["annotation-queues"].records[0];
      if (!claimed) return state;
      return updateCollection(
        state,
        "annotation-queues",
        state.collections["annotation-queues"].records.map((record) => (record.id === claimed.id ? { ...record, status: "claimed" } : record)),
      );
    }
    case "configure":
      if (action.target === "project-settings") return { ...state, project: { ...state.project, name: action.name } };
      return state;
    case "reset":
      return createSandboxWorkspace();
    default:
      return state;
  }
}

// Deterministic status copy for every simulated mutation. It reads the
// reduced state (never the clock) so identical sessions render identical text.
export function describeSandboxAction(state: DashboardWorkspace, action: SandboxAction): SandboxActionResult {
  switch (action.type) {
    case "create":
      return { ok: true, mode: "sandbox", message: `Sandbox simulated creation of ${action.record.name}`, recordId: action.record.id };
    case "update": {
      if (action.operation === "save-version") return { ok: true, mode: "sandbox", message: "Sandbox simulated prompt version save", recordId: action.recordId };
      if (action.operation === "state") return { ok: true, mode: "sandbox", message: `Sandbox simulated setting alert ${action.recordId} to ${action.patch.status ?? "updated"}`, recordId: action.recordId };
      if (action.operation === "toggle") return { ok: true, mode: "sandbox", message: `Sandbox simulated evaluator status update for ${action.recordId}`, recordId: action.recordId };
      return { ok: true, mode: "sandbox", message: `Sandbox simulated update of ${action.recordId}`, recordId: action.recordId };
    }
    case "delete":
      return { ok: true, mode: "sandbox", message: `Sandbox simulated deletion of ${action.recordId}`, recordId: action.recordId };
    case "annotate":
      return { ok: true, mode: "sandbox", message: "Sandbox simulated adding this session to annotation", recordId: action.sessionId };
    case "review":
      return { ok: true, mode: "sandbox", message: "Sandbox simulated submitting this review", recordId: action.annotationId };
    case "claim": {
      const claimed = state.collections["annotation-queues"].records.find((record) => record.status === "claimed");
      return { ok: true, mode: "sandbox", message: claimed ? `Sandbox simulated claiming the next trace (${claimed.id})` : "Sandbox simulated claiming the next trace" };
    }
    case "configure":
      if (action.target === "project-settings") return { ok: true, mode: "sandbox", message: `Sandbox simulated settings save for ${action.name || "project"}` };
      return { ok: true, mode: "sandbox", message: "Sandbox simulated adding this session to the dataset", recordId: action.sessionId };
    case "reset":
      return { ok: true, mode: "sandbox", message: "Sandbox workspace reset to the seeded reference data" };
    default:
      return { ok: true, mode: "sandbox", message: "Sandbox simulated the requested action" };
  }
}

// Bridge for the shared WorkspaceAction contract so callers that only know
// generic actions still land in the same reducer-backed store.
export function toSandboxAction(action: WorkspaceAction): SandboxAction {
  const surface = action.surface;
  const payload = action.payload ?? {};
  const text = (key: string, fallback = "") => (typeof payload[key] === "string" ? (payload[key] as string) : fallback);
  const flag = (key: string) => (typeof payload[key] === "boolean" ? (payload[key] as boolean) : undefined);
  if (action.type === "create" && isCollectionSurface(surface)) {
    const input = text("input");
    const output = text("output");
    return {
      type: "create",
      surface,
      record: {
        id: action.recordId ?? `${surface}-simulated`,
        name: text("name", action.recordId ?? surface),
        status: text("status", "draft"),
        environment: text("environment", "default"),
        timestamp: text("timestamp", "just now"),
        input: input || undefined,
        output: output || undefined,
      },
    };
  }
  if (action.type === "update" && isCollectionSurface(surface)) {
    const active = flag("active");
    const status = text("status") || (active === undefined ? "" : active ? "active" : "inactive");
    const operation = surface === "alerts" ? ("state" as const) : surface === "prompts" ? ("save-version" as const) : ("toggle" as const);
    return { type: "update", surface, recordId: action.recordId ?? "", patch: status ? { status } : {}, operation };
  }
  if (action.type === "delete" && isCollectionSurface(surface)) {
    return { type: "delete", surface, recordId: action.recordId ?? "" };
  }
  if (action.type === "annotate") {
    const sessionId = action.recordId ?? text("sessionId");
    return {
      type: "annotate",
      sessionId,
      record: { id: `annotation-${sessionId}`, name: sessionId, status: "needs-review", environment: "default", timestamp: "just now", sessionId },
    };
  }
  return { type: "configure", target: "project-settings", name: text("name") };
}

// Fresh deterministic seed from the captured reference data.
export function createSandboxWorkspace(): DashboardWorkspace {
  return structuredClone(sandboxWorkspace);
}

let sandboxStore: DashboardWorkspace = createSandboxWorkspace();

export type SandboxAdapter = WorkspaceAdapter & {
  read(): DashboardWorkspace;
  apply(action: SandboxAction): SandboxActionResult;
  reset(): SandboxActionResult;
  can(capability: WorkspaceCapability): boolean;
};

export const sandboxAdapter: SandboxAdapter = {
  mode: "sandbox",
  capabilities,
  workspace: sandboxStore,
  can(capability) {
    return capabilities.has(capability);
  },
  read() {
    return sandboxStore;
  },
  apply(action) {
    const next = sandboxWorkspaceReducer(sandboxStore, action);
    sandboxStore = next;
    this.workspace = next;
    return describeSandboxAction(next, action);
  },
  // Explicit sandbox boundary reset: drops every simulated mutation and
  // restores the seeded reference workspace. Nothing is persisted anywhere.
  reset() {
    return this.apply({ type: "reset" });
  },
  async dispatch(action) {
    return this.apply(toSandboxAction(action));
  },
};
