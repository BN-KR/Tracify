import { Inngest } from "inngest";

export const inngest = new Inngest({ id: "5to1r" });

// Typed event map for all Inngest events used in this app
export type SpanIngestedEvent = {
  name: "span/ingested";
  data: {
    spanId: string;
    runId: string;
    projectId: string;
    projectDocId: string; // Convex _id for the project
    spanType: "llm_call" | "tool_call" | "decision" | "error";
    input: string;
    output: string;
    latencyMs: number;
    costUsd: number;
    modelId: string;
    toolName: string;
    createdAt: string;
  };
};
