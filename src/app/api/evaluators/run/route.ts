import { NextRequest } from "next/server";
import { api } from "convex/_generated/api";
import { getAuthedConvexClient } from "@/lib/convex-server";

type Body = { projectId: string; evaluatorId: string; traceId: string; output: string; expectedOutput?: string };

function codeScore(criteria: string, output: string, expectedOutput?: string) {
  const rule = criteria.toLowerCase();
  if (rule.includes("contains:")) {
    const needle = criteria.slice(criteria.toLowerCase().indexOf("contains:") + 9).trim();
    return output.toLowerCase().includes(needle.toLowerCase()) ? 1 : 0;
  }
  if (rule.includes("equals_expected")) return expectedOutput !== undefined && output.trim() === expectedOutput.trim() ? 1 : 0;
  if (rule.includes("exact_match")) return expectedOutput !== undefined && output.trim() === expectedOutput.trim() ? 1 : 0;
  if (rule.includes("not_empty")) return output.trim() ? 1 : 0;
  if (rule.includes("regex:")) {
    const source = criteria.slice(criteria.toLowerCase().indexOf("regex:") + 6).trim();
    const match = source.match(/^\/(.*)\/([gimsuy]*)$/);
    const expression = match ? new RegExp(match[1], match[2]) : new RegExp(source);
    return expression.test(output) ? 1 : 0;
  }
  if (rule.includes("json_valid")) {
    try { JSON.parse(output); return 1; } catch { return 0; }
  }
  if (rule.includes("json_schema:")) {
    try {
      const schema = JSON.parse(criteria.slice(criteria.toLowerCase().indexOf("json_schema:") + 12).trim()) as { required?: string[]; type?: string };
      const parsed = JSON.parse(output) as Record<string, unknown>;
      if (schema.type === "object" && (typeof parsed !== "object" || parsed === null || Array.isArray(parsed))) return 0;
      return (schema.required ?? []).every((key) => Object.prototype.hasOwnProperty.call(parsed, key)) ? 1 : 0;
    } catch { return 0; }
  }
  throw new Error("Unsupported code rule. Use contains:<text>, equals_expected, not_empty, or json_valid.");
}

export async function POST(request: NextRequest) {
  let body: Body;
  try { body = await request.json() as Body; } catch { return Response.json({ error: "Invalid JSON body" }, { status: 422 }); }
  if (!body.projectId || !body.evaluatorId || !body.traceId || !body.output) return Response.json({ error: "projectId, evaluatorId, traceId, and output are required" }, { status: 422 });
  let convex;
  try {
    convex = await getAuthedConvexClient();
  } catch (error) {
    console.error("Evaluator auth/configuration failed:", error);
    return Response.json({ error: "Authentication or Convex configuration is unavailable" }, { status: 503 });
  }
  let evaluator;
  try {
    evaluator = await convex.query(api.evaluators.get, { projectId: body.projectId as never, evaluatorId: body.evaluatorId as never });
  } catch (error) {
    console.error("Evaluator lookup failed:", error);
    return Response.json({ error: "Evaluator access could not be verified" }, { status: 403 });
  }
  if (!evaluator) return Response.json({ error: "Evaluator not found or inactive" }, { status: 404 });
  let value: number;
  if (evaluator.type === "code") {
    try { value = codeScore(evaluator.criteria, body.output, body.expectedOutput); } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Code evaluator failed" }, { status: 422 }); }
  } else {
    const key = process.env.OPENAI_API_KEY;
    if (!key) return Response.json({ error: "OPENAI_API_KEY is required for LLM-as-a-judge evaluators" }, { status: 503 });
    const response = await fetch("https://api.openai.com/v1/chat/completions", { method: "POST", headers: { "content-type": "application/json", authorization: "Bearer " + key }, body: JSON.stringify({ model: "gpt-4o-mini", temperature: 0, response_format: { type: "json_object" }, messages: [{ role: "system", content: "Evaluate the response against the criteria. Return only JSON: {\"score\": number between 0 and 1, \"reason\": string}." }, { role: "user", content: JSON.stringify({ criteria: evaluator.criteria, output: body.output, expectedOutput: body.expectedOutput }) }] }) });
    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }>; error?: { message?: string } };
    if (!response.ok) return Response.json({ error: data.error?.message || "Judge request failed" }, { status: response.status });
    try { const parsed = JSON.parse(data.choices?.[0]?.message?.content || "{}") as { score?: number; reason?: string }; value = Math.max(0, Math.min(1, Number(parsed.score))); await convex.mutation(api.evaluation.createScore, { projectId: body.projectId as never, traceId: body.traceId, name: evaluator.name, value, dataType: "numeric", source: "llm", comment: parsed.reason }); return Response.json({ value, reason: parsed.reason }); } catch { return Response.json({ error: "Judge returned invalid JSON" }, { status: 502 }); }
  }
  await convex.mutation(api.evaluation.createScore, { projectId: body.projectId as never, traceId: body.traceId, name: evaluator.name, value, dataType: "numeric", source: "code", comment: evaluator.criteria });
  return Response.json({ value });
}
