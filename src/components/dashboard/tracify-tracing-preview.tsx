"use client";

import { useMemo, useState } from "react";
import { BarChart3, ChevronDown, Columns3, Filter, Search, Table2 } from "lucide-react";

type Trace = {
  id: string;
  name: string;
  traceName: string;
  type: "GENERATION" | "SPAN";
  status: "Completed" | "Failed";
  input: string;
  output: string;
  latency: string;
  cost: string;
  model: string;
  environment: string;
  start: string;
};

const traces: Trace[] = [
  { id: "tr_01H9Q2", name: "handle-chatbot-message", traceName: "QA-Chatbot", type: "GENERATION", status: "Completed", input: "Could you share what you need help with?", output: "I can help with your order or account.", latency: "1.84s", cost: "$0.014", model: "gpt-5", environment: "default", start: "2026-09-06 15:06:56" },
  { id: "tr_01H9Q1", name: "voice-conversation", traceName: "Voice support", type: "SPAN", status: "Completed", input: "I need to change my delivery address.", output: "Address update workflow started.", latency: "2.41s", cost: "$0.021", model: "claude-sonnet", environment: "default", start: "2026-09-06 14:58:21" },
  { id: "tr_01H9Q0", name: "sentiment-classifier", traceName: "Inbox triage", type: "GENERATION", status: "Failed", input: "This still has not been resolved.", output: "Provider timeout after retry.", latency: "8.92s", cost: "$0.038", model: "gpt-5", environment: "production", start: "2026-09-06 14:41:03" },
  { id: "tr_01H9PZ", name: "image-generator", traceName: "Product mockup", type: "GENERATION", status: "Completed", input: "Create a clean product illustration.", output: "Generated image asset.", latency: "4.08s", cost: "$0.067", model: "gpt-image-1", environment: "default", start: "2026-09-06 14:22:47" },
  { id: "tr_01H9PY", name: "handle-chatbot-message", traceName: "Refund assistant", type: "GENERATION", status: "Completed", input: "Can I get a refund for this order?", output: "I can check the order number first.", latency: "1.26s", cost: "$0.011", model: "gpt-5", environment: "default", start: "2026-09-06 13:54:12" },
];

const columns = ["Input", "Output", "Status", "Latency", "Cost", "Model", "Environment"] as const;

export function TracifyTracingPreview() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("All types");
  const [status, setStatus] = useState("All statuses");
  const [environment, setEnvironment] = useState("All environments");
  const [view, setView] = useState<"table" | "chart">("table");
  const [visibleColumns, setVisibleColumns] = useState<string[]>(["Input", "Output", "Status", "Latency", "Cost", "Model", "Environment"]);
  const [showColumns, setShowColumns] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => traces.filter((trace) => {
    const haystack = `${trace.name} ${trace.traceName} ${trace.input} ${trace.output} ${trace.id}`.toLowerCase();
    return (!query || haystack.includes(query.toLowerCase())) &&
      (type === "All types" || trace.type === type) &&
      (status === "All statuses" || trace.status === status) &&
      (environment === "All environments" || trace.environment === environment);
  }), [environment, query, status, type]);

  function toggleColumn(column: string) {
    setVisibleColumns((current) => current.includes(column) ? current.filter((item) => item !== column) : [...current, column]);
  }

  return (
    <div className="tracify-overview min-h-screen">
      <header className="tracify-page-header">
        <div className="tracify-breadcrumbs"><span className="tracify-crumb">Tracify workspace</span><span>/</span><span className="tracify-crumb">Tracing</span></div>
        <div className="tracify-header-actions"><span className="tracify-control">1d <ChevronDown /></span><span className="tracify-assistant">Assistant <kbd>Ctrl I</kbd></span></div>
      </header>
      <div className="tracify-toolbar tracify-tracing-toolbar">
        <h1>Tracing</h1>
        <label className="tracify-search"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search traces" aria-label="Search traces" /></label>
        <select className="tracify-control" value={type} onChange={(event) => setType(event.target.value)} aria-label="Trace type"><option>All types</option><option>GENERATION</option><option>SPAN</option></select>
        <select className="tracify-control" value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Trace status"><option>All statuses</option><option>Completed</option><option>Failed</option></select>
        <select className="tracify-control" value={environment} onChange={(event) => setEnvironment(event.target.value)} aria-label="Trace environment"><option>All environments</option><option>default</option><option>production</option></select>
        <button type="button" className="tracify-control" aria-expanded={showFilters} onClick={() => setShowFilters((current) => !current)}><Filter /> Filters</button>
        <div className="tracify-toolbar-spacer" />
        <button type="button" className={view === "table" ? "tracify-view-button is-active" : "tracify-view-button"} onClick={() => setView("table")} aria-pressed={view === "table"}><Table2 /> Table</button>
        <button type="button" className={view === "chart" ? "tracify-view-button is-active" : "tracify-view-button"} onClick={() => setView("chart")} aria-pressed={view === "chart"}><BarChart3 /> Chart</button>
        <div className="tracify-column-control"><button type="button" className="tracify-control" onClick={() => setShowColumns((current) => !current)}><Columns3 /> Columns</button>{showColumns ? <div className="tracify-column-menu">{columns.map((column) => <label key={column}><input type="checkbox" checked={visibleColumns.includes(column)} onChange={() => toggleColumn(column)} />{column}</label>)}</div> : null}</div>
      </div>
      {showFilters ? <div className="tracify-filter-popover" role="dialog" aria-label="Trace filters"><div className="tracify-filter-heading"><strong>Filters</strong><button type="button" onClick={() => { setQuery(""); setType("All types"); setStatus("All statuses"); setEnvironment("All environments"); }}>Clear all</button></div><p className="text-xs text-black/55">Use the controls in the toolbar to narrow traces by type, status, environment, or search text.</p></div> : null}
      {view === "table" ? <TraceTable rows={filtered} visibleColumns={visibleColumns} /> : <TraceChart rows={filtered} />}
    </div>
  );
}

function TraceTable({ rows, visibleColumns }: { rows: Trace[]; visibleColumns: string[] }) {
  return <section className="tracify-trace-table-wrap"><div className="tracify-table-summary">{rows.length} traces <span>·</span> Start time descending</div><div className="tracify-trace-table-scroll"><table className="tracify-trace-table"><thead><tr><th>Start time</th><th>Type</th><th>Name</th><th>Trace name</th>{visibleColumns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{rows.map((trace) => <tr key={trace.id}><td>{trace.start}</td><td><span className={`tracify-type-badge ${trace.type === "GENERATION" ? "is-generation" : ""}`}>{trace.type}</span></td><td className="trace-name">{trace.name}<small>{trace.id}</small></td><td>{trace.traceName}</td>{visibleColumns.map((column) => <td key={column}>{column === "Input" ? trace.input : column === "Output" ? trace.output : column === "Status" ? <span className={trace.status === "Failed" ? "tracify-status is-failed" : "tracify-status"}>{trace.status}</span> : column === "Latency" ? trace.latency : column === "Cost" ? trace.cost : column === "Model" ? trace.model : trace.environment}</td>)}</tr>)}</tbody></table>{rows.length === 0 ? <div className="tracify-no-results">No traces match the current filters.</div> : null}</div></section>;
}

function TraceChart({ rows }: { rows: Trace[] }) {
  return <section className="tracify-trace-chart"><div className="tracify-chart-heading"><div><h2>Trace volume over time</h2><p>{rows.length} matching traces · 1d</p></div><span>Observations by time</span></div><div className="tracify-bars">{[18, 34, 26, 48, 41, 58, 38, 72, 54, 66, 44, 78, 61, 86, 68, 92].map((height, index) => <div key={index} className="tracify-bar" style={{ height: `${height}%` }}><span /></div>)}</div><div className="tracify-chart-axis"><span>00:00</span><span>04:00</span><span>08:00</span><span>12:00</span><span>16:00</span><span>20:00</span></div></section>;
}
