"use client";

import { useAction, useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

export function TracifyIntegrations({ projectId }: { projectId: string }) {
  const project = useQuery(api.projects.getProjectById, { projectId: projectId as Id<"projects"> });
  const updateProject = useMutation(api.projects.updateProject);
  const sendTestAlert = useAction(api.projects.sendTestAlert);
  const [slack, setSlack] = useState("");
  const [teams, setTeams] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => { if (project) { setSlack(project.slackWebhookUrl || ""); setTeams(project.teamsWebhookUrl || ""); } }, [project]);
  /* eslint-enable react-hooks/set-state-in-effect */

  async function save() {
    setSaving(true); setNotice("");
    try { await updateProject({ projectId: projectId as Id<"projects">, slackWebhookUrl: slack.trim() || undefined, teamsWebhookUrl: teams.trim() || undefined }); setNotice("Integration settings saved."); } catch (error) { setNotice(error instanceof Error ? error.message : "Could not save integration settings."); } finally { setSaving(false); }
  }

  async function test(channel: "slack" | "teams") {
    setNotice("");
    try { await sendTestAlert({ projectId: projectId as Id<"projects">, channel }); setNotice(`${channel === "slack" ? "Slack" : "Teams"} test alert sent.`); } catch (error) { setNotice(error instanceof Error ? error.message : "Test alert failed."); }
  }

  if (!project) return <div className="border border-black/15 bg-white p-6 font-mono text-[10px] uppercase tracking-widest text-black/45">Loading integrations…</div>;
  return <div className="space-y-6">
    <div className="grid gap-4 md:grid-cols-3">{[["SDK ingestion", "Send traces from the TypeScript or Python SDK.", `/dashboard/${projectId}/quickstart`], ["OpenTelemetry", "Ingest OTLP spans through the Tracify endpoint.", `/dashboard/${projectId}/docs`], ["MCP & CLI", "Connect developer tools to this project.", `/dashboard/${projectId}/settings/mcp-cli`]].map(([title, description, href]) => <a key={title} href={href} className="border border-black/15 bg-white p-5 transition-colors hover:border-black"><p className="font-mono text-[11px] uppercase tracking-widest">{title}</p><p className="mt-3 text-sm leading-6 text-black/55">{description}</p><span className="mt-5 block font-mono text-[9px] uppercase tracking-widest text-black/50">Configure →</span></a>)}</div>
    <section className="border border-black/15 bg-white p-6"><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-black/45">Alert destinations</p><h2 className="mt-2 font-pixel text-4xl tracking-[-0.05em]">Connect your team.</h2><div className="mt-6 grid gap-6 md:grid-cols-2"><WebhookCard label="Slack" value={slack} onChange={setSlack} placeholder="https://hooks.slack.com/services/..." onTest={() => void test("slack")} /><WebhookCard label="Microsoft Teams" value={teams} onChange={setTeams} placeholder="https://*.webhook.office.com/..." onTest={() => void test("teams")} /></div><div className="mt-6 flex items-center gap-4"><button type="button" onClick={() => void save()} disabled={saving} className="bg-black px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-white hover:bg-[#f4d44d] hover:text-black disabled:opacity-50">{saving ? "Saving…" : "Save integrations"}</button>{notice ? <span className="font-mono text-[10px] text-black/55" role="status">{notice}</span> : null}</div></section>
  </div>;
}

function WebhookCard({ label, value, onChange, placeholder, onTest }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; onTest: () => void }) {
  return <div className="border border-black/10 p-4"><h3 className="font-mono text-[12px] uppercase tracking-widest">{label}</h3><p className="mt-2 text-xs leading-5 text-black/55">Receive Tracify alert notifications in this destination.</p><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-4 h-10 w-full border border-black/15 bg-white px-3 font-mono text-[10px] text-black outline-none focus:border-black" /><button type="button" onClick={onTest} disabled={!value.trim()} className="mt-3 border border-black/20 px-3 py-2 font-mono text-[9px] uppercase tracking-widest text-black/60 hover:border-black hover:text-black disabled:opacity-40">Send test alert</button></div>;
}
