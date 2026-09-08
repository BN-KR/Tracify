import type { DashboardWorkspace } from "./contracts";

const traces = [
  ["trace_150656", "handle-chatbot-message", "Completed", "production", "2026-09-06 15:06:56", "6.61s", "—", "default", "0.97", "usr_olivia", "session_checkout_104"],
  ["trace_145453", "handle-chatbot-message", "Completed", "production", "2026-09-06 14:54:53", "20.25s", "—", "default", "0.94", "usr_noah", "session_policy_882"],
  ["trace_145440", "handle-chatbot-message", "Completed", "production", "2026-09-06 14:54:40", "4.16s", "—", "default", "0.92", "usr_emma", "session_orders_551"],
  ["trace_145235", "handle-chatbot-message", "Completed", "production", "2026-09-06 14:52:35", "44.93s", "—", "default", "0.88", "usr_liam", "session_account_020"],
  ["trace_145134", "handle-chatbot-message", "Completed", "production", "2026-09-06 14:51:34", "19.33s", "—", "default", "0.91", "usr_ava", "session_voice_440"],
  ["trace_134555", "handle-chatbot-message", "Completed", "production", "2026-09-06 13:45:55", "20.06s", "—", "default", "0.93", "usr_mia", "session_incident_148"],
  ["trace_132111", "handle-chatbot-message", "Completed", "production", "2026-09-06 13:21:11", "78s", "—", "default", "0.86", "usr_olivia", "session_support_111"],
  ["trace_132045", "handle-chatbot-message", "Completed", "production", "2026-09-06 13:20:45", "15.64s", "—", "default", "0.84", "usr_noah", "session_support_045"],
  ["trace_132011", "handle-chatbot-message", "Completed", "production", "2026-09-06 13:20:11", "4.85s", "—", "default", "0.82", "usr_emma", "session_support_011"],
  ["trace_131959", "handle-chatbot-message", "Completed", "production", "2026-09-06 13:19:59", "7.30s", "—", "default", "0.80", "usr_liam", "session_support_959"],
  ["trace_125932", "voice-conversation", "Completed", "production", "2026-09-06 12:59:32", "34.18s", "—", "default", "0.78", "usr_ava", "session_voice_932"],
  ["trace_125401", "handle-chatbot-message", "Completed", "production", "2026-09-06 12:54:01", "24.78s", "—", "default", "0.76", "usr_mia", "session_support_401"],
  ["trace_124540", "voice-conversation", "Completed", "production", "2026-09-06 12:45:40", "36.49s", "—", "default", "0.74", "usr_olivia", "session_voice_540"],
  ["trace_121928", "handle-chatbot-message", "Completed", "production", "2026-09-06 12:19:28", "15.41s", "—", "default", "0.72", "usr_noah", "session_support_928"],
  ["trace_121909", "handle-chatbot-message", "Completed", "production", "2026-09-06 12:19:09", "6.90s", "—", "default", "0.70", "usr_emma", "session_support_909"],
  ["trace_111617", "handle-chatbot-message", "Completed", "production", "2026-09-06 11:16:50", "25.98s", "—", "default", "0.68", "usr_liam", "session_support_650"],
  ["trace_104519", "image-generator", "Completed", "production", "2026-09-06 10:45:19", "10.72s", "$0.010", "gpt-image-1", "0.66", "usr_ava", "session_image_519"],
  ["trace_104504", "sentiment-classifier", "Completed", "production", "2026-09-06 10:45:04", "2.13s", "—", "default", "0.64", "usr_mia", "session_sentiment_504"],
  ["trace_104433", "handle-chatbot-message", "Completed", "production", "2026-09-06 10:44:33", "36.27s", "—", "default", "0.62", "usr_olivia", "session_support_433"],
] as const;

const traceRecords = traces.map(([id, name, status, environment, timestamp, latency, cost, model, score, userId, sessionId]) => ({
  id,
  name,
  status,
  environment,
  timestamp,
  latency,
  cost,
  model,
  score,
  userId,
  sessionId,
  input: `Investigate ${name.toLowerCase()} and return a grounded answer.`,
  output: (status as string) === "Failed" ? "Tool request timed out before a verified answer was available." : "Completed with linked evidence and a verified final response.",
}));


export const sandboxWorkspace: DashboardWorkspace = {
  mode: "sandbox",
  readOnly: true,
  region: "eu",
  dataSource: "tracify-sandbox",
  project: {
    id: "tracify-sandbox",
    name: "langfuse-docs",
    organizationName: "Langfuse Demo",
  },
  metrics: {
    traces: 41,
    observations: 474,
    totalCost: 1.20948,
    scores: 126,
  },
  environments: ["all", "production", "staging"],
  models: ["all", "gpt-5.6-luna", "gpt-5.6-sol", "gpt-5.4-mini"],
  collections: {
    dashboards: {
      description: "Reusable views for cost, quality, latency, and trace volume.",
      records: [
        { id: "tracify-home", name: "Home", status: "Default", environment: "all", timestamp: "Updated today" },
        { id: "cost-overview", name: "Cost Overview", status: "Published", environment: "production", timestamp: "Updated 12 min ago" },
        { id: "release-quality", name: "Release Quality", status: "Published", environment: "production", timestamp: "Updated 34 min ago" },
        { id: "latency-watch", name: "Latency Watch", status: "Draft", environment: "staging", timestamp: "Updated yesterday" },
      ],
    },
    costs: { description: "Review model and trace cost across environments.", records: traceRecords },
    tracing: { description: "Inspect every trace and observation emitted by instrumented agents.", records: traceRecords },
    sessions: {
      description: "Group related traces into complete user and agent conversations.",
      records: traceRecords.map((trace) => ({ ...trace, id: trace.sessionId ?? trace.id, name: trace.name.replace("investigation", "conversation"), status: (trace.status as string) === "Running" ? "Active" : "Complete" })),
    },
    users: {
      description: "Understand activity, quality, latency, and cost for each end user.",
      records: traceRecords.map((trace, index) => ({ ...trace, id: trace.userId ?? trace.id, name: ["Olivia Martin", "Noah Williams", "Emma Davis", "Liam Brown", "Ava Wilson", "Mia Moore"][index], status: index === 2 ? "Needs review" : "Active" })),
    },
    alerts: {
      description: "Monitor quality, latency, cost, and failures against operational thresholds.",
      records: [
        { id: "alert_latency", name: "P95 latency budget", status: "Triggered", environment: "production", timestamp: "8 min ago" },
        { id: "alert_failures", name: "Tool-call failure rate", status: "Healthy", environment: "production", timestamp: "12 min ago" },
        { id: "alert_cost", name: "Daily cost ceiling", status: "Healthy", environment: "all", timestamp: "21 min ago" },
      ],
    },
    prompts: {
      description: "Version, label, test, and deploy prompts used by Tracify agents.",
      records: [
        { id: "prompt_support", name: "support-agent-system", status: "Production", environment: "production", timestamp: "Version 18", model: "gpt-5.6-luna" },
        { id: "prompt_triage", name: "incident-triage", status: "Staging", environment: "staging", timestamp: "Version 7", model: "gpt-5.4-mini" },
        { id: "order-resolution", name: "order-resolution", status: "Draft", environment: "sandbox", timestamp: "yesterday", model: "gpt-5.6-luna" },
        { id: "prompt_research", name: "research-with-citations", status: "Production", environment: "production", timestamp: "Version 12", model: "gpt-5.6-sol" },
      ],
    },
    playground: { description: "Test prompt versions and model settings against realistic inputs.", records: traceRecords.slice(0, 3) },
    scores: {
      description: "Explore numeric, categorical, and boolean quality signals attached to traces.",
      records: traceRecords.map((trace) => ({ ...trace, name: trace.name, status: Number(trace.score) >= 0.8 ? "Passing" : "Failing" })),
    },
    evaluators: {
      description: "Run deterministic and model-based evaluators against production traces.",
      records: [
        { id: "eval_grounded", name: "Grounded answer", status: "Active", environment: "production", timestamp: "126 scores", model: "gpt-5.6-luna" },
        { id: "eval_policy", name: "Policy compliance", status: "Active", environment: "production", timestamp: "98 scores" },
        { id: "eval_tool", name: "Tool result used", status: "Draft", environment: "staging", timestamp: "24 scores" },
      ],
    },
    "annotation-queues": {
      description: "Route difficult traces to structured human review.",
      records: [
        { id: "queue_failed", name: "Failed support responses", status: "6 pending", environment: "production", timestamp: "Updated 4 min ago" },
        { id: "queue_quality", name: "Low quality answers", status: "12 pending", environment: "production", timestamp: "Updated 9 min ago" },
      ],
    },
    datasets: {
      description: "Build versioned test sets from representative production traces.",
      records: [
        { id: "dataset_support", name: "Support regression set", status: "48 items", environment: "production", timestamp: "Version 6" },
        { id: "dataset_policy", name: "Policy edge cases", status: "32 items", environment: "production", timestamp: "Version 3" },
        { id: "dataset_tools", name: "Tool failure recovery", status: "20 items", environment: "staging", timestamp: "Version 2" },
      ],
    },
    experiments: {
      description: "Compare candidate prompts and models against a fixed evaluation set.",
      records: [
        { id: "experiment_luna", name: "Luna support migration", status: "Complete", environment: "staging", timestamp: "42 runs", score: "0.94" },
        { id: "experiment_retry", name: "Tool retry policy", status: "Running", environment: "staging", timestamp: "18 / 32 runs", score: "0.88" },
      ],
    },
  },
};
