"use client";

import { useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";

const snippets = {
  cli: `tracify projects list\ntracify traces list --project <PROJECT_ID>`,
  mcp: `{"mcpServers":{"tracify":{"url":"https://api.tracify.tech/mcp","headers":{"Authorization":"Bearer <TRACIFY_API_KEY>"}}}}`,
  curl: `curl -H "Authorization: Bearer <TRACIFY_API_KEY>" \\\n+  https://api.tracify.tech/v1/projects/<PROJECT_ID>/traces`,
};

export function TracifyMcpCli({ projectId }: { projectId: string }) {
  const [tab, setTab] = useState<keyof typeof snippets>("cli");
  const [copied, setCopied] = useState(false);
  async function copy() { await navigator.clipboard.writeText(snippets[tab].replace("<PROJECT_ID>", projectId)); setCopied(true); window.setTimeout(() => setCopied(false), 1600); }
  return <section className="tracify-settings-resource"><div className="tracify-settings-resource-heading"><div><span className="tracify-eyebrow">PROJECT SETTINGS / DEVELOPER ACCESS</span><h1>MCP &amp; CLI</h1><p>Connect agents and developer tools to this Tracify project.</p></div><Terminal /></div><div className="tracify-mcp-tabs">{(["cli", "mcp", "curl"] as const).map((item) => <button type="button" key={item} className={tab === item ? "is-active" : ""} onClick={() => setTab(item)}>{item === "cli" ? "Tracify CLI" : item === "mcp" ? "MCP server" : "REST API"}</button>)}</div><div className="tracify-mcp-code"><button type="button" onClick={() => void copy()} aria-label="Copy configuration">{copied ? <Check /> : <Copy />}{copied ? "Copied" : "Copy"}</button><pre><code>{snippets[tab].replace("<PROJECT_ID>", projectId)}</code></pre></div><div className="tracify-mcp-note">Use a project API key for authenticated access. Keys are shown once when created and should be stored in your secret manager.</div></section>;
}
