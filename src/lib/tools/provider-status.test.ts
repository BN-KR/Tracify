import assert from "node:assert/strict";
import test from "node:test";
import { fetchProvider, parseFeed, parseGoogleIncidents, parseInstatus, parseStatuspage, providerDefs, unknownStatus } from "./provider-status.ts";

const def = providerDefs[0];

const calm = { page: { updated_at: "2026-10-17T10:00:00Z" }, status: { indicator: "none", description: "All Systems Operational" }, components: [{ name: "API", status: "operational" }, { name: "Group", group: true, status: "operational" }], incidents: [], scheduled_maintenances: [] };

test("statuspage: all clear", () => {
  const s = parseStatuspage(calm, def)!;
  assert.equal(s.state, "operational");
  assert.equal(s.components.length, 1);
  assert.equal(s.description, "All Systems Operational");
});

test("statuspage: a down component beats a calm headline", () => {
  const s = parseStatuspage({ ...calm, components: [{ name: "API", status: "operational" }, { name: "Responses", status: "major_outage" }] }, def)!;
  assert.equal(s.state, "outage");
  assert.equal(s.components[0].name, "Responses");
});

test("statuspage: open incidents count, resolved ones do not", () => {
  const s = parseStatuspage({ ...calm, incidents: [{ name: "Elevated errors", status: "investigating", impact: "minor", created_at: "2026-10-17T09:00:00Z", incident_updates: [{ body: "We are looking into it." }] }, { name: "Old", status: "resolved", impact: "major" }] }, def)!;
  assert.equal(s.state, "degraded");
  assert.equal(s.incidents.length, 1);
  assert.equal(s.incidents[0].latest, "We are looking into it.");
});

test("statuspage: maintenance and bad shapes", () => {
  assert.equal(parseStatuspage({ ...calm, scheduled_maintenances: [{ status: "in_progress" }] }, def)!.state, "maintenance");
  assert.equal(parseStatuspage({ nope: 1 }, def), null);
  assert.equal(parseStatuspage(null, def), null);
  assert.equal(parseStatuspage({ status: { indicator: "weird" } }, def)!.state, "unknown");
});

test("instatus and google formats", () => {
  assert.equal(parseInstatus({ page: { status: "UP" }, activeIncidents: [] }, def)!.state, "operational");
  assert.equal(parseInstatus({ page: { status: "HASISSUES" }, activeIncidents: [{ name: "Slow", impact: "MINOROUTAGE" }] }, def)!.state, "degraded");
  const g = parseGoogleIncidents([{ service_name: "Vertex Gemini API", external_desc: "Elevated latency", begin: "2026-10-17T08:00:00Z", severity: "medium", uri: "incidents/abc" }, { service_name: "Compute Engine", external_desc: "Other", begin: "x" }, { service_name: "Vertex Gemini API", end: "2026-10-16T00:00:00Z", external_desc: "Old" }], providerDefs[2])!;
  assert.equal(g.state, "degraded");
  assert.equal(g.incidents.length, 1);
  assert.equal(parseGoogleIncidents([], providerDefs[2])!.state, "operational");
  assert.equal(parseFeed({ random: true }, def), null);
});

test("fetchProvider never reports green when the feed fails", async () => {
  const fail = async () => { throw new Error("offline"); };
  assert.equal((await fetchProvider(def, fail as unknown as typeof fetch)).state, "unknown");
  const bad = async () => new Response("<html>nope</html>", { status: 200 });
  assert.equal((await fetchProvider(def, bad as unknown as typeof fetch)).state, "unknown");
  const e500 = async () => new Response("x", { status: 500 });
  assert.match((await fetchProvider(def, e500 as unknown as typeof fetch)).description, /500/);
  const ok = async () => new Response(JSON.stringify(calm), { status: 200 });
  assert.equal((await fetchProvider(def, ok as unknown as typeof fetch)).state, "operational");
  // Falls through to the second feed.
  let n = 0;
  const second = async () => (n++ === 0 ? new Response("x", { status: 404 }) : new Response(JSON.stringify(calm)));
  assert.equal((await fetchProvider(providerDefs[1], second as unknown as typeof fetch)).state, "operational");
  assert.equal(unknownStatus(def, "why").state, "unknown");
});
