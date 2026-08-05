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
        sessionId: span.sessionId ?? "",
        endUserId: span.endUserId ?? "",
        environment: span.environment ?? "",
        release: span.release ?? "",
        tags: span.tags ?? [],
        traceName: span.traceName ?? "",
        inputTokens: span.inputTokens ?? 0,
        outputTokens: span.outputTokens ?? 0,
        ttftMs: span.ttftMs ?? 0,
        retryCount: span.retryCount ?? 0,
        errorType: span.errorType ?? "",
        errorMessage: span.errorMessage ?? "",
        isStreamChunk: span.isStreamChunk ?? false,
        streamSequence: span.streamSequence ?? 0,
        streamFinal: span.streamFinal ?? true,
        payloadFormat: span.payloadFormat ?? "json",
        createdAt: span.createdAt,
      });
    });

    const run = await step.run("upsert-convex-run", async () => {
      const convex = getConvexClient();
      return await convex.mutation(api.agentRuns.upsertRunFromSpan, {
        runId: span.runId,
        projectId: span.projectDocId as Id<"projects">,
        costUsd: span.costUsd,
        spanType: span.spanType,
        createdAt: span.createdAt,
        modelId: span.modelId || undefined,
        sessionId: span.sessionId || undefined,
      });
    });

    if (span.sessionId) {
      await step.run("upsert-convex-session", async () => {
        const convex = getConvexClient();
        const status = span.spanType === "error"
          ? "failed"
          : span.spanType === "run_end"
            ? "completed"
            : "running";
        await convex.mutation(api.sessions.upsertFromSpan, {
          projectId: span.projectDocId as Id<"projects">,
          sessionId: span.sessionId,
          endUserId: span.endUserId || undefined,
          environment: span.environment || undefined,
          release: span.release || undefined,
          traceName: span.traceName || undefined,
          tags: span.tags ?? [],
          createdAt: span.createdAt,
          costUsd: span.costUsd,
          status,
          isNewTrace: run.created,
        });
      });
    }

    await step.run("check-thresholds", async () => {
      const convex = getConvexClient();
      const project = await convex.query(api.projects.getById, {
        id: span.projectDocId as Id<"projects">,
      });
      const run = await convex.query(api.agentRuns.getByRunId, {
        runId: span.runId,
        projectId: span.projectDocId as Id<"projects">,
      });

      if (project?.costThresholdUsd && run && run.totalCostUsd > project.costThresholdUsd) {
        await inngest.send({
          name: "5to1r/alert.triggered",
          data: {
            projectId: span.projectDocId,
            runId: span.runId,
            type: "cost_exceeded",
            message: `Run ${span.runId} exceeded cost threshold of $${project.costThresholdUsd}. Current cost: $${run.totalCostUsd.toFixed(4)}`,
            triggeredAt: new Date().toISOString(),
          },
        });
      }

      if (span.spanType === "error") {
        await inngest.send({
          name: "5to1r/alert.triggered",
          data: {
            projectId: span.projectDocId,
            runId: span.runId,
            type: "run_failed",
            message: `Run ${span.runId} encountered an error span.`,
            triggeredAt: new Date().toISOString(),
          },
        });
      }
    });

    return { ok: true, spanId: span.spanId };
  },
);

export const processAlert = inngest.createFunction(
  {
    id: "process-alert",
    name: "Process alert",
    triggers: [{ event: "5to1r/alert.triggered" }],
  },
  async ({ event, step }) => {
    const alert = event.data;

    await step.run("log-to-convex", async () => {
      const convex = getConvexClient();
      await convex.mutation(api.alerts.create, {
        projectId: alert.projectId as Id<"projects">,
        runId: alert.runId,
        type: alert.type,
        message: alert.message,
        triggeredAt: alert.triggeredAt,
      });
    });

    await step.run("notify-slack", async () => {
      const convex = getConvexClient();
      const project = await convex.query(api.projects.getById, {
        id: alert.projectId as Id<"projects">,
      });

      if (project?.slackWebhookUrl) {
        await fetch(project.slackWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            blocks: [
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: `🚨 *Tracify Alert: ${alert.type.replace('_', ' ').toUpperCase()}*`
                }
              },
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: alert.message
                }
              },
              {
                type: "actions",
                elements: [
                  {
                    type: "button",
                    text: {
                      type: "plain_text",
                      text: "View Trace",
                      emoji: true
                    },
                    url: `https://tracify.tech/dashboard/${alert.projectId}/runs/${alert.runId}`,
                    style: "primary"
                  }
                ]
              }
            ]
          }),
        });
      }
    });

    return { ok: true };
  },
);
