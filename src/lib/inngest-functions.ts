import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

import { getConvexClient } from "@/lib/convex";
import { inngest } from "@/lib/inngest";
import { ingestSpan } from "@/lib/tinybird";

/**
 * Milestone 2 activation pipeline:
 * write the span to Tinybird, then update Convex so onboarding can react.
 */
export const processSpan = inngest.createFunction(
  {
    id: "process-span",
    name: "Process ingested span",
    retries: 3,
    triggers: [{ event: "5to1r/span.received" }],
  },
  async ({ event, step }) => {
    const span = event.data;

    await step.run("write-to-tinybird", async () => {
      await ingestSpan({
        spanId: span.spanId,
        runId: span.runId,
        projectId: span.projectId,
        spanType: span.spanType,
        input: span.input,
        output: span.output,
        latencyMs: span.latencyMs,
        costUsd: span.costUsd,
        modelId: span.modelId,
        toolName: span.toolName,
        parentSpanId: span.parentSpanId,
        metadata: span.metadata,
        createdAt: span.createdAt,
      });
    });

    await step.run("upsert-convex-run", async () => {
      const convex = getConvexClient();
      await convex.mutation(api.agentRuns.upsertRunFromSpan, {
        runId: span.runId,
        projectId: span.projectDocId as Id<"projects">,
        costUsd: span.costUsd,
        spanType: span.spanType,
        createdAt: span.createdAt,
        modelId: span.modelId || undefined,
      });
    });

    return { ok: true, spanId: span.spanId };
  },
);
