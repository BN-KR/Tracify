"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import {
  Bot,
  ChevronDown,
  Copy,
  ExternalLink,
  Filter,
  PanelLeft,
  Pencil,
  Search,
  X,
} from "lucide-react";

import type {
  DashboardWorkspace,
  WorkspaceRecord,
  WorkspaceSurface,
} from "../contracts";

const SURFACE_LABELS: Record<WorkspaceSurface, string> = {
  home: "Home",
  dashboards: "Dashboards",
  costs: "Costs",
  tracing: "Tracing",
  sessions: "Sessions",
  users: "Users",
  alerts: "Alerts",
  prompts: "Prompts",
  playground: "Playground",
  scores: "Scores",
  evaluators: "Evaluators",
  "annotation-queues": "Human Annotation",
  datasets: "Datasets",
  experiments: "Experiments",
  settings: "Settings",
};

const SURFACE_ALIASES: Record<string, WorkspaceSurface> = {
  traces: "tracing",
  evals: "evaluators",
  "human-annotation": "annotation-queues",
};

function parseSurface(segments: string[]): WorkspaceSurface {
  const requested = segments[0] || "home";
  if (requested in SURFACE_ALIASES) return SURFACE_ALIASES[requested];
  return requested in SURFACE_LABELS ? (requested as WorkspaceSurface) : "home";
}

function surfacePath(basePath: string, surface: WorkspaceSurface) {
  return surface === "home" ? basePath : `${basePath}/${surface}`;
}

export function CapturedWorkspace({
  workspace,
  segments = [],
}: {
  workspace: DashboardWorkspace;
  segments?: string[];
}) {
  const router = useRouter();
  const hydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const surface = parseSurface(segments);
  const recordId = segments[1];
  const basePath = workspace.mode === "sandbox" ? "/playground" : `/dashboard/${workspace.project.id}`;
  const [range, setRange] = useState("1d");
  const [environment, setEnvironment] = useState("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [readOnlyAction, setReadOnlyAction] = useState<string | null>(null);
  function handleAction(action: string) {
    if (workspace.mode === "live") {
      const liveRoutes: Array<[string, string]> = [
        ["Create dashboard", `${basePath}/dashboards/new`],
        ["Create alert", `${basePath}/alerts/new`],
        ["Create evaluator", `${basePath}/evaluation/evaluators`],
        ["Create dataset", `${basePath}/evaluation/datasets`],
        ["Open LLM Connections", `${basePath}/settings/llm-connections`],
        ["Open LLM Connections", `${basePath}/settings/llm-connections`],
        ["Save project settings", `${basePath}/settings`],
      ];
      const route = liveRoutes.find(([label]) => action === label)?.[1];
      if (route) {
        router.push(route);
        return;
      }
    }
    setReadOnlyAction(action);
  }

  return (
    <div className="captured-workspace" data-workspace-mode={workspace.mode} data-hydrated={hydrated ? "true" : "false"}>
      <header className="captured-workspace-header">
        <div className="captured-workspace-breadcrumbs">
          <button
            type="button"
            className="captured-icon-button"
            aria-label="Toggle sidebar"
            onClick={() => window.dispatchEvent(new Event("tracify:toggle-sidebar"))}
          >
            <PanelLeft />
          </button>
          <button type="button" className="captured-crumb" onClick={() => window.dispatchEvent(new Event("tracify:open-project-switcher"))}>
            {workspace.project.organizationName}<ChevronDown />
          </button>
          <span>/</span>
          <button type="button" className="captured-crumb" onClick={() => window.dispatchEvent(new Event("tracify:open-project-switcher"))}>
            {workspace.project.name}<ChevronDown />
          </button>
        </div>
        <div className="captured-workspace-header-actions">
          <label className="captured-range">
            <select aria-label="Dashboard time range" value={range} onChange={(event) => setRange(event.target.value)}>
              <option value="1d">1d</option>
              <option value="7d">7d</option>
              <option value="30d">30d</option>
              <option value="90d">90d</option>
            </select>
            <span>{range === "1d" ? "Past 1 day" : `Past ${range.slice(0, -1)} days`}</span><ChevronDown />
          </label>
          <button type="button" className="captured-assistant" onClick={() => window.dispatchEvent(new Event("tracify:open-command"))}>
            <Bot /> Assistant <kbd>Ctrl I</kbd>
          </button>
        </div>
      </header>

      <div className="captured-workspace-toolbar">
        <h1>{SURFACE_LABELS[surface]}</h1>
        <label className="captured-control">
          <span>Env</span>
          <select aria-label="Environment" value={environment} onChange={(event) => setEnvironment(event.target.value)}>
            {workspace.environments.map((option) => <option key={option} value={option}>{option === "all" ? "all environments" : option}</option>)}
          </select>
          <ChevronDown />
        </label>
        <button type="button" className="captured-control" aria-expanded={filtersOpen} onClick={() => setFiltersOpen((current) => !current)}>
          <Filter /> Filters <ChevronDown />
        </button>
        <div className="captured-toolbar-spacer" />
        {surface === "home" ? (
          <>
            <span className="captured-dashboard-name"><span className="captured-mark" />Cost Dashboard</span>
            <Link className="captured-icon-button" href={surfacePath(basePath, "dashboards")} aria-label="Edit this dashboard in Dashboards"><Pencil /></Link>
            {workspace.mode === "live" ? <Link className="captured-primary-action" href={`${basePath}/quickstart`}>Configure Tracing <ExternalLink /></Link> : null}
          </>
        ) : (
          <button type="button" className="captured-primary-action" onClick={() => workspace.readOnly ? setReadOnlyAction(`Create ${SURFACE_LABELS[surface]}`) : setReadOnlyAction(`Create ${SURFACE_LABELS[surface]}`)}>
            Create new
          </button>
        )}
      </div>

      {filtersOpen ? (
        <div className="captured-filter-panel" role="dialog" aria-label="Dashboard filters">
          <label><Search /> Search<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Filter ${SURFACE_LABELS[surface].toLowerCase()}`} /></label>
          <button type="button" onClick={() => { setQuery(""); setEnvironment("all"); }}>Clear all</button>
        </div>
      ) : null}

      {surface === "home" ? (
        <HomeSurface workspace={workspace} environment={environment} />
      ) : surface === "costs" ? (
        <CostsSurface workspace={workspace} environment={environment} />
      ) : surface === "tracing" && recordId ? (
        <RecordDetail record={workspace.collections.tracing.records.find((record) => record.id === recordId) ?? workspace.collections.tracing.records[0]} surface={surface} basePath={basePath} />
      ) : surface === "tracing" ? (
        <TracingSurface workspace={workspace} basePath={basePath} query={query} environment={environment} onReadOnly={handleAction} />
      ) : surface === "sessions" && recordId ? (
        <SessionDetailSurface workspace={workspace} sessionId={recordId} basePath={basePath} onReadOnly={handleAction} />
      ) : surface === "settings" ? (
        <SettingsSurface workspace={workspace} onReadOnly={handleAction} />
      ) : surface === "playground" ? (
        <PromptPlaygroundSurface workspace={workspace} onReadOnly={handleAction} />
      ) : surface === "dashboards" ? (
        <DashboardsSurface workspace={workspace} basePath={basePath} onReadOnly={handleAction} />
      ) : surface === "scores" ? (
        <ScoresSurface workspace={workspace} />
      ) : surface === "prompts" ? (
        <PromptsSurface workspace={workspace} basePath={basePath} onReadOnly={handleAction} />
      ) : surface === "evaluators" ? (
        <EvaluatorsSurface workspace={workspace} onReadOnly={handleAction} />
      ) : surface === "datasets" ? (
        <DatasetsSurface workspace={workspace} onReadOnly={handleAction} />
      ) : surface === "annotation-queues" ? (
        <AnnotationSurface workspace={workspace} onReadOnly={handleAction} />
      ) : surface === "alerts" ? (
        <AlertsSurface workspace={workspace} onReadOnly={handleAction} />
      ) : (
        <CollectionSurface
          workspace={workspace}
          surface={surface}
          basePath={basePath}
          query={query}
          environment={environment}
          recordId={recordId}
          onReadOnly={handleAction}
        />
      )}

      {readOnlyAction ? (
        <div className="captured-modal-backdrop" role="presentation">
          <section className="captured-modal" role="dialog" aria-modal="true" aria-labelledby="captured-modal-title">
            <button type="button" className="captured-modal-close" aria-label="Close" onClick={() => setReadOnlyAction(null)}><X /></button>
            <span>Sandbox boundary</span>
            <h2 id="captured-modal-title">{workspace.readOnly ? "This workspace is view only." : `${readOnlyAction} is ready in your live project.`}</h2>
            <p>{workspace.readOnly ? "Explore filters, records, dashboards, and prompt inputs safely. Build a real project to save changes, credentials, alerts, or evaluations." : "Use the corresponding live project workflow to save this change."}</p>
            <div>
              {workspace.readOnly ? <Link href="/cloud">Build a real project</Link> : null}
              <button type="button" onClick={() => setReadOnlyAction(null)}>Close</button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

function DashboardsSurface({ workspace, basePath, onReadOnly }: { workspace: DashboardWorkspace; basePath: string; onReadOnly: (action: string) => void }) {
  const [selected, setSelected] = useState("Cost Dashboard");
  const [layout, setLayout] = useState("grid");
  const dashboards = ["Cost Dashboard", "Agent Reliability Overview", "Production Quality"];
  return <main className="captured-dashboard-editor"><header><div><span>Dashboards</span><h2>{selected}</h2></div><div className="captured-dashboard-editor-actions"><select aria-label="Select dashboard" value={selected} onChange={(event) => setSelected(event.target.value)}>{dashboards.map((dashboard) => <option key={dashboard}>{dashboard}</option>)}</select><button type="button" className={layout === "grid" ? "is-active" : ""} onClick={() => setLayout("grid")}>Grid</button><button type="button" className={layout === "list" ? "is-active" : ""} onClick={() => setLayout("list")}>List</button><button type="button" onClick={() => onReadOnly("Create dashboard")}>New dashboard</button></div></header><div className={`captured-dashboard-widgets ${layout}`}><MetricPanel title="Total cost" subtitle="All environments · Past 7 days" value={`$${workspace.metrics.totalCost.toFixed(5)}`} /><MetricPanel title="Traces" subtitle="Successful and failed traces" value={workspace.metrics.traces.toLocaleString()} /><section className="captured-panel captured-cost-chart"><PanelHeading title="Cost by model" subtitle="Compare spend across providers and models" /><LineChart label="Cost over time" /></section><section className="captured-panel captured-users-cost"><PanelHeading title="Top users by cost" subtitle="Ranked by total model cost" /><div className="captured-user-bars">{workspace.collections.users.records.slice(0, 5).map((user, index) => <div key={user.id}><span style={{ width: `${92 - index * 13}%` }} /><button type="button">{user.id}</button><strong>${(0.169297 - index * 0.01831).toFixed(5)}</strong></div>)}</div></section></div><footer><Link href={`${basePath}/dashboards`}>Dashboard home</Link><button type="button" onClick={() => onReadOnly("Save dashboard layout")}>Save layout</button></footer></main>;
}

function ScoresSurface({ workspace }: { workspace: DashboardWorkspace }) {
  const [metric, setMetric] = useState("All scores");
  const scores = workspace.collections.scores.records;
  return <main className="captured-collection captured-scores-surface"><div className="captured-collection-summary"><div><strong>Scores</strong><span> Trace-linked quality and evaluation results</span></div><label>Metric <select aria-label="Score metric" value={metric} onChange={(event) => setMetric(event.target.value)}><option>All scores</option><option>groundedness</option><option>answer_relevance</option><option>policy_compliance</option></select></label></div><div className="captured-score-summary-grid"><MetricPanel title="Scores recorded" subtitle={metric} value={String(scores.length || workspace.metrics.scores)} /><MetricPanel title="Average score" subtitle="Selected metric" value="0.82" /><MetricPanel title="Pass rate" subtitle="Threshold ≥ 0.70" value="91%" /></div><div className="captured-table-scroll"><table><thead><tr><th>Score name</th><th>Value</th><th>Source trace</th><th>Evaluator</th><th>Created</th></tr></thead><tbody>{(scores.length ? scores : [{ id: "score-1", name: "groundedness", status: "passed", environment: "production", timestamp: "today", score: "0.92" }]).map((score) => <tr key={score.id}><td><strong>{score.name}</strong><small>{score.id}</small></td><td><span className="captured-status">{score.score ?? "0.82"}</span></td><td>QA support response</td><td>Quality evaluator</td><td>{score.timestamp}</td></tr>)}</tbody></table></div></main>;
}

function PromptsSurface({ workspace, basePath, onReadOnly }: { workspace: DashboardWorkspace; basePath: string; onReadOnly: (action: string) => void }) {
  const [tab, setTab] = useState<"text" | "chat">("text");
  const [draft, setDraft] = useState("You are a reliable support agent. Use verified context only.\n\n{{question}}");
  const prompts = workspace.collections.prompts.records;
  return <main className="captured-prompt-management"><header><div><span>Prompt Management</span><h2>Prompts</h2></div><button type="button" onClick={() => onReadOnly("Create prompt")}>Create prompt</button></header><div className="captured-prompt-management-grid"><section className="captured-prompt-list"><div className="captured-collection-summary"><span>{prompts.length || 3} prompts</span><button type="button">My views ▾</button></div>{(prompts.length ? prompts : [{ id: "support-agent", name: "support-agent", status: "production", environment: "all", timestamp: "2h ago" }, { id: "order-resolution", name: "order-resolution", status: "draft", environment: "sandbox", timestamp: "yesterday" }]).map((prompt) => <button type="button" className="captured-prompt-list-row" key={prompt.id} onClick={() => setDraft(`You are the ${prompt.name} agent.\n\n{{input}}`)}><strong>{prompt.name}</strong><small>{prompt.status} · updated {prompt.timestamp}</small></button>)}</section><section className="captured-prompt-editor"><div className="captured-prompt-editor-toolbar"><button type="button" aria-pressed={tab === "text"} className={tab === "text" ? "active" : ""} onClick={() => setTab("text")}>Text</button><button type="button" aria-pressed={tab === "chat"} className={tab === "chat" ? "active" : ""} onClick={() => setTab("chat")}>Chat</button><button type="button">Add prompt reference</button></div><label>Prompt name<input defaultValue="support-agent" /></label><textarea aria-label="Prompt content" value={draft} onChange={(event) => setDraft(event.target.value)} /><label>Commit message<textarea aria-label="Commit message" placeholder="Describe this prompt version" /></label><div><button type="button" onClick={() => onReadOnly("Save prompt version")}>Save version</button><Link href={`${basePath}/playground`}>Test in Playground ↗</Link></div></section></div></main>;
}

function EvaluatorsSurface({ workspace, onReadOnly }: { workspace: DashboardWorkspace; onReadOnly: (action: string) => void }) {
  const [enabledOnly, setEnabledOnly] = useState(false);
  const records = workspace.collections.evaluators.records.filter((record) => !enabledOnly || record.status === "active" || record.status === "enabled");
  return <main className="captured-collection captured-evaluators-surface"><div className="captured-collection-summary"><div><strong>Evaluators</strong><span> Reusable quality checks for traces</span></div><div className="captured-evaluator-actions"><button type="button" onClick={() => setEnabledOnly((value) => !value)}>{enabledOnly ? "All evaluators" : "Enabled only"}</button><button type="button" onClick={() => onReadOnly("Create evaluator")}>New evaluator</button></div></div><div className="captured-table-scroll"><table><thead><tr><th>Name</th><th>Status</th><th>Last 5 runs</th><th>Type</th><th>Total cost (7d)</th><th>Model</th><th>Updated</th><th /></tr></thead><tbody>{records.map((record) => <tr key={record.id}><td><Link href={`/playground/evaluators/${encodeURIComponent(record.id)}`}><strong>{record.name}</strong><small>{record.id}</small></Link></td><td><span className={`captured-status ${record.status}`}>{record.status}</span></td><td>✓ ✓ ✓ — ✓</td><td>LLM as a judge</td><td>{record.cost ?? "$0.0042"}</td><td>{record.model ?? workspace.models[1]}</td><td>{record.timestamp}</td><td><button type="button" onClick={() => onReadOnly(`Edit ${record.name}`)}>•••</button></td></tr>)}</tbody></table>{!records.length ? <div className="captured-empty">No evaluators match the current filter.</div> : null}</div></main>;
}

function DatasetsSurface({ workspace, onReadOnly }: { workspace: DashboardWorkspace; onReadOnly: (action: string) => void }) {
  const [search, setSearch] = useState("");
  const records = workspace.collections.datasets.records.filter((record) => `${record.name} ${record.id}`.toLowerCase().includes(search.toLowerCase()));
  return <main className="captured-collection captured-datasets-surface"><div className="captured-collection-summary"><div><strong>Datasets</strong><span> Curated evidence sets for repeatable evaluation</span></div><div className="captured-inline-actions"><input aria-label="Search datasets" placeholder="Search datasets" value={search} onChange={(event) => setSearch(event.target.value)} /><button type="button" onClick={() => onReadOnly("Create dataset")}>New dataset</button></div></div><div className="captured-table-scroll"><table><thead><tr><th>Name</th><th>Description</th><th>Items</th><th>Experiments</th><th>Created</th><th>Last run</th><th>Input schema</th><th>Expected output</th><th>Actions</th></tr></thead><tbody>{records.map((record) => <tr key={record.id}><td><Link href={`/playground/datasets/${encodeURIComponent(record.id)}`}><strong>{record.name}</strong><small>{record.id}</small></Link></td><td>Regression evidence set</td><td>24</td><td>3</td><td>{record.timestamp}</td><td>Today</td><td>JSON</td><td>JSON</td><td><button type="button" onClick={() => onReadOnly(`Manage ${record.name}`)}>•••</button></td></tr>)}</tbody></table>{!records.length ? <div className="captured-empty">No datasets match your search.</div> : null}</div></main>;
}

function AnnotationSurface({ workspace, onReadOnly }: { workspace: DashboardWorkspace; onReadOnly: (action: string) => void }) {
  const [queue, setQueue] = useState("Needs review");
  const records = workspace.collections["annotation-queues"].records;
  return <main className="captured-collection captured-annotation-surface"><div className="captured-collection-summary"><div><strong>Human Annotation</strong><span> Review traces that need a human decision</span></div><div className="captured-inline-actions"><select aria-label="Annotation queue" value={queue} onChange={(event) => setQueue(event.target.value)}><option>Needs review</option><option>Assigned to me</option><option>Completed</option></select><button type="button" onClick={() => onReadOnly("Create annotation queue")}>New queue</button></div></div><div className="captured-review-banner"><strong>{records.length || 12} traces ready for review</strong><span>Claim the next trace, score it, and leave a decision note.</span><button type="button" onClick={() => onReadOnly("Claim next trace")}>Claim next</button></div><div className="captured-table-scroll"><table><thead><tr><th>Trace</th><th>Queue</th><th>Status</th><th>Assignee</th><th>Last updated</th><th>Action</th></tr></thead><tbody>{(records.length ? records : [{ id: "review-1", name: "QA support response", status: "needs-review", environment: "production", timestamp: "5m ago" }]).map((record) => <tr key={record.id}><td><strong>{record.name}</strong><small>{record.id}</small></td><td>{queue}</td><td><span className="captured-status needs-review">Needs review</span></td><td>Unassigned</td><td>{record.timestamp}</td><td><button type="button" onClick={() => onReadOnly(`Review ${record.name}`)}>Open review</button></td></tr>)}</tbody></table></div></main>;
}

function AlertsSurface({ workspace, onReadOnly }: { workspace: DashboardWorkspace; onReadOnly: (action: string) => void }) {
  const [status, setStatus] = useState("all");
  const records = workspace.collections.alerts.records.filter((record) => status === "all" || record.status === status);
  return <main className="captured-collection captured-alerts-surface"><div className="captured-collection-summary"><div><strong>Alerts</strong><span> Notify your team when quality or cost changes</span></div><div className="captured-inline-actions"><select aria-label="Alert status" value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All statuses</option><option value="active">Active</option><option value="paused">Paused</option></select><button type="button" onClick={() => onReadOnly("Create alert")}>Add alert</button></div></div><div className="captured-alert-cards">{records.map((record) => <article key={record.id}><div><span className={`captured-status ${record.status}`}>{record.status}</span><h3>{record.name}</h3><p>Threshold condition · production environment</p></div><button type="button" onClick={() => onReadOnly(`Edit ${record.name}`)}>•••</button></article>)}</div>{!records.length ? <div className="captured-empty">No alerts match this status.</div> : null}</main>;
}

function TracingSurface({ workspace, basePath, query, environment, onReadOnly }: { workspace: DashboardWorkspace; basePath: string; query: string; environment: string; onReadOnly: (action: string) => void }) {
  const [view, setView] = useState<"table" | "chart">("table");
  const [preset, setPreset] = useState("all");
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState(["Start Time", "Type", "Name", "Trace Name", "Input", "Output", "Status", "Latency", "Cost"]);
  const [filterSearch, setFilterSearch] = useState("");
  const columns = ["Start Time", "Type", "Name", "Trace Name", "Input", "Output", "Metadata", "Status", "Latency", "Cost", "Model", "Environment"];
  const filterNames = ["Name", "Is Root Observation", "Type", "Environment", "Trace Name", "Session ID", "User ID", "Status", "Model", "Latency", "Cost"];
  const records = workspace.collections.tracing.records.filter((record) => {
    const matchesEnvironment = environment === "all" || record.environment === environment;
    const haystack = `${record.id} ${record.name} ${record.model} ${record.status}`.toLowerCase();
    const matchesQuery = !query || haystack.includes(query.toLowerCase());
    const matchesPreset = preset === "all" || (preset === "quality" ? Number(record.score ?? 0) >= 0.8 : preset === "slow" ? Number.parseFloat(record.latency ?? "0") >= 2 : Number.parseFloat(record.cost?.replace("$", "") ?? "0") >= 0.02);
    return matchesEnvironment && matchesQuery && matchesPreset;
  });
  const toggleColumn = (column: string) => setSelectedColumns((current) => current.includes(column) ? current.filter((item) => item !== column) : [...current, column]);
  return <main className="captured-tracing">
    <div className="captured-tracing-actions">
      {(["all", "quality", "slow", "cost"] as const).map((item) => <button key={item} type="button" className={preset === item ? "is-active" : ""} onClick={() => setPreset(item)}>{item === "all" ? "Filters" : item[0].toUpperCase() + item.slice(1)}</button>)}
      <button type="button" className={view === "table" ? "is-active" : ""} onClick={() => setView("table")}>▦ Table</button><button type="button" className={view === "chart" ? "is-active" : ""} onClick={() => setView("chart")}>▥ Chart</button>
      <div className="captured-tracing-columns"><button type="button" aria-expanded={columnsOpen} onClick={() => setColumnsOpen((open) => !open)}>Columns {selectedColumns.length}/16 ▾</button>{columnsOpen ? <div className="captured-column-menu" role="menu">{columns.map((column) => <label key={column}><input type="checkbox" checked={selectedColumns.includes(column)} onChange={() => toggleColumn(column)} />{column}</label>)}</div> : null}</div>
    </div>
    <div className="captured-tracing-layout">
      <aside className="captured-filter-rail"><div className="captured-filter-rail-heading"><strong>Filters</strong><button type="button" onClick={() => setFilterSearch("")}>Clear</button></div><label>Search filters<input value={filterSearch} onChange={(event) => setFilterSearch(event.target.value)} placeholder="Search filters" aria-label="Search filters" /></label>{filterNames.filter((name) => name.toLowerCase().includes(filterSearch.toLowerCase())).map((name) => <button className="captured-filter-row" type="button" key={name} onClick={() => name === "Environment" ? undefined : onReadOnly(`Open ${name} filter`)}><span>{name}</span><span>⌄</span></button>)}</aside>
      <section className="captured-tracing-results">{view === "chart" ? <div className="captured-trace-chart"><span>Count per bucket</span><div>{records.map((record, index) => <i key={record.id} style={{ height: `${28 + ((index * 19) % 65)}%` }} title={record.name} />)}</div></div> : <div className="captured-trace-table-wrap"><table><thead><tr>{selectedColumns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{records.map((record) => <tr key={record.id}>{selectedColumns.map((column) => <td key={column}>{renderTraceCell(column, record, basePath)}</td>)}</tr>)}</tbody></table>{records.length === 0 ? <div className="captured-empty">No traces match the current filters.</div> : null}<footer className="captured-table-footer">Total {records.length} · Rows per page 50 · Page 1</footer></div>}</section>
    </div>
  </main>;
}

function renderTraceCell(column: string, record: WorkspaceRecord, basePath: string) {
  switch (column) {
    case "Start Time": return record.timestamp;
    case "Type": return "generation";
    case "Name": return <Link href={`${basePath}/tracing/${encodeURIComponent(record.id)}`}>{record.name}</Link>;
    case "Trace Name": return record.name;
    case "Input": return record.input ?? "—";
    case "Output": return record.output ?? "—";
    case "Metadata": return "{ }";
    case "Status": return record.status;
    case "Latency": return record.latency ?? "—";
    case "Cost": return record.cost ?? "—";
    case "Model": return record.model ?? "—";
    case "Environment": return record.environment ?? "—";
    default: return "—";
  }
}

function SessionDetailSurface({ workspace, sessionId, basePath, onReadOnly }: { workspace: DashboardWorkspace; sessionId: string; basePath: string; onReadOnly: (action: string) => void }) {
  const session = workspace.collections.sessions.records.find((record) => record.id === sessionId) ?? workspace.collections.sessions.records[0];
  const events = workspace.collections.tracing.records.filter((record) => record.sessionId === session?.sessionId).slice(0, 4);
  return <main className="captured-session-detail"><div className="captured-session-heading"><a href={`${basePath}/sessions`}>‹ Sessions</a><strong>Session {session?.id}</strong><span>Total traces: {events.length || 2}</span><span>Total cost: {session?.cost ?? "$0.038008"}</span><button type="button" onClick={() => onReadOnly("Annotate session")}>Annotate</button></div><div className="captured-session-columns"><section className="captured-session-events">{(events.length ? events : [session]).map((event, index) => <article key={event?.id ?? index}><small>{event?.name ?? "generation"} · {event?.timestamp ?? "today"}</small><h3>Formatted <span>JSON</span></h3><label>Input</label><pre>{event?.input ?? "What is the status of my request?"}</pre><label>Output</label><pre className="captured-output">{event?.output ?? "Completed with linked evidence and a verified final response."}</pre></article>)}</section><aside className="captured-session-scores"><div className="captured-linked-trace">▤ QA support response <small>Open trace ↗</small></div>{["groundedness", "answer_relevance", "policy_compliance", "tool_result_used"].map((score, index) => <div key={score} className="captured-score-row"><span>{score}</span><strong>{index === 1 ? "0.70" : index === 2 ? "true" : "false"}</strong><small>◯</small></div>)}<button type="button" onClick={() => onReadOnly("Add session to dataset")}>＋ Add to datasets</button></aside></div></main>;
}

function HomeSurface({ workspace, environment }: { workspace: DashboardWorkspace; environment: string }) {
  const traces = workspace.collections.tracing.records.filter((record) => environment === "all" || record.environment === environment);
  const users = workspace.collections.users.records;
  return (
    <main className="captured-home-grid">
      <MetricPanel title="Total Count Traces" subtitle="Shows the count of Traces" value={workspace.metrics.traces.toLocaleString()} />
      <MetricPanel title="Total Count Observations" subtitle="Shows the count of Observations" value={workspace.metrics.observations.toLocaleString()} />
      <section className="captured-panel captured-model-chart">
        <PanelHeading title="Cost by Model Name" subtitle="Total cost broken down by model name" />
        <div className="captured-bars" aria-label="Cost by model chart">
          {[86, 4, 2, 1].map((height, index) => <span key={workspace.models[index + 1] ?? index} style={{ height: `${height}%` }}><small>{workspace.models[index + 1] ?? "tools"}</small></span>)}
        </div>
      </section>
      <section className="captured-panel captured-cost-chart">
        <PanelHeading title="Total costs" subtitle="Total cost across all use cases" />
        <LineChart label={`$${workspace.metrics.totalCost.toFixed(5)} total`} />
      </section>
      <section className="captured-panel captured-users-cost">
        <PanelHeading title="Top Users by Cost" subtitle="Aggregated model cost by trace.userId" />
        <div className="captured-user-bars">
          {users.slice(0, 6).map((user, index) => <div key={user.id}><span style={{ width: `${94 - index * 11}%` }} /><button type="button" onClick={() => void navigator.clipboard?.writeText(user.id)}>{user.id}<Copy /></button><strong>${(0.169297 - index * 0.01831).toFixed(6)}</strong></div>)}
        </div>
      </section>
      <section className="captured-panel captured-recent-traces">
        <PanelHeading title="Recent traces" subtitle={`${traces.length} visible records · ${environment === "all" ? "all environments" : environment}`} />
        <div className="captured-compact-table">
          {traces.slice(0, 5).map((trace) => <div key={trace.id}><span className={`captured-status-dot ${trace.status.toLowerCase()}`} /><span>{trace.name}</span><small>{trace.model}</small><strong>{trace.cost}</strong></div>)}
        </div>
      </section>
      <section className="captured-panel captured-home-wide-chart"><PanelHeading title="Top 20 Use Cases (Observation) by Cost" subtitle="Aggregated model cost by observation name" /><HorizontalBars labels={["llm_request", "agent_step", "tool_request", "retrieval", "voice_response"]} /></section>
      <section className="captured-panel captured-home-wide-chart"><PanelHeading title="Top 20 Use Cases (Trace) by Cost" subtitle="Aggregated model cost by trace name" /><HorizontalBars labels={traces.slice(0, 5).map((trace) => trace.name)} /></section>
      <section className="captured-panel captured-environment-chart"><PanelHeading title="Cost by Environment" subtitle="Total cost broken down by trace environment" /><div className="captured-donut"><span>$1.239228</span><small>Total</small></div></section>
      <section className="captured-panel captured-home-wide-chart"><PanelHeading title="P95 Cost per Trace" subtitle="95th percentile of cost for each trace" /><LineChart label="$0.12" /></section>
      <section className="captured-panel captured-home-wide-chart"><PanelHeading title="P95 Output Cost per Observation" subtitle="95th percentile of output cost for each observation" /><LineChart label="$0.006" /></section>
      <section className="captured-panel captured-home-wide-chart"><PanelHeading title="P95 Input Cost per Observation" subtitle="95th percentile of input cost for each observation" /><LineChart label="$0.028" /></section>
    </main>
  );
}

function CostsSurface({ workspace, environment }: { workspace: DashboardWorkspace; environment: string }) {
  const traces = workspace.collections.tracing.records.filter((record) => environment === "all" || record.environment === environment);
  const total = traces.reduce((sum, record) => sum + Number((record.cost ?? "$0").replace("$", "")), 0);
  return <main className="captured-home-grid">
    <MetricPanel title="Total costs" subtitle="Total cost across the selected period" value={`$${total.toFixed(5)}`} />
    <MetricPanel title="Cost per trace" subtitle="Average cost for visible traces" value={`$${(traces.length ? total / traces.length : 0).toFixed(5)}`} />
    <section className="captured-panel captured-cost-chart"><PanelHeading title="Cost over time" subtitle="Total cost across all use cases" /><LineChart label={`$${total.toFixed(5)} total`} /></section>
    <section className="captured-panel captured-users-cost"><PanelHeading title="Top 20 Users by Cost" subtitle="Aggregated model cost by trace.userId" /><div className="captured-user-bars">{traces.slice(0, 6).map((record, index) => <div key={record.id}><span style={{ width: `${94 - index * 11}%` }} /><button type="button">{record.userId ?? "anonymous"}</button><strong>{record.cost ?? "$0"}</strong></div>)}</div></section>
    <section className="captured-panel captured-home-wide-chart"><PanelHeading title="Cost by Environment" subtitle="Total cost broken down by trace environment" /><HorizontalBars labels={Array.from(new Set(traces.map((record) => record.environment)))} /></section>
    <section className="captured-panel captured-home-wide-chart"><PanelHeading title="P95 Cost per Trace" subtitle="95th percentile of cost for each trace" /><LineChart label={traces.length ? traces[Math.floor(traces.length * .95)]?.cost ?? "$0" : "$0"} /></section>
  </main>;
}

function HorizontalBars({ labels }: { labels: string[] }) {
  return <div className="captured-horizontal-bars">{labels.map((label, index) => <div key={label}><span style={{ width: `${86 - index * 13}%` }} /><small>{label}</small><strong>${(1.4 / (index + 2)).toFixed(2)}</strong></div>)}</div>;
}

function MetricPanel({ title, subtitle, value }: { title: string; subtitle: string; value: string }) {
  return <section className="captured-panel captured-metric"><PanelHeading title={title} subtitle={subtitle} /><strong>{value}</strong></section>;
}

function PanelHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return <header className="captured-panel-heading"><h2>{title}</h2><p>{subtitle}</p></header>;
}

function LineChart({ label }: { label: string }) {
  return <div className="captured-line-chart"><span className="captured-chart-label">{label}</span><svg viewBox="0 0 760 230" preserveAspectRatio="none" aria-label="Total cost over time"><polyline points="0,210 45,205 90,170 135,218 180,176 225,165 270,172 315,115 360,148 405,120 450,154 495,96 540,132 585,118 630,36 675,104 720,78 760,18" /></svg></div>;
}

function CollectionSurface({ workspace, surface, basePath, query, environment, recordId, onReadOnly }: { workspace: DashboardWorkspace; surface: Exclude<WorkspaceSurface, "home" | "settings" | "playground">; basePath: string; query: string; environment: string; recordId?: string; onReadOnly: (action: string) => void }) {
  const [pageSize, setPageSize] = useState("50");
  const collection = workspace.collections[surface];
  const filtered = collection.records.filter((record) => (environment === "all" || record.environment === environment) && (!query || `${record.id} ${record.name} ${record.status}`.toLowerCase().includes(query.toLowerCase())));
  const visible = filtered.slice(0, Number(pageSize));
  const record = recordId ? collection.records.find((candidate) => candidate.id === recordId) : null;
  if (record) return <RecordDetail record={record} surface={surface} basePath={basePath} />;
  return (
    <main className="captured-collection">
      <div className="captured-collection-summary"><span>{collection.description}</span><strong>{filtered.length} results</strong></div>
      <div className="captured-table-scroll">
        <table>
          <thead><tr><th>Name</th><th>Status</th><th>Environment</th><th>{surface === "scores" ? "Score" : "Model"}</th><th>Updated</th><th /></tr></thead>
          <tbody>{visible.map((record) => <tr key={record.id}>
            <td><Link href={`${surfacePath(basePath, surface)}/${encodeURIComponent(record.id)}`}><strong>{record.name}</strong><small>{record.id}</small></Link></td>
            <td><span className={`captured-status ${record.status.toLowerCase().replaceAll(" ", "-")}`}>{record.status}</span></td>
            <td>{record.environment}</td>
            <td>{surface === "scores" ? record.score : record.model ?? "—"}</td>
            <td>{record.timestamp}</td>
            <td><button type="button" onClick={() => workspace.readOnly ? onReadOnly(`Edit ${record.name}`) : onReadOnly(`Edit ${record.name}`)}>•••</button></td>
          </tr>)}</tbody>
        </table>
      </div>
      {!visible.length ? <div className="captured-empty">No records match the current filters.</div> : null}
      <footer className="captured-table-footer"><span>Showing {visible.length} of {filtered.length}</span><label>Rows per page <select aria-label="Rows per page" value={pageSize} onChange={(event) => setPageSize(event.target.value)}><option value="25">25</option><option value="50">50</option><option value="100">100</option></select></label><span>Page 1</span></footer>
    </main>
  );
}

function RecordDetail({ record, surface, basePath }: { record: WorkspaceRecord; surface: WorkspaceSurface; basePath: string }) {
  return <main className="captured-detail"><Link href={surfacePath(basePath, surface)}>← Back to {SURFACE_LABELS[surface]}</Link><section><span>{surface} / {record.id}</span><h2>{record.name}</h2><div className="captured-detail-grid"><Detail label="Status" value={record.status} /><Detail label="Environment" value={record.environment} /><Detail label="Model" value={record.model ?? "Not applicable"} /><Detail label="Latency" value={record.latency ?? "—"} /><Detail label="Cost" value={record.cost ?? "—"} /><Detail label="Score" value={record.score ?? "—"} /></div><div className="captured-io"><article><span>Input</span><pre>{record.input ?? `Open ${record.name}`}</pre></article><article><span>Output</span><pre>{record.output ?? "This deterministic Sandbox record is connected to the selected Tracify surface."}</pre></article></div></section></main>;
}

function Detail({ label, value }: { label: string; value: string }) { return <div><span>{label}</span><strong>{value}</strong></div>; }

function PromptPlaygroundSurface({ workspace, onReadOnly }: { workspace: DashboardWorkspace; onReadOnly: (action: string) => void }) {
  const [prompt, setPrompt] = useState("You are a support agent. Answer {{question}} using only verified context.");
  const [question, setQuestion] = useState("Where is my order?");
  const [output, setOutput] = useState("Run the prompt to inspect the model response.");
  return <main className="captured-prompt-playground"><section><PanelHeading title="Prompt" subtitle="Test variables and model settings" /><textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} /><input value={question} onChange={(event) => setQuestion(event.target.value)} aria-label="Question variable" /><button type="button" onClick={() => setOutput(`Your order was located with verified tool evidence.\n\nModel: ${workspace.models[1]}\nEnvironment: sandbox`)}>Run prompt</button></section><section><PanelHeading title="Generation" subtitle="Deterministic Sandbox response" /><pre>{output}</pre><button type="button" onClick={() => onReadOnly("Save prompt version")}>Save version</button></section></main>;
}

function SettingsSurface({ workspace, onReadOnly }: { workspace: DashboardWorkspace; onReadOnly: (action: string) => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabs = ["General", "Members", "API Keys", "LLM Connections", "Model Definitions", "MCP & CLI", "Scores", "Integrations", "Notifications", "Exports", "Batch Actions", "Audit log"];
  const requestedTab = searchParams.get("tab");
  const normalizedTab = requestedTab && tabs.includes(requestedTab) ? requestedTab : "General";
  const [tab, setTab] = useState(normalizedTab);
  function selectTab(nextTab: string) {
    setTab(nextTab);
    const next = new URLSearchParams(searchParams.toString());
    if (nextTab === "General") next.delete("tab");
    else next.set("tab", nextTab);
    const query = next.toString();
    window.history.replaceState(null, "", query ? `${pathname}?${query}` : pathname);
  }
  return <main className="captured-settings"><nav>{tabs.map((item) => <button key={item} type="button" className={tab === item ? "active" : ""} onClick={() => selectTab(item)}>{item}</button>)}</nav><section><span>Project settings / {tab}</span><h2>{tab === "General" ? workspace.project.name : tab}</h2>{tab === "General" ? <><label>Project name<input value={workspace.project.name} readOnly /></label><label>Project ID<input value={workspace.project.id} readOnly /></label><div className="captured-settings-actions"><button type="button" onClick={() => onReadOnly("Save project settings")}>Save changes</button><button type="button" onClick={() => onReadOnly("Open LLM Connections")}>Open LLM Connections</button></div></> : <><p className="captured-settings-placeholder">{tab} controls are available in the live project workspace.</p><button type="button" onClick={() => onReadOnly(`Open ${tab}`)}>Open {tab}</button></>}</section></main>;
}
