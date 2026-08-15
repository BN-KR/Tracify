import { NextResponse } from "next/server";
import { getDoc, getDocs } from "@/lib/markdoc-docs";

export const runtime = "nodejs";

const protocolVersion = "2025-03-26";
const resourceUri = (slug: string) => `tracify://docs/${slug}`;

function result(id: unknown, value: unknown) { return NextResponse.json({ jsonrpc: "2.0", id, result: value }); }
function error(id: unknown, code: number, message: string) { return NextResponse.json({ jsonrpc: "2.0", id, error: { code, message } }); }
function docMarkdown(slug: string) { const doc = getDoc(slug); return doc ? `# ${doc.title}\n\n${doc.description}\n\n${doc.body}` : null; }

export async function GET() { return NextResponse.json({ name: "Tracify Docs MCP", transport: "streamable-http", endpoint: "/api/docs/mcp", install: { mcpServers: { "tracify-docs": { url: "https://www.tracify.tech/api/docs/mcp" } } } }); }

export async function POST(request: Request) {
  const message = await request.json().catch(() => null) as { id?: unknown; method?: string; params?: Record<string, unknown> } | null;
  if (!message?.method) return error(message?.id ?? null, -32600, "Invalid JSON-RPC request");
  const id = message.id;
  const docs = getDocs();
  let response: unknown;
  switch (message.method) {
    case "initialize": response = { protocolVersion, capabilities: { resources: {}, tools: {} }, serverInfo: { name: "tracify-docs", version: "1.0.0" } }; break;
    case "notifications/initialized": return new NextResponse(null, { status: 204 });
    case "resources/list": response = { resources: docs.map((doc) => ({ uri: resourceUri(doc.slug), name: doc.title, description: doc.description, mimeType: "text/markdown" })) }; break;
    case "resources/read": { const uri = String(message.params?.uri ?? ""); const slug = uri.replace("tracify://docs/", ""); const markdown = docMarkdown(slug); if (!markdown) return error(id, -32602, "Unknown documentation resource"); response = { contents: [{ uri, mimeType: "text/markdown", text: markdown }] }; break; }
    case "tools/list": response = { tools: [{ name: "list_docs", description: "List all public Tracify documentation pages.", inputSchema: { type: "object", properties: {} } }, { name: "search_docs", description: "Search Tracify docs by title and description.", inputSchema: { type: "object", properties: { query: { type: "string" } }, required: ["query"] } }, { name: "read_doc", description: "Read a full Tracify documentation page as Markdown.", inputSchema: { type: "object", properties: { slug: { type: "string" } }, required: ["slug"] } }] }; break;
    case "tools/call": { const name = String(message.params?.name ?? ""); const args = message.params?.arguments as Record<string, unknown> | undefined; if (name === "list_docs") response = { content: [{ type: "text", text: docs.map((doc) => `- ${doc.title}: ${doc.slug} — ${doc.description}`).join("\n") }] }; else if (name === "search_docs") { const query = String(args?.query ?? "").toLowerCase(); const matches = docs.filter((doc) => `${doc.title} ${doc.description} ${doc.section}`.toLowerCase().includes(query)); response = { content: [{ type: "text", text: matches.map((doc) => `- ${doc.title}: ${doc.slug} — ${doc.description}`).join("\n") || "No matching docs found." }] }; } else if (name === "read_doc") { const markdown = docMarkdown(String(args?.slug ?? "")); if (!markdown) return error(id, -32602, "Unknown documentation slug"); response = { content: [{ type: "text", text: markdown }] }; } else return error(id, -32601, "Unknown tool"); break; }
    default: return error(id, -32601, "Method not found");
  }
  return id === undefined ? new NextResponse(null, { status: 204 }) : result(id, response);
}
