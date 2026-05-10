import { inngest, type SpanIngestedEvent } from "@/lib/inngest";
import { ingestSpan } from "@/lib/tinybird";
import { getConvexClient } from "@/lib/convex";
import { api } from "../../convex/_generated/api";

/**
 * Inngest function: span/ingested
 *
 * Flow:
 *   1. Write span row to Tinybird
 *   2. Upsert AgentRun summary in Convex (triggers real-time UI update)
 *   3. Check thresholds — emit alert if cost or failure condition met
 */
export const processSpan = inngest.createFunction(
  {
    id: "process-span",
    name: "Process ingested span",
    retries: 3,
    triggers: [{ event: "span/ingested" }],
  },
  async ({ event, step }: { event: { data: SpanIngestedEvent["data"] }; step: any }) => {
    const span = event.data;


    // ── Step 1: Write to Tinybird ──────────────────────────────────────────
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
        createdAt: span.createdAt,
      });
    });

    // ── Step 2: Upsert AgentRun in Convex ─────────────────────────────────
    await step.run("upsert-convex-run", async () => {
      const convex = getConvexClient();
      // Mark as failed if the span is an error type
      const isFailed = span.spanType === "error";
      await convex.mutation(api.agentRuns.upsert, {
        runId: span.runId,
        projectId: span.projectDocId as Parameters<
          typeof convex.mutation
        >[1]["projectId"],
        costUsd: span.costUsd,
        startedAt: span.createdAt,
        status: isFailed ? "failed" : "running",
      });
    });

    // ── Step 3: Threshold alerts ───────────────────────────────────────────
    await step.run("check-alerts", async () => {
      if (span.spanType !== "error") return;

      const convex = getConvexClient();
      const alertMessage = `Run ${span.runId} failed at span ${span.spanId}: ${span.output}`;

      await convex.mutation(api.alerts.create, {
        runId: span.runId,
        projectId: span.projectDocId as Parameters<
          typeof convex.mutation
        >[1]["projectId"],
        type: "run_failed",
        message: alertMessage,
        triggeredAt: new Date().toISOString(),
      });

      // Emit Slack notification if configured
      const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
      if (slackWebhookUrl) {
        await fetch(slackWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: `🚨 5to1r Alert: ${alertMessage}` }),
        });
      }
    });

    return { ok: true, spanId: span.spanId };
  }
);
