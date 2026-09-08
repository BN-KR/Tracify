import type { DashboardWorkspace } from "./contracts";

const traces = [
  ["trace_support_8f2c", "Refund status investigation", "Completed", "production", "18:42:16", "1.24s", "$0.018", "gpt-5.6-luna", "0.97", "usr_olivia", "session_checkout_104"],
  ["trace_research_72ab", "Policy retrieval with citations", "Completed", "production", "18:38:02", "2.08s", "$0.041", "gpt-5.6-sol", "0.94", "usr_noah", "session_policy_882"],
  ["trace_support_19de", "Order lookup and escalation", "Failed", "production", "18:31:44", "4.82s", "$0.009", "gpt-5.6-luna", "0.42", "usr_emma", "session_orders_551"],
  ["trace_agent_0c91", "Account context refresh", "Running", "staging", "18:27:09", "0.82s", "$0.006", "gpt-5.4-mini", "0.88", "usr_liam", "session_account_020"],
  ["trace_voice_88af", "Voice support handoff", "Completed", "production", "18:19:52", "3.10s", "$0.052", "gpt-5.6-luna", "0.91", "usr_ava", "session_voice_440"],
  ["trace_triage_32dd", "Incident classification", "Completed", "staging", "18:12:33", "1.67s", "$0.014", "gpt-5.4-mini", "0.93", "usr_mia", "session_incident_148"],
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
  output: status === "Failed" ? "Tool request timed out before a verified answer was available." : "Completed with linked evidence and a verified final response.",
}));

export const sandboxWorkspace: DashboardWorkspace = {
  mode: "sandbox",
  readOnly: true,
  region: "eu",
  dataSource: "tracify-sandbox",
  project: {
    id: "tracify-sandbox",
    name: "Demo Project (view only)",
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
      records: traceRecords.map((trace) => ({ ...trace, id: trace.sessionId ?? trace.id, name: trace.name.replace("investigation", "conversation"), status: trace.status === "Running" ? "Active" : "Complete" })),
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
