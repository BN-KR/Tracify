import { NextRequest } from "next/server";
import { api } from "@/../convex/_generated/api";
import { getAuthedConvexClient } from "@/lib/convex-server";

function codeEvaluate(rule: string, output: string, expectedOutput?: string) {
  const normalized = rule.trim();
  const lower = normalized.toLowerCase();
  if (lower === "not_empty") return { value: output.trim().length > 0, status: output.trim().length > 0 ? "passed" as const : "failed" as const, explanation: output.trim().length > 0 ? "Output is non-empty." : "Output is empty." };
  if (lower === "exact_match" || lower === "equals_expected") { const passed = expectedOutput !== undefined && output.trim() === expectedOutput.trim(); return { value: passed, status: passed ? "passed" as const : "failed" as const, explanation: passed ? "Output matches expected output." : "Output does not match expected output." }; }
  if (lower.startsWith("contains:")) { const needle = normalized.slice(9).trim(); const passed = output.toLowerCase().includes(needle.toLowerCase()); return { value: passed, status: passed ? "passed" as const : "failed" as const, explanation: passed ? `Output contains '${needle}'.` : `Output does not contain '${needle}'.` }; }
  if (lower === "json_valid") { try { JSON.parse(output); return { value: true, status: "passed" as const, explanation: "Output is valid JSON." }; } catch { return { value: false, status: "failed" as const, explanation: "Output is not valid JSON." }; } }
  throw new Error("Unsupported offline rule");
}

export async function POST(request: NextRequest) {
  let body: { projectId?: string; jobId?: string };
  try { body = await request.json() as { projectId?: string; jobId?: string }; } catch { return Response.json({ error: "Invalid JSON" }, { status: 422 }); }
  if (!body.projectId || !body.jobId) return Response.json({ error: "projectId and jobId are required" }, { status: 422 });
  let convex;
  try { convex = await getAuthedConvexClient(); } catch { return Response.json({ error: "Authentication or Convex configuration is unavailable" }, { status: 503 }); }
  let setup;
  try {
    setup = await convex.query(api.evaluationEngine.getOfflineBundle, { projectId: body.projectId as never, jobId: body.jobId as never });
  } catch {
    // Invalid Convex IDs and inaccessible projects should not surface as 500s.
    return Response.json({ error: "Offline evaluation job not found" }, { status: 404 });
  }
  if (!setup) return Response.json({ error: "Offline evaluation job not found" }, { status: 404 });
  if (!setup.job.prompt) return Response.json({ error: "This job has no candidate prompt" }, { status: 422 });
  await convex.mutation(api.evaluationEngine.setJobStatus, { projectId: body.projectId as never, jobId: body.jobId as never, status: "running" });
  let failed = 0;
  try {
    for (const item of setup.items) {
      const response = await fetch("https://api.openai.com/v1/chat/completions", { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${process.env.OPENAI_API_KEY || ""}` }, body: JSON.stringify({ model: setup.job.model || "gpt-4o-mini", temperature: 0, messages: [{ role: "system", content: setup.job.prompt }, { role: "user", content: item.input }] }) });
      const data = await response.json() as { choices?: Array<{ message?: { content?: string } }>; error?: { message?: string } };
      if (!response.ok) throw new Error(data.error?.message || "Model request failed");
      const output = data.choices?.[0]?.message?.content || "";
      for (const evaluator of setup.evaluators) {
        const startedAt = Date.now();
        try {
          let value: number | boolean | string;
          let status: "passed" | "failed";
          let explanation: string;
          if (evaluator.evaluator.type === "code") { const result = codeEvaluate(evaluator.version.config.rule || evaluator.evaluator.criteria, output, item.expectedOutput); value = result.value; status = result.status; explanation = result.explanation; }
          else {
            const judge = await fetch("https://api.openai.com/v1/chat/completions", { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${process.env.OPENAI_API_KEY || ""}` }, body: JSON.stringify({ model: evaluator.version.config.model || "gpt-4o-mini", temperature: 0, response_format: { type: "json_object" }, messages: [{ role: "system", content: evaluator.version.config.prompt || evaluator.evaluator.criteria }, { role: "user", content: JSON.stringify({ input: item.input, output, expectedOutput: item.expectedOutput }) }] }) });
            const judged = await judge.json() as { choices?: Array<{ message?: { content?: string } }>; error?: { message?: string } };
            if (!judge.ok) throw new Error(judged.error?.message || "Judge request failed");
            const parsed = JSON.parse(judged.choices?.[0]?.message?.content || "{}");
            const score = Number(parsed.score);
            if (!Number.isFinite(score)) throw new Error("Judge returned an invalid score");
            value = evaluator.version.config.scoreType === "boolean" ? Boolean(parsed.passed) : evaluator.version.config.scoreType === "categorical" ? String(parsed.label || "unknown") : evaluator.version.config.scoreType === "text" ? String(parsed.explanation || "") : Math.max(0, Math.min(1, score));
            status = Boolean(parsed.passed ?? score >= (evaluator.version.config.minScore ?? 0.5)) ? "passed" : "failed";
            explanation = String(parsed.explanation || "");
          }
          await convex.mutation(api.evaluationEngine.recordOfflineResult, { projectId: body.projectId as never, jobId: body.jobId as never, evaluatorId: evaluator.evaluator._id, evaluatorVersion: evaluator.version.version, datasetItemId: item._id, value, dataType: evaluator.version.config.scoreType, status, explanation, latencyMs: Date.now() - startedAt });
          if (status === "failed") failed += 1;
        } catch (error) { failed += 1; await convex.mutation(api.evaluationEngine.recordOfflineResult, { projectId: body.projectId as never, jobId: body.jobId as never, evaluatorId: evaluator.evaluator._id, evaluatorVersion: evaluator.version.version, datasetItemId: item._id, value: false, dataType: "boolean", status: "error", error: error instanceof Error ? error.message : "Evaluator failed" }); }
      }
    }
    await convex.mutation(api.evaluationEngine.setJobStatus, { projectId: body.projectId as never, jobId: body.jobId as never, status: failed ? "partial" : "completed" });
    return Response.json({ ok: true, failed });
  } catch (error) {
    await convex.mutation(api.evaluationEngine.setJobStatus, { projectId: body.projectId as never, jobId: body.jobId as never, status: "failed", error: error instanceof Error ? error.message : "Evaluation run failed" });
    return Response.json({ error: error instanceof Error ? error.message : "Evaluation run failed" }, { status: 502 });
  }
}
