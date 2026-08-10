import { NextRequest } from "next/server";
import { api } from "convex/_generated/api";
import { getAuthedConvexClient } from "@/lib/convex-server";

type PlaygroundBody = { projectId: string; prompt: string; variables?: Record<string, string>; model?: string; models?: string[] };

function compilePrompt(prompt: string, variables: Record<string, string>) {
  return prompt.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_, key: string) => variables[key] ?? "");
}

export async function POST(request: NextRequest) {
  let body: PlaygroundBody;
  try { body = await request.json() as PlaygroundBody; } catch { return Response.json({ error: "Invalid JSON body" }, { status: 422 }); }
  if (!body.projectId || !body.prompt) return Response.json({ error: "projectId and prompt are required" }, { status: 422 });
  let convex;
  try {
    convex = await getAuthedConvexClient();
  } catch (error) {
    console.error("Playground auth/configuration failed:", error);
    return Response.json({ error: "Authentication or Convex configuration is unavailable" }, { status: 503 });
  }
  let project;
  try {
    project = await convex.query(api.projects.getProject, { projectId: body.projectId as never });
  } catch (error) {
    console.error("Playground project lookup failed:", error);
    return Response.json({ error: "Project access could not be verified" }, { status: 403 });
  }
  if (!project) return Response.json({ error: "Project not found or access denied" }, { status: 403 });
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return Response.json({ error: "Playground provider is not configured. Set OPENAI_API_KEY in the server environment." }, { status: 503 });
  const models = [...new Set((body.models?.length ? body.models : [body.model || "gpt-4o-mini"]).map((model) => model.trim()).filter(Boolean))].slice(0, 2);
  const results = await Promise.all(models.map(async (model) => {
    const startedAt = Date.now();
    const response = await fetch("https://api.openai.com/v1/chat/completions", { method: "POST", headers: { "content-type": "application/json", authorization: "Bearer " + apiKey }, body: JSON.stringify({ model, messages: [{ role: "user", content: compilePrompt(body.prompt, body.variables ?? {}) }], temperature: 0.2 }) });
    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }>; error?: { message?: string } };
    if (!response.ok) return { model, output: "", latencyMs: Date.now() - startedAt, error: data.error?.message || "Provider request failed" };
    return { model, output: data.choices?.[0]?.message?.content ?? "", latencyMs: Date.now() - startedAt };
  }));
  const first = results[0];
  return Response.json({ output: first?.output ?? "", model: first?.model, latencyMs: first?.latencyMs ?? 0, results });
}
