export type DigestSpan = { parentSpanId?: string; input?: string; output?: string; errorMessage?: string; errorType?: string; modelId?: string; costUsd?: number; latencyMs?: number; isStreamChunk?: boolean };
export type TraceDigest = { input: string; output: string; error: string; model: string; steps: number; costUsd: number; latencyMs: number };
export type QueueItem = { _id: string; status: "queued" | "in_review" | "completed"; assignee?: string; createdAt: number; completedAt?: number; label?: string };

const MAX_SHOWN = 6000;
const clip = (value: string) => (value.length > MAX_SHOWN ? `${value.slice(0, MAX_SHOWN)}\n… (cut, ${value.length - MAX_SHOWN} more characters)` : value);

/** Boils a trace's steps down to what a reviewer needs: what came in, what went out, whether it failed. */
export function traceDigest(spans: DigestSpan[]): TraceDigest {
  const steps = spans.filter((span) => !span.isStreamChunk);
  const root = steps.find((span) => !span.parentSpanId) ?? steps[0];
  const withInput = steps.find((span) => span.input?.trim());
  const withOutput = [...steps].reverse().find((span) => span.output?.trim());
  const failed = steps.find((span) => span.errorMessage?.trim() || span.errorType?.trim());
  return {
    input: clip((root?.input?.trim() ? root.input : withInput?.input ?? "").trim()),
    output: clip((root?.output?.trim() ? root.output : withOutput?.output ?? "").trim()),
    error: (failed?.errorMessage?.trim() || failed?.errorType?.trim() || "").slice(0, 600),
    model: steps.find((span) => span.modelId)?.modelId ?? "",
    steps: steps.length,
    costUsd: steps.reduce((sum, span) => sum + (span.costUsd ?? 0), 0),
    latencyMs: root?.latencyMs ?? Math.max(0, ...steps.map((span) => span.latencyMs ?? 0)),
  };
}

/** The item a reviewer is in the middle of: the oldest one still assigned to them. */
export function currentFor<T extends QueueItem>(items: T[], me: string | undefined): T | null {
  if (!me) return null;
  return items.filter((item) => item.status === "in_review" && item.assignee === me).sort((a, b) => a.createdAt - b.createdAt)[0] ?? null;
}

export function queueStats(items: Array<Pick<QueueItem, "status" | "assignee" | "completedAt">>, me: string | undefined, now: number) {
  const done = items.filter((item) => item.status === "completed");
  const dayAgo = now - 86_400_000;
  return {
    waiting: items.filter((item) => item.status === "queued").length,
    mine: items.filter((item) => item.status === "in_review" && item.assignee === me).length,
    others: items.filter((item) => item.status === "in_review" && item.assignee !== me).length,
    done: done.length,
    doneToday: done.filter((item) => (item.completedAt ?? 0) >= dayAgo).length,
    total: items.length,
    share: items.length ? done.length / items.length : 0,
  };
}
