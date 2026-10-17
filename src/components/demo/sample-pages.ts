/** Static sample content for the demo pages that are not built from the generated runs. */
export type SampleTable = { title: string; head: string[]; rows: string[][]; right?: number[] };
export type SamplePage = { title: string; intro: string; tables: SampleTable[]; cta: string };

const CTA = "Create a free project to build your own.";

export const SAMPLE_PAGES: Record<string, SamplePage> = {
  dashboards: {
    title: "Dashboards", intro: "Pinned views of the numbers your team checks every day.", cta: CTA,
    tables: [{ title: "Dashboards in this project", head: ["Name", "Widgets", "Owner", "Updated"], rows: [
      ["Support health", "8", "Maya", "2 hours ago"], ["Refund agent, weekly", "6", "Jonas", "yesterday"], ["Cost and models", "5", "Maya", "3 days ago"], ["Release watch", "7", "Priya", "last week"]] }],
  },
  explore: {
    title: "Explore", intro: "Slice every step by any field and save the question as a view.", cta: CTA,
    tables: [{ title: "Saved questions", head: ["Question", "Group by", "Measure"], rows: [
      ["Which tools fail most?", "Tool", "Error rate"], ["What does each customer plan cost us?", "Plan", "Cost per run"], ["Where is time spent?", "Step type", "p95 latency"], ["Which release is slowest?", "Release", "p95 latency"]] }],
  },
  prompts: {
    title: "Prompts", intro: "Version, compare and roll back the prompts your agents run.", cta: CTA,
    tables: [{ title: "Prompts", head: ["Prompt", "Live version", "Versions", "Runs (7 days)", "Last change"], right: [3], rows: [
      ["support-agent", "v18", "18", "2,150", "9 days ago"], ["refund-agent", "v18", "14", "292", "9 days ago"], ["order-status", "v17", "9", "390", "6 weeks ago"], ["onboarding-helper", "v17", "6", "260", "6 weeks ago"]] }],
  },
  playground: {
    title: "Playground", intro: "Try a prompt on a real run's input before you ship it.", cta: CTA,
    tables: [{ title: "Recent playground runs", head: ["Prompt", "Model", "Input from", "Result"], rows: [
      ["refund-agent v19 draft", "claude-sonnet-4-5", "A failed refund run", "Answered without the refund call"], ["support-agent v18", "gpt-4.1", "A billing question", "Same answer, 14% cheaper"], ["order-status v17", "gpt-4.1-mini", "A tracking question", "Answer correct"]] }],
  },
  scores: {
    title: "Scores", intro: "Quality scores attached to runs, from people, rules and model judges.", cta: CTA,
    tables: [{ title: "Score definitions", head: ["Score", "Type", "Scored runs", "Average"], right: [2, 3], rows: [
      ["Answer is correct", "Model judge", "6,120", "0.91"], ["Polite tone", "Model judge", "6,120", "0.97"], ["Resolved without a human", "Rule", "21,480", "0.84"], ["Customer thumbs up", "User feedback", "1,940", "0.88"]] }],
  },
  evaluators: {
    title: "Evaluators", intro: "Automatic checks that score new runs as they arrive.", cta: CTA,
    tables: [{ title: "Evaluators", head: ["Name", "Checks", "Runs on", "Status"], rows: [
      ["Correct answer", "Answer matches the tool results", "10% of production", "Running"], ["Tone", "Polite and clear", "10% of production", "Running"], ["Refund policy", "Refund follows policy", "All refund-agent runs", "Running"], ["Hallucinated order id", "Order ids exist in tool output", "All runs", "Paused"]] }],
  },
  "human-annotation": {
    title: "Human annotation", intro: "Queues where teammates review runs and leave a label.", cta: CTA,
    tables: [{ title: "Queues", head: ["Queue", "Waiting", "Reviewed this week", "Reviewers"], right: [1, 2], rows: [
      ["Failed refunds", "12", "41", "Maya, Jonas"], ["Low-scoring answers", "27", "63", "Priya"], ["New release spot check", "8", "20", "Maya"]] }],
  },
  datasets: {
    title: "Datasets", intro: "Sets of real inputs with expected answers, built from production runs.", cta: CTA,
    tables: [{ title: "Datasets", head: ["Name", "Items", "Created from", "Last used"], right: [1], rows: [
      ["Refund edge cases", "86", "Failed refund runs", "2 days ago"], ["Billing questions", "140", "Production, support-agent", "5 days ago"], ["Order lookups", "64", "Production, order-status", "last week"]] }],
  },
  experiments: {
    title: "Experiments", intro: "Run a dataset through two versions and compare quality, cost and speed.", cta: CTA,
    tables: [{ title: "Recent experiments", head: ["Experiment", "Compared", "Quality", "Cost", "p95"], rows: [
      ["Refund prompt v19", "v18 → v19", "+4 points", "−9%", "−0.6 s"], ["Cheaper answer model", "gpt-4.1 → gpt-4.1-mini", "−2 points", "−71%", "−1.9 s"], ["Shorter system prompt", "v17 → v18", "+1 point", "−12%", "−0.3 s"]] }],
  },
  settings: {
    title: "Settings", intro: "Project details, members and retention.", cta: "Create a free project to manage your own.",
    tables: [
      { title: "Project", head: ["Setting", "Value"], rows: [["Name", "support-agent"], ["Region", "EU"], ["Data kept for", "90 days"], ["Environments", "production, staging"]] },
      { title: "Members", head: ["Name", "Role", "Last active"], rows: [["Maya", "Owner", "today"], ["Jonas", "Admin", "yesterday"], ["Priya", "Member", "3 days ago"]] },
    ],
  },
};
