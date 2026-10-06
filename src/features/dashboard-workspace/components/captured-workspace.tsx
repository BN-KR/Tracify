"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import {
  Bot,
  ChevronDown,
  Copy,
  ExternalLink,
  Filter,
  PanelLeft,
  Pencil,
  RefreshCw,
  Search,
  Timer,
  ThumbsDown,
  DollarSign,
  X,
} from "lucide-react";

import type {
  DashboardWorkspace,
  WorkspaceRecord,
  WorkspaceSurface,
} from "../contracts";
import { useLiveWorkspaceIdentity } from "../live-workspace-context";

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
  "annotation-queues": "Annotation Queues",
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

function subscribeToHydration(callback: () => void) {
  const timer = window.setTimeout(callback, 0);
  return () => window.clearTimeout(timer);
}

function getHydrationSnapshot() {
  return true;
}

function getServerHydrationSnapshot() {
  return false;
}

export function CapturedWorkspace({
  workspace,
  segments = [],
  children,
  childrenOnly = false,
  toolbarTitle,
  onPromptSave,
  onEvaluatorCreate,
  onDatasetCreate,
  onAlertCreate,
  onDashboardCreate,
  onProjectSettingsSave,
  onAnnotationClaim,
  onSessionAnnotate,
  onSessionAddToDataset,
  onEvaluatorToggle,
  onAlertStateChange,
  onAnnotationReview,
}: {
  workspace: DashboardWorkspace;
  segments?: string[];
  children?: ReactNode;
  childrenOnly?: boolean;
  toolbarTitle?: string;
  onPromptSave?: (input: { promptId?: string; name: string; type: "text" | "chat"; content: string }) => Promise<void>;
  onEvaluatorCreate?: (input: { name: string; type: "code" | "llm_judge"; criteria: string }) => Promise<void>;
  onDatasetCreate?: (input: { name: string; description: string }) => Promise<void>;
  onAlertCreate?: (input: { name: string; metric: string; threshold: string }) => Promise<void>;
  onDashboardCreate?: (input: { name: string }) => Promise<void>;
  onProjectSettingsSave?: (input: { name: string }) => Promise<void>;
  onAnnotationClaim?: () => Promise<string | null>;
  onSessionAnnotate?: (input: { sessionId: string }) => Promise<void>;
  onSessionAddToDataset?: (input: { sessionId: string; datasetId: string }) => Promise<void>;
  onEvaluatorToggle?: (input: { evaluatorId: string; active: boolean }) => Promise<void>;
  onAlertStateChange?: (input: { alertId: string; state: "active" | "resolved" | "muted" }) => Promise<void>;
  onAnnotationReview?: (input: { annotationId: string; label: string; score?: number; notes: string }) => Promise<void>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    getHydrationSnapshot,
    getServerHydrationSnapshot,
  );
  const liveIdentity = useLiveWorkspaceIdentity();
  const effectiveWorkspace = workspace.mode === "live" && liveIdentity
    ? { ...workspace, project: liveIdentity }
    : workspace;
  const surface = parseSurface(segments);
  const recordId = segments[1];
  const basePath = effectiveWorkspace.mode === "sandbox" ? "/playground" : `/dashboard/${effectiveWorkspace.project.id}`;
  const [range, setRange] = useState(() => searchParams.get("range") ?? "1d");
  const [environment, setEnvironment] = useState(() => searchParams.get("environment") ?? "all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  function updateRouteState(key: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (!value || value === "all" || (key === "range" && value === "1d")) next.delete(key);
    else next.set(key, value);
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }
  const [readOnlyAction, setReadOnlyAction] = useState<string | null>(null);
  function handleAction(action: string) {
    if (effectiveWorkspace.mode === "live") {
      const liveRoutes: Array<[string, string]> = [
        ["Create dashboard", `${basePath}/dashboards/new`],
        ["Create Dashboards", `${basePath}/dashboards/new`],
        ["Create alert", `${basePath}/alerts/new`],
        ["Create evaluator", `${basePath}/evaluators?view=create`],
        ["Create Evaluators", `${basePath}/evaluators?view=create`],
        ["Create dataset", `${basePath}/datasets?view=create`],
        ["Create Datasets", `${basePath}/datasets?view=create`],
        ["Create prompt", `${basePath}/prompts?view=create`],
        ["Create Prompts", `${basePath}/prompts?view=create`],
        ["Create Alerts", `${basePath}/alerts?view=create`],
        ["Create Sessions", `${basePath}/sessions`],
        ["Create Users", `${basePath}/users`],
        ["Create Experiments", `${basePath}/experiments`],
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
    <div className="captured-workspace" data-workspace-mode={effectiveWorkspace.mode} data-workspace-surface={surface} data-hydrated={hydrated ? "true" : "false"}>
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
          <span className="captured-mobile-logo" aria-hidden="true"><i /></span>
          <button type="button" className="captured-crumb" onClick={() => window.dispatchEvent(new Event("tracify:open-project-switcher"))}>
            {effectiveWorkspace.project.organizationName}<ChevronDown />
          </button>
          <span>/</span>
          <button type="button" className="captured-crumb" onClick={() => window.dispatchEvent(new Event("tracify:open-project-switcher"))}>
            {effectiveWorkspace.project.name}<ChevronDown />
          </button>
        </div>
        <div className="captured-workspace-header-actions">
          <label className="captured-range">
            <select aria-label="Dashboard time range" value={range} onChange={(event) => { const value = event.target.value; setRange(value); updateRouteState("range", value); }}>
              <option value="1d">1d</option>
              <option value="7d">7d</option>
              <option value="30d">30d</option>
              <option value="90d">90d</option>
            </select>
            <span>{range === "1d" ? "Past 1 day" : `Past ${range.slice(0, -1)} days`}</span><ChevronDown />
          </label>
          {surface === "tracing" ? <><button type="button" className="captured-refresh-icon" aria-label="Refresh traces" onClick={() => handleAction("Refresh traces")}><RefreshCw /></button><button type="button" className="captured-refresh-control" aria-label="Auto refresh off" onClick={() => handleAction("Change auto refresh")}><span>Off</span><ChevronDown /></button></> : null}
          <button type="button" className="captured-assistant" onClick={() => window.dispatchEvent(new Event("tracify:open-command"))}>
            <Bot /> Assistant <kbd>Ctrl I</kbd>
          </button>
        </div>
      </header>

      <div className="captured-workspace-toolbar">
        <h1>{toolbarTitle ?? (surface === "settings" ? "Project Settings" : SURFACE_LABELS[surface])}</h1>
        {surface === "playground" ? <div className="captured-playground-header-actions"><button type="button">⌕ Find</button><span>1 window</span><button type="button">▷ Run all <kbd>Ctrl ↵</kbd></button><button type="button">☷ Reset playground</button></div> : surface === "alerts" ? <><button type="button" className="captured-control" aria-expanded={filtersOpen} onClick={() => setFiltersOpen((current) => !current)}><Filter /> Filters <ChevronDown /></button><button type="button" className="captured-icon-button" aria-label="Alert insights" onClick={() => handleAction("Open alert insights")}>ϟ</button></> : surface !== "tracing" && surface !== "sessions" && surface !== "users" ? <><label className="captured-control">
          <span>Env</span>
          <select aria-label="Environment" value={environment} onChange={(event) => { const value = event.target.value; setEnvironment(value); updateRouteState("environment", value); }}>
            {effectiveWorkspace.environments.map((option) => <option key={option} value={option}>{option === "all" ? "default" : option}</option>)}
          </select>
          <ChevronDown />
        </label>
        <button type="button" className="captured-control" aria-expanded={filtersOpen} onClick={() => setFiltersOpen((current) => !current)}>
          <Filter /> Filters <ChevronDown />
        </button></> : null}
        <div className="captured-toolbar-spacer" />
        {surface === "home" ? (
          <>
            <span className="captured-dashboard-name"><span className="captured-mark" />Cost Dashboard</span>
            <Link className="captured-icon-button" href={surfacePath(basePath, "dashboards")} aria-label="Edit this dashboard in Dashboards"><Pencil /></Link>
            {effectiveWorkspace.mode === "live" ? <Link className="captured-primary-action" href={`${basePath}/quickstart`}>Configure Tracing <ExternalLink /></Link> : null}
          </>
        ) : surface === "tracing" || surface === "sessions" || surface === "playground" || surface === "users" ? null : (
          <button type="button" className="captured-primary-action" onClick={() => effectiveWorkspace.readOnly ? setReadOnlyAction(`Create ${surface === "alerts" ? "alert" : SURFACE_LABELS[surface]}`) : setReadOnlyAction(`Create ${surface === "alerts" ? "alert" : SURFACE_LABELS[surface]}`)}>
            {surface === "alerts" ? "New Alert" : "Create new"}
          </button>
        )}
      </div>

      {surface === "tracing" ? (
        <div className="captured-tracing-query">
          <label aria-label="Trace query"><span>name: (image-generator OR sentiment-classifier OR handle-chatbot-message OR voice-conversation)</span><input value={query} onChange={(event) => { const value = event.target.value; setQuery(value); updateRouteState("q", value); }} placeholder="Search traces" /></label>
          <button type="button" aria-label="Ask AI" onClick={() => handleAction("Open Assistant")}>✣ Ask AI</button>
        </div>
      ) : null}

      {filtersOpen ? (
        <div className="captured-filter-panel" role="dialog" aria-label="Dashboard filters">
          <label><Search /> Search<input value={query} onChange={(event) => { const value = event.target.value; setQuery(value); updateRouteState("q", value); }} placeholder={`Filter ${SURFACE_LABELS[surface].toLowerCase()}`} /></label>
          <button type="button" onClick={() => { setQuery(""); setEnvironment("all"); updateRouteState("q", ""); updateRouteState("environment", "all"); }}>Clear all</button>
        </div>
      ) : null}

      {!childrenOnly ? (surface === "home" ? (
        <HomeSurface workspace={workspace} environment={environment} />
      ) : surface === "costs" ? (
        <CostsSurface workspace={workspace} environment={environment} />
      ) : surface === "tracing" && recordId ? (
        <RecordDetail record={effectiveWorkspace.collections.tracing.records.find((record) => record.id === recordId) ?? effectiveWorkspace.collections.tracing.records[0]} surface={surface} basePath={basePath} />
      ) : surface === "tracing" ? (
        <TracingSurface workspace={workspace} basePath={basePath} query={query} environment={environment} onReadOnly={handleAction} />
      ) : surface === "sessions" && recordId ? (
        <SessionDetailSurface workspace={workspace} sessionId={recordId} basePath={basePath} onReadOnly={handleAction} onAnnotate={onSessionAnnotate} onAddToDataset={onSessionAddToDataset} />
      ) : surface === "settings" ? (
        <SettingsSurface workspace={workspace} onReadOnly={handleAction} onSave={onProjectSettingsSave} />
      ) : surface === "playground" ? (
        <PromptPlaygroundSurface workspace={workspace} onReadOnly={handleAction} />
      ) : surface === "dashboards" ? (
        <DashboardsSurface workspace={workspace} basePath={basePath} dashboardId={recordId} onReadOnly={handleAction} onCreate={onDashboardCreate} />
      ) : surface === "scores" ? (
        <ScoresSurface workspace={workspace} />
      ) : surface === "prompts" ? (
        <PromptsSurface workspace={workspace} basePath={basePath} onReadOnly={handleAction} onPromptSave={onPromptSave} />
      ) : surface === "evaluators" ? (
        <EvaluatorsSurface workspace={workspace} basePath={basePath} onReadOnly={handleAction} onCreate={onEvaluatorCreate} onToggle={onEvaluatorToggle} />
      ) : surface === "datasets" ? (
        <DatasetsSurface workspace={workspace} basePath={basePath} onReadOnly={handleAction} onCreate={onDatasetCreate} />
      ) : surface === "experiments" ? (
        <ExperimentsSurface workspace={workspace} basePath={basePath} recordId={recordId} onReadOnly={handleAction} />
      ) : surface === "annotation-queues" ? (
        <AnnotationSurface workspace={workspace} onReadOnly={handleAction} onClaim={onAnnotationClaim} onReview={onAnnotationReview} />
      ) : surface === "alerts" ? (
        <AlertsSurface workspace={workspace} onReadOnly={handleAction} onCreate={onAlertCreate} onStateChange={onAlertStateChange} />
      ) : surface === "sessions" ? (
        <SessionsSurface workspace={workspace} basePath={basePath} recordId={recordId} onReadOnly={handleAction} />
      ) : surface === "users" ? (
        <UsersSurface workspace={workspace} basePath={basePath} recordId={recordId} />
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
      )) : null}

      {children ? <div className="captured-route-content">{children}</div> : null}

      {readOnlyAction ? (
        <div className="captured-modal-backdrop" role="presentation">
          <section className="captured-modal" role="dialog" aria-modal="true" aria-labelledby="captured-modal-title">
            <button type="button" className="captured-modal-close" aria-label="Close" onClick={() => setReadOnlyAction(null)}><X /></button>
            <span>Sandbox boundary</span>
            <h2 id="captured-modal-title">{effectiveWorkspace.readOnly ? "This workspace is view only." : `${readOnlyAction} is ready in your live project.`}</h2>
            <p>{effectiveWorkspace.readOnly ? "Explore filters, records, dashboards, and prompt inputs safely. Build a real project to save changes, credentials, alerts, or evaluations." : "Use the corresponding live project workflow to save this change."}</p>
            <div>
              {effectiveWorkspace.readOnly ? <Link href="/cloud">Build a real project</Link> : null}
              <button type="button" onClick={() => setReadOnlyAction(null)}>Close</button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

function DashboardsSurface({ workspace, basePath, dashboardId, onReadOnly, onCreate }: { workspace: DashboardWorkspace; basePath: string; dashboardId?: string; onReadOnly: (action: string) => void; onCreate?: (input: { name: string }) => Promise<void> }) {
  const dashboardRecord = dashboardId ? workspace.collections.dashboards.records.find((record) => record.id === dashboardId) : undefined;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState(() => searchParams.get("dashboard") ?? dashboardRecord?.name ?? "Cost Dashboard");
  const [layout, setLayout] = useState(() => searchParams.get("layout") === "list" ? "list" : "grid");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const creating = searchParams.get("view") === "create" || dashboardId === "new";
  const dashboards = Array.from(new Set([...(workspace.collections.dashboards.records.map((record) => record.name)), "Cost Dashboard", "Agent Reliability Overview", "Production Quality"]));
  useEffect(() => {
    const next = new URLSearchParams(searchParams.toString());
    if (selected) next.set("dashboard", selected);
    if (layout === "grid") next.delete("layout"); else next.set("layout", layout);
    const nextQuery = next.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  }, [layout, pathname, router, searchParams, selected]);
  async function save() { if (!onCreate) { onReadOnly("Create dashboard"); return; } setSaving(true); setNotice(null); try { await onCreate({ name }); setNotice("Dashboard created"); } catch (error) { setNotice(error instanceof Error ? error.message : "Unable to create dashboard"); } finally { setSaving(false); } }
  if (creating) return <main className="captured-dashboard-editor"><header><div><span>Dashboards</span><h2>New dashboard</h2></div><Link href={`${basePath}/dashboards`}>Cancel</Link></header><form className="captured-editor-form" onSubmit={(event) => { event.preventDefault(); void save(); }}><label>Dashboard name<input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Agent reliability" /></label><button type="submit" disabled={saving}>{saving ? "Saving…" : "Create dashboard"}</button>{notice ? <p role="status">{notice}</p> : null}</form></main>;
  if (!dashboardId) { const names = ["User Intent & Guardrails", "Score Monitoring Prod", "Tracify Agent Dashboard", "Tracify Home", "Tracify Cost Dashboard", "Tracify Usage Management", "Tracify Latency Dashboard"]; const descriptions = ["", "Overview of scoring outcomes of our production instance", "Monitor agent tool usage: total tool calls, most-called tools, tool errors and latency, and observation type breakdowns.", "Overview of traces, costs, scores, usage, and latencies in this project. Shown on the project home page.", "Review your LLM costs.", "Track usage metrics across traces, observations, and scores to manage resource allocation.", "Monitor latency metrics across traces and generations for performance optimization."]; return <main className="captured-dashboards-reference"><nav><button type="button" className="active">Dashboards</button><button type="button">Widgets</button></nav><div className="captured-dashboards-table"><table><thead><tr><th>Name</th><th>Description</th></tr></thead><tbody>{names.map((name, index) => <tr key={name}><td><Link href={`${basePath}/dashboards/${encodeURIComponent(name)}`}>{name}</Link></td><td>{descriptions[index]}</td></tr>)}</tbody></table></div><footer className="captured-table-footer"><span>Rows <strong>50</strong>⌄</span><span>Page <strong>1</strong> of 1</span><button type="button" disabled>‹</button><button type="button" disabled>›</button></footer></main>; }
  return <main className="captured-dashboard-editor"><header><div><span>Dashboards</span><h2>{selected}</h2></div><div className="captured-dashboard-editor-actions"><select aria-label="Select dashboard" value={selected} onChange={(event) => setSelected(event.target.value)}>{dashboards.map((dashboard) => <option key={dashboard}>{dashboard}</option>)}</select><button type="button" className={layout === "grid" ? "is-active" : ""} onClick={() => setLayout("grid")}>Grid</button><button type="button" className={layout === "list" ? "is-active" : ""} onClick={() => setLayout("list")}>List</button><Link className="captured-button" href={`${basePath}/dashboards/new`}>New dashboard</Link></div></header><div className={`captured-dashboard-widgets ${layout}`}><MetricPanel title="Total cost" subtitle="All environments · Past 7 days" value={`$${workspace.metrics.totalCost.toFixed(5)}`} /><MetricPanel title="Traces" subtitle="Successful and failed traces" value={workspace.metrics.traces.toLocaleString()} /><section className="captured-panel captured-cost-chart"><PanelHeading title="Cost by model" subtitle="Compare spend across providers and models" /><LineChart label="Cost over time" /></section><section className="captured-panel captured-users-cost"><PanelHeading title="Top users by cost" subtitle="Ranked by total model cost" /><div className="captured-user-bars">{workspace.collections.users.records.slice(0, 5).map((user, index) => <div key={user.id}><span style={{ width: `${92 - index * 13}%` }} /><button type="button">{user.id}</button><strong>${(0.169297 - index * 0.01831).toFixed(5)}</strong></div>)}</div></section></div><footer><Link href={`${basePath}/dashboards`}>Dashboard home</Link><button type="button" onClick={() => onReadOnly("Save dashboard layout")}>Save layout</button></footer></main>;
}

function ScoresSurface({ workspace }: { workspace: DashboardWorkspace }) {
  const [metric, setMetric] = useState("All scores");
  const scores = workspace.collections.scores.records;
  return <main className="captured-scores-reference"><nav className="captured-scores-tabs"><button type="button" className="active">Scores</button><button type="button">Analytics</button></nav><div className="captured-scores-actions"><button type="button">⌕ Filters</button><button type="button">My Views <span>1</span></button><button type="button" className="active">▦ Table</button><button type="button">▥ Chart</button><label><select aria-label="Score metric" value={metric} onChange={(event) => setMetric(event.target.value)}><option>All scores</option><option>groundedness</option><option>answer_relevance</option></select></label><div className="captured-scores-columns"><button type="button">Columns 8/20</button><button type="button" aria-label="Table options">▤</button></div></div><div className="captured-scores-chart"><span>Count⌄</span><div /></div><div className="captured-scores-table"><table><thead><tr><th> </th><th>Timestamp ▼</th><th>Name</th><th>Value</th></tr></thead><tbody>{(scores.length ? scores : [{ id: "score-1", name: "groundedness", status: "passed", environment: "production", timestamp: "2026-09-06 15:07:07", score: "0.92" }]).slice(0, 20).map((score) => <tr key={score.id}><td><input type="checkbox" aria-label={`Select ${score.name}`} /></td><td>{score.timestamp}</td><td>{score.name}</td><td>{score.score ?? "False"}</td></tr>)}</tbody></table></div><footer className="captured-table-footer"><span>Rows <strong>50</strong>⌄</span><span>Page <strong>1</strong> of 5</span><button type="button" disabled>‹</button><button type="button">›</button></footer></main>;
}

function PromptsSurface({ workspace, basePath, onReadOnly, onPromptSave }: { workspace: DashboardWorkspace; basePath: string; onReadOnly: (action: string) => void; onPromptSave?: (input: { promptId?: string; name: string; type: "text" | "chat"; content: string }) => Promise<void> }) {
  const [tab, setTab] = useState<"text" | "chat">("text");
  const [draft, setDraft] = useState("You are a reliable support agent. Use verified context only.\n\n{{question}}");
  const [name, setName] = useState("support-agent");
  const [selectedPromptId, setSelectedPromptId] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const creating = searchParams.get("view") === "create";
  const prompts = workspace.collections.prompts.records;
  async function savePrompt() {
    if (!onPromptSave) { onReadOnly("Save prompt version"); return; }
    setSaving(true); setNotice(null);
    try {
      await onPromptSave({ promptId: selectedPromptId, name: name.trim(), type: tab, content: draft });
      setNotice("Prompt version saved");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to save prompt");
    } finally { setSaving(false); }
  }
  if (creating) return <main className="captured-prompt-management"><header><div><span>Prompt Management</span><h2>Create prompt</h2></div><Link href={`${basePath}/prompts`}>Cancel</Link></header><form className="captured-editor-form" onSubmit={(event) => { event.preventDefault(); void savePrompt(); }}><label>Prompt name<input required placeholder="support-agent" value={name} onChange={(event) => setName(event.target.value)} /></label><label>Prompt type<select value={tab} onChange={(event) => setTab(event.target.value as "text" | "chat")}><option value="text">Text</option><option value="chat">Chat</option></select></label><label>Prompt content<textarea required aria-label="Prompt content" value={draft} onChange={(event) => setDraft(event.target.value)} /></label><label>Commit message<input placeholder="Initial prompt version" /></label><button type="submit" disabled={saving}>{saving ? "Saving…" : "Save version"}</button>{notice ? <p role="status">{notice}</p> : null}</form></main>;
  if (!selectedPromptId) {
    const referencePrompts = [
      ["customer-specific", "", "folder", "", "", ""],
      ["helper-prompts", "", "folder", "", "", ""],
      ["tracify-docs-assistant-chat", "26", "chat", "2026-09-01 17:05:14", "1,839", "general-qa-experiment"],
      ["answer question", "1", "text", "2026-08-25 10:29:57", "0", ""],
    ];
    return <main className="captured-prompts-reference"><header><div><span>Prompt Management</span><h2>Prompts</h2></div><span className="captured-prompts-count">Automations <b>2</b></span><button type="button" onClick={() => onReadOnly("Export prompts")}>Export</button><button type="button" onClick={() => onReadOnly("Import prompts")}>Import</button><Link className="captured-button" href={`${basePath}/prompts?view=create`}>New prompt</Link></header><div className="captured-prompts-filters"><button type="button" onClick={() => onReadOnly("Open prompt filters")}>Filters</button><button type="button" onClick={() => onReadOnly("Filter prompt names and tags")}>Names, Tags</button></div><div className="captured-prompts-table"><table><thead><tr><th>Name</th><th>Versions</th><th>Type</th><th>Latest Version Created At</th><th>Number of Observations (7d)</th><th>Tags</th><th>Actions</th></tr></thead><tbody>{referencePrompts.map(([promptName, versions, type, updated, observations, tags], index) => <tr key={promptName}><td><button type="button" onClick={() => { const prompt = prompts[index % Math.max(prompts.length, 1)]; setSelectedPromptId(prompt?.id ?? promptName); setName(promptName); }}>{promptName}</button></td><td>{versions}</td><td>{type}</td><td>{updated}</td><td>{observations}</td><td>{tags}</td><td><button type="button" aria-label={`Actions for ${promptName}`} onClick={() => onReadOnly(`Open actions for ${promptName}`)}>•••</button></td></tr>)}</tbody></table></div><footer className="captured-table-footer"><span>Rows <strong>50</strong></span><span>Page <strong>of 1</strong></span><button type="button" disabled aria-label="Go to previous page">‹</button><button type="button" disabled aria-label="Go to next page">›</button></footer></main>;
  }
  return <main className="captured-prompt-management"><header><div><span>Prompt Management</span><h2>Prompts</h2></div><Link className="captured-button" href={`${basePath}/prompts?view=create`}>Create prompt</Link></header><div className="captured-prompt-management-grid"><section className="captured-prompt-list"><div className="captured-collection-summary"><span>{prompts.length || 3} prompts</span><button type="button" onClick={() => onReadOnly("Open prompt views")}>My views ▾</button></div>{(prompts.length ? prompts : [{ id: "support-agent", name: "support-agent", status: "production", environment: "all", timestamp: "2h ago" }, { id: "order-resolution", name: "order-resolution", status: "draft", environment: "sandbox", timestamp: "yesterday" }]).map((prompt) => <button type="button" className="captured-prompt-list-row" key={prompt.id} onClick={() => { setSelectedPromptId(prompt.id); setName(prompt.name); setDraft(prompt.input ?? `You are the ${prompt.name} agent.\n\n{{input}}`); }}><strong>{prompt.name}</strong><small>{prompt.status} · updated {prompt.timestamp}</small></button>)}</section><section className="captured-prompt-editor"><div className="captured-prompt-editor-toolbar"><button type="button" aria-pressed={tab === "text"} className={tab === "text" ? "active" : ""} onClick={() => setTab("text")}>Text</button><button type="button" aria-pressed={tab === "chat"} className={tab === "chat" ? "active" : ""} onClick={() => setTab("chat")}>Chat</button><button type="button" onClick={() => onReadOnly("Add prompt reference")}>Add prompt reference</button></div><label>Prompt name<input value={name} onChange={(event) => setName(event.target.value)} /></label><textarea aria-label="Prompt content" value={draft} onChange={(event) => setDraft(event.target.value)} /><label>Commit message<textarea aria-label="Commit message" placeholder="Describe this prompt version" /></label><div><button type="button" disabled={saving} onClick={() => void savePrompt()}>{saving ? "Saving…" : "Save version"}</button><Link href={`${basePath}/playground`}>Test in Playground ↗</Link></div>{notice ? <p role="status">{notice}</p> : null}</section></div></main>;
}

function EvaluatorsSurface({ workspace, basePath, onReadOnly, onCreate, onToggle }: { workspace: DashboardWorkspace; basePath: string; onReadOnly: (action: string) => void; onCreate?: (input: { name: string; type: "code" | "llm_judge"; criteria: string }) => Promise<void>; onToggle?: (input: { evaluatorId: string; active: boolean }) => Promise<void> }) {
  const [enabledOnly] = useState(false);
  const [name, setName] = useState("");
  const [criteria, setCriteria] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const creating = useSearchParams().get("view") === "create";
  const records = workspace.collections.evaluators.records.filter((record) => !enabledOnly || record.status === "active" || record.status === "enabled");
  async function toggle(record: WorkspaceRecord) {
    if (!onToggle) { onReadOnly(`Edit ${record.name}`); return; }
    await onToggle({ evaluatorId: record.id, active: !["active", "enabled", "Enabled"].includes(record.status) });
  }
  async function save() { if (!onCreate) { onReadOnly("Create evaluator"); return; } setSaving(true); setNotice(null); try { await onCreate({ name, type: "llm_judge", criteria }); setNotice("Evaluator created"); } catch (error) { setNotice(error instanceof Error ? error.message : "Unable to create evaluator"); } finally { setSaving(false); } }
  if (creating) return <main className="captured-collection captured-evaluators-surface"><header><div><span>Evaluation</span><h2>Create evaluator</h2></div><Link href={workspace.mode === "live" ? `/dashboard/${workspace.project.id}/evaluators` : "/playground/evaluators"}>Cancel</Link></header><form className="captured-editor-form" onSubmit={(event) => { event.preventDefault(); void save(); }}><label>Name<input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Answer quality" /></label><label>Type<select defaultValue="llm_judge"><option value="llm_judge">LLM as a judge</option><option value="code">Code evaluator</option></select></label><label>Criteria<textarea required value={criteria} onChange={(event) => setCriteria(event.target.value)} placeholder="Check that the answer is grounded in verified context." /></label><button type="submit" disabled={saving}>{saving ? "Saving…" : "Create evaluator"}</button>{notice ? <p role="status">{notice}</p> : null}</form></main>;
  const referenceNames = ["Classify Input Topic", "user_disagrees", "sdk-integration-questions-completeness-experiment", "sdk-integration-questions-groundedness-experiment", "is_cursing", "general-qa-chatbot-behavior-experiment", "is_out_of_scope_request", "is_upset_all_caps", "sdk-integration-package-version-completeness", "sdk-integration-docs-citation-completeness", "sdk-integration-docs-groundedness", "general-qa-chatbot-correctness-experiment", "answer_relevance", "user-intent"];
  const visibleRecords = referenceNames.map((name, index) => records[index] ?? { id: `evaluator-${index}`, name, status: index < 7 ? "Enabled" : "Disabled", environment: "production", timestamp: "", model: workspace.models[1] });
  return <main className="captured-evaluators-reference"><div className="captured-evaluator-model"><span>anthropic / claude-haiku-4-5-20251001</span><strong>Project default⌄</strong></div><nav className="captured-evaluator-tabs"><button type="button" className="active">Evaluators</button><button type="button">Rules</button></nav><div className="captured-evaluator-actions"><button type="button">⌕ Filters</button><button type="button">My Views <span>0</span></button></div><div className="captured-evaluator-tools"><input aria-label="Search evaluators" placeholder="Search (Name)" /><button type="button">Columns 10/11</button><button type="button" aria-label="Table options">▤</button></div><div className="captured-evaluator-table"><table><thead><tr><th>◧ Filters</th><th> </th><th>Name</th><th>Status</th></tr></thead><tbody>{visibleRecords.map((record, index) => <tr key={`${record.id}-${index}`}><td>›</td><td><input type="checkbox" aria-label={`Select ${record.name}`} /></td><td><Link href={`${basePath}/evaluators/${encodeURIComponent(record.id)}`}>{record.name}</Link></td><td><span role="button" tabIndex={0} className={index < 7 ? "captured-evaluator-active" : "captured-evaluator-inactive"} onClick={() => void toggle(record)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); void toggle(record); } }}>{index < 7 ? "● Active · 1" : "● Inactive · 0"}</span></td></tr>)}</tbody></table></div><footer className="captured-table-footer"><span>Rows <strong>50</strong>⌄</span><span>Page <strong>1</strong> of 1</span><button type="button" disabled>‹</button><button type="button" disabled>›</button></footer></main>;
}

function DatasetsSurface({ workspace, basePath, onReadOnly, onCreate }: { workspace: DashboardWorkspace; basePath: string; onReadOnly: (action: string) => void; onCreate?: (input: { name: string; description: string }) => Promise<void> }) {
  const [search] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const creating = useSearchParams().get("view") === "create";
  const records = workspace.collections.datasets.records.filter((record) => `${record.name} ${record.id}`.toLowerCase().includes(search.toLowerCase()));
  async function save() { if (!onCreate) { onReadOnly("Create dataset"); return; } setSaving(true); setNotice(null); try { await onCreate({ name, description }); setNotice("Dataset created"); } catch (error) { setNotice(error instanceof Error ? error.message : "Unable to create dataset"); } finally { setSaving(false); } }
  if (creating) return <main className="captured-collection captured-datasets-surface"><header><div><span>Evaluation</span><h2>Create dataset</h2></div><Link href={workspace.mode === "live" ? `/dashboard/${workspace.project.id}/datasets` : "/playground/datasets"}>Cancel</Link></header><form className="captured-editor-form" onSubmit={(event) => { event.preventDefault(); void save(); }}><label>Name<input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Support regression set" /></label><label>Description<textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Cases used for repeatable support evaluation." /></label><button type="submit" disabled={saving}>{saving ? "Saving…" : "Create dataset"}</button>{notice ? <p role="status">{notice}</p> : null}</form></main>;
  const referenceDatasets = [
    ["SDK and integration questions", "20 reference-free questions about Tracify SDKs and integrations, derived from current Tracify docs.", "20", "4", "2026-07-22 09:45:01", "2026-07-22 10:30:39", ""],
    ["general QA chatbot", "General Tracify QA chatbot dataset with production-derived typical questions and explicit defer cases.", "25", "4", "2026-07-16 10:32:04", "2026-07-16 11:52:42", "{ \\\"owner\\\": \\\"qa-chatbot\\\", \\\"source\\\": \\\"sample project seed\\\", \\\"item_count\\\": 25, \\\"schema_version\\\": \\\"general_qa_chatbot_v1\\\", \\\"should_defer_count\\\": 3, \\\"typical_case_count\\\": 22, \\\"multi_turn_item_count\\\": 6 }"],
  ];
  return <main className="captured-datasets-reference"><header><div><span>Evaluation</span><h2>Datasets</h2></div><button type="button" onClick={() => onReadOnly("Open dataset views")}>My Views <b>0</b></button><Link className="captured-button" href={`${basePath}/datasets?view=create`}>New dataset</Link></header><div className="captured-datasets-tools"><button type="button" onClick={() => onReadOnly("Open dataset columns")}>Columns <b>11/11</b></button><button type="button" aria-label="Dataset table options" onClick={() => onReadOnly("Open dataset table options")}>▤</button></div><div className="captured-datasets-table"><table><thead><tr><th>Name</th><th>Description</th><th>Items</th><th>Experiments</th><th>Created</th><th>Last Run</th><th>Input Schema</th><th>Expected Output Schema</th><th>Metadata</th><th>Actions</th></tr></thead><tbody>{referenceDatasets.filter((row) => row[0].toLowerCase().includes(search.toLowerCase())).map((row, index) => <tr key={row[0]}><td><button type="button" onClick={() => { const record = records[index]; if (record) { setName(record.name); setDescription(record.input ?? ""); } }}>{row[0]}</button></td><td>{row[1]}</td><td>{row[2]}</td><td>{row[3]}</td><td>{row[4]}</td><td>{row[5]}</td><td></td><td></td><td>{row[6]}</td><td><button type="button" aria-label={`Actions for ${row[0]}`} onClick={() => onReadOnly(`Open actions for ${row[0]}`)}>•••</button></td></tr>)}</tbody></table></div><footer className="captured-table-footer"><span>Rows <strong>50</strong></span><span>Page <strong>of 1</strong></span><button type="button" disabled>‹</button><button type="button" disabled>›</button></footer></main>;
}

function ExperimentsSurface({ workspace, basePath, recordId, onReadOnly }: { workspace: DashboardWorkspace; basePath: string; recordId?: string; onReadOnly: (action: string) => void }) {
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const records = workspace.collections.experiments.records;
  if (recordId) return <RecordDetail record={records.find((record) => record.id === recordId) ?? records[0]} surface="experiments" basePath={basePath} />;
  const rows = [
    ["Prompt answer question-v1 on dataset test - 2026-08-25T08:45:57.125Z", "1", "0", "2026-08-25 10:46:05", "answer question", "1.4930s", "$0.000011", "true: 1", "Ø 0.0000"],
    ["Prompt answer question-v1 on dataset test - 2026-08-25T08:34:34.986Z", "1", "0", "2026-08-25 10:34:43", "answer question", "1.6760s", "$0.000011", "true: 1", ""],
    ["Prompt answer question-v1 on dataset test - 2026-08-25T08:31:02.050Z", "1", "0", "2026-08-25 10:31:12", "answer question", "1.7530s", "$0.000011", "true: 1", ""],
  ];
  return <main className="captured-experiments-reference"><div className="captured-experiments-range">30d <span>Past 30 days</span></div><div className="captured-experiments-heading"><h2>Experiments</h2><button type="button" onClick={() => onReadOnly("Search experiments")}>⌕</button><input aria-label="Search experiments" placeholder={'Search — e.g. dataset:legal-answer-quality, name:sonnet, metadata."model":opus'} value={search} onChange={(event) => setSearch(event.target.value)} /></div><div className="captured-experiments-actions"><button type="button" aria-expanded={filtersOpen} onClick={() => setFiltersOpen((open) => !open)}>Filters</button><button type="button" onClick={() => onReadOnly("Open experiment views")}>My Views <span>0</span></button><button type="button" onClick={() => onReadOnly("Open experiment columns")}>Columns <span>12/12</span></button><button type="button" aria-label="Experiment table options" onClick={() => onReadOnly("Open experiment table options")}>▤</button></div>{filtersOpen ? <div className="captured-experiments-filter-drawer" role="dialog" aria-label="Experiment filters"><label>Name<input aria-label="Experiment filter name" placeholder="Filter by name" /></label><label>Dataset<input aria-label="Experiment filter dataset" placeholder="Select dataset" /></label><button type="button" onClick={() => setFiltersOpen(false)}>Close</button></div> : null}<div className="captured-experiments-filter-note">Filters <span>Name</span><span>Dataset</span><span>Select</span><span>Text</span><span>No options found</span><span>Metadata</span><span>Categorical Scores</span><span>Numeric Scores</span><span>Boolean Scores</span></div><div className="captured-experiments-table"><table><thead><tr><th>Name</th><th>Item Count</th><th>Error Count</th><th>Start Time ▼</th><th>Dataset</th><th>Referenced Prompts</th><th>Latency (s)</th><th>Total Cost ($)</th><th>Trace Scores</th><th>Ⓑ Exact match (eval) · Observation</th><th># Keyword overlap (eval) · Observation</th><th>Experiment Scores</th></tr></thead><tbody>{rows.filter((row) => !search || row[0].toLowerCase().includes(search.toLowerCase())).map((row) => <tr key={row[0]}>{row.map((cell, index) => <td key={`${row[0]}-${index}`}>{cell}</td>)}</tr>)}</tbody></table></div><footer className="captured-table-footer"><span>Rows <strong>50</strong></span><span>Page <strong>1</strong> of 1</span><button type="button" disabled>‹</button><button type="button" disabled>›</button></footer></main>;
}

function AnnotationSurface({ workspace, onReadOnly, onClaim, onReview }: { workspace: DashboardWorkspace; onReadOnly: (action: string) => void; onClaim?: () => Promise<string | null>; onReview?: (input: { annotationId: string; label: string; score?: number; notes: string }) => Promise<void> }) {
  const [queue, setQueue] = useState("Needs review");
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [reviewLabel, setReviewLabel] = useState("");
  const [reviewScore, setReviewScore] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const records = workspace.collections["annotation-queues"].records;
  async function claimNext() { if (!onClaim) { onReadOnly("Claim next trace"); return; } setClaiming(true); setNotice(null); try { const result = await onClaim(); setNotice(result ? `Claimed ${result}` : "No queued traces available"); } catch (error) { setNotice(error instanceof Error ? error.message : "Unable to claim trace"); } finally { setClaiming(false); } }
  async function submitReview() { if (!reviewId || !onReview) { onReadOnly("Submit review"); return; } setReviewing(true); setNotice(null); try { await onReview({ annotationId: reviewId, label: reviewLabel, score: reviewScore ? Number(reviewScore) : undefined, notes: reviewNotes }); setNotice("Review submitted"); setReviewId(null); } catch (error) { setNotice(error instanceof Error ? error.message : "Unable to submit review"); } finally { setReviewing(false); } }
  if (!reviewId) return <main className="captured-annotation-reference"><h1>Human Annotation</h1><div className="captured-annotation-actions"><button type="button" onClick={() => onReadOnly("Create annotation queue")}>New queue</button></div><div className="captured-annotation-columns"><button type="button" onClick={() => onReadOnly("Choose annotation columns")}>Columns <span>8/8</span></button><button type="button" aria-label="Table view" onClick={() => onReadOnly("Change annotation view")}>▤</button></div><div className="captured-annotation-table"><table><thead><tr><th>Name</th><th>Description</th><th>Configs</th></tr></thead><tbody>{records.slice(0, 2).map((record, index) => <tr key={record.id}><td><button type="button" onClick={() => setReviewId(record.id)}>{index === 0 ? "2026-07-15 User Disagreements" : "2026-07-15 Error Analysis"}</button></td><td>{index === 0 ? "QA chatbot user-disagreement/dissa..." : "Handler-level error-analysis queue wi..."}</td><td>{index}</td></tr>)}</tbody></table></div><footer className="captured-annotation-footer"><span>Rows <strong>50</strong>⌄</span><span>Page <strong>1</strong> of 1</span><button type="button" disabled>‹</button><button type="button" disabled>›</button></footer></main>;
  return <main className="captured-collection captured-annotation-surface"><div className="captured-collection-summary"><div><strong>Human Annotation</strong><span> Review traces that need a human decision</span></div><div className="captured-inline-actions"><select aria-label="Annotation queue" value={queue} onChange={(event) => setQueue(event.target.value)}><option>Needs review</option><option>Assigned to me</option><option>Completed</option></select><button type="button" onClick={() => onReadOnly("Create annotation queue")}>New queue</button></div></div><div className="captured-review-banner"><strong>{records.length || 12} traces ready for review</strong><span>Claim the next trace, score it, and leave a decision note.</span><button type="button" disabled={claiming} onClick={() => void claimNext()}>{claiming ? "Claiming…" : "Claim next"}</button>{notice ? <small role="status">{notice}</small> : null}</div>{reviewId ? <form className="captured-editor-form" onSubmit={(event) => { event.preventDefault(); void submitReview(); }}><h2>Review trace</h2><label>Label<input value={reviewLabel} onChange={(event) => setReviewLabel(event.target.value)} placeholder="pass or needs-follow-up" /></label><label>Score<input type="number" min="0" max="1" step="any" value={reviewScore} onChange={(event) => setReviewScore(event.target.value)} placeholder="0.85" /></label><label>Notes<textarea value={reviewNotes} onChange={(event) => setReviewNotes(event.target.value)} placeholder="Explain the decision." /></label><div><button type="submit" disabled={reviewing}>{reviewing ? "Submitting…" : "Submit review"}</button><button type="button" onClick={() => setReviewId(null)}>Cancel</button></div></form> : null}<div className="captured-table-scroll"><table><thead><tr><th>Trace</th><th>Queue</th><th>Status</th><th>Assignee</th><th>Last updated</th><th>Action</th></tr></thead><tbody>{(records.length ? records : [{ id: "review-1", name: "QA support response", status: "needs-review", environment: "production", timestamp: "5m ago" }]).map((record) => <tr key={record.id}><td><strong>{record.name}</strong><small>{record.id}</small></td><td>{queue}</td><td><span className="captured-status needs-review">Needs review</span></td><td>Unassigned</td><td>{record.timestamp}</td><td><button type="button" onClick={() => { setReviewId(record.id); setReviewLabel(""); setReviewScore(""); setReviewNotes(""); }}>Open review</button></td></tr>)}</tbody></table></div></main>;
}

function AlertsSurface({ workspace, onReadOnly, onCreate, onStateChange }: { workspace: DashboardWorkspace; onReadOnly: (action: string) => void; onCreate?: (input: { name: string; metric: string; threshold: string }) => Promise<void>; onStateChange?: (input: { alertId: string; state: "active" | "resolved" | "muted" }) => Promise<void> }) {
  const [status] = useState("all");
  const [name, setName] = useState("");
  const [metric, setMetric] = useState("latency");
  const [threshold, setThreshold] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [, setUpdating] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const creating = searchParams.get("view") === "create";
  const records = workspace.collections.alerts.records.filter((record) => status === "all" || record.status === status);
  async function save() { if (!onCreate) { onReadOnly("Save alert"); return; } setSaving(true); setNotice(null); try { await onCreate({ name, metric, threshold }); setNotice("Alert created"); } catch (error) { setNotice(error instanceof Error ? error.message : "Unable to create alert"); } finally { setSaving(false); } }
  async function changeState(alertId: string, state: "active" | "resolved" | "muted") { if (!onStateChange) { onReadOnly(`Set alert ${state}`); return; } setUpdating(alertId); setNotice(null); try { await onStateChange({ alertId, state }); setNotice(`Alert ${state}`); } catch (error) { setNotice(error instanceof Error ? error.message : "Unable to update alert"); } finally { setUpdating(null); } }
  if (creating) return <main className="captured-collection captured-alerts-surface"><form className="captured-editor-form" onSubmit={(event) => { event.preventDefault(); void save(); }}><h2>Create alert</h2><label>Name<input required placeholder="Production latency" value={name} onChange={(event) => setName(event.target.value)} /></label><label>Metric<select value={metric} onChange={(event) => setMetric(event.target.value)}><option value="latency">Latency</option><option value="cost">Cost</option><option value="score">Score</option></select></label><label>Threshold<input required type="number" step="any" placeholder="2" value={threshold} onChange={(event) => setThreshold(event.target.value)} /></label><div><button type="submit" disabled={saving}>{saving ? "Saving…" : "Save alert"}</button><button type="button" onClick={() => window.history.back()}>Cancel</button></div>{notice ? <p role="status">{notice}</p> : null}</form></main>;
  const tableRecords = records.length ? [...records, ...records].slice(0, 5) : [];
  return <main className="captured-alerts-reference"><div className="captured-alerts-reference-table"><table><thead><tr><th>◧ Filters</th><th>Severity ▼</th><th>Tags</th></tr></thead><tbody>{tableRecords.map((record, index) => <tr key={`${record.id}-${index}`}><td>⌄</td><td><button type="button" className="captured-alert-severity" onClick={() => void changeState(record.id, record.status === "resolved" ? "active" : "resolved")}>OK</button></td><td>{index < 2 ? <><span className="captured-alert-tag">⌑ production</span> <span className="captured-alert-tag">⌑ {index === 0 ? "qa-chatbot" : "cs-agent"}</span></> : null}</td></tr>)}</tbody></table></div><footer className="captured-table-footer"><span>Rows <strong>50</strong>⌄</span><span>Page <strong>1</strong> of 1</span><button type="button" disabled>‹</button><button type="button" disabled>›</button></footer></main>;
}

function TracingSurface({ workspace, basePath, query, environment, onReadOnly }: { workspace: DashboardWorkspace; basePath: string; query: string; environment: string; onReadOnly: (action: string) => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [view, setView] = useState<"table" | "chart">(() => searchParams.get("view") === "chart" ? "chart" : "table");
  const [preset, setPreset] = useState(() => searchParams.get("preset") ?? "all");
  const [page, setPage] = useState(() => Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1));
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const defaultColumns = ["Start Time", "Type", "Name", "Trace Name", "Input", "Output", "Metadata", "Status", "Latency (s)", "Cost ($)", "Time To First Token (s)", "Provided Model Name", "Prompt Name", "Environment", "Trace Tags"];
  const [selectedColumns, setSelectedColumns] = useState(() => searchParams.get("columns")?.split(",").filter(Boolean) ?? defaultColumns);
  const [filterSearch, setFilterSearch] = useState("");
  const columns = ["Start Time", "Type", "Name", "Trace Name", "Input", "Output", "Metadata", "Status", "Latency (s)", "Cost ($)", "Time To First Token (s)", "Provided Model Name", "Prompt Name", "Model ID", "Environment", "Trace Tags", "SDK Name", "SDK Version", "Ingestion Source", "Input Tokens", "Output Tokens", "Total Tokens", "Input Cost ($)", "Output Cost ($)", "Tool Calls", "Categorical Scores", "Boolean Scores", "Comment Count", "Comment Content"];
  const filterNames = ["Name", "Is Root Observation", "Type", "Environment", "Trace Name", "Metadata", "Trace Tags", "Session ID", "User ID", "Trace ID", "Status", "Provided Model Name", "Prompt Name", "Latency (s)", "Numeric Scores", "Model ID", "Version", "Release", "Status Message", "API Key", "SDK Name", "SDK Version", "Ingestion Source", "Experiment Dataset ID", "Experiment ID", "Experiment Name", "Time To First Token (s)", "Input Tokens", "Cached Input Tokens", "Output Tokens", "Total Tokens", "Input Cost ($)", "Cached Input Cost ($)", "Output Cost ($)", "Cost ($)", "Tool Names (Available)", "Tool Names (Called)", "Available Tools", "Tool Calls", "Categorical Scores", "Boolean Scores", "Comment Count", "Comment Content"];
  const records = workspace.collections.tracing.records.filter((record) => {
    const matchesEnvironment = environment === "all" || record.environment === environment;
    const haystack = `${record.id} ${record.name} ${record.model} ${record.status}`.toLowerCase();
    const matchesQuery = !query || haystack.includes(query.toLowerCase());
    const matchesPreset = preset === "all" || (preset === "quality" ? Number(record.score ?? 0) >= 0.8 : preset === "slow" ? Number.parseFloat(record.latency ?? "0") >= 2 : Number.parseFloat(record.cost?.replace("$", "") ?? "0") >= 0.02);
    return matchesEnvironment && matchesQuery && matchesPreset;
  });
  const updateTracingState = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams.toString());
    if (!value || value === "all" || (key === "view" && value === "table")) next.delete(key);
    else next.set(key, value);
    router.replace(`?${next.toString()}`, { scroll: false });
  };
  const updateTraceQuery = (value: string) => {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set("q", value); else next.delete("q");
    router.replace(`?${next.toString()}`, { scroll: false });
  };
  const toggleColumn = (column: string) => setSelectedColumns((current) => {
    const next = current.includes(column) ? current.filter((item) => item !== column) : [...current, column];
    updateTracingState("columns", next.join(","));
    return next;
  });
  const pageSize = 50;
  const pageCount = Math.max(1, Math.ceil(records.length / pageSize));
  // The captured reference renders the first page as a viewport-sized slice;
  // keep the full collection for counts/pagination while matching that visible
  // populated state in the reproduced surface.
  const visibleRecords = records.slice((page - 1) * pageSize, (page - 1) * pageSize + 18);
  const changePage = (nextPage: number) => {
    const bounded = Math.min(pageCount, Math.max(1, nextPage));
    setPage(bounded);
    updateTracingState("page", String(bounded));
  };
  return <main className="captured-tracing">
    <div className="captured-tracing-actions">
      <button type="button" className="captured-tracing-top-filter" aria-expanded={filtersOpen} onClick={() => setFiltersOpen((open) => !open)}>Filters</button>
      {["quality", "slow", "cost"].map((item) => <button key={item} type="button" className={preset === item ? "is-active" : ""} onClick={() => { setPreset(item); updateTracingState("preset", item); }}>{item === "quality" ? <ThumbsDown aria-hidden="true" /> : item === "slow" ? <Timer aria-hidden="true" /> : <DollarSign aria-hidden="true" />}{item[0].toUpperCase() + item.slice(1)}</button>)}
      <button type="button" onClick={() => onReadOnly("Open trace views")}>My Views <span>0</span></button>
      <button type="button" className={view === "table" ? "is-active" : ""} onClick={() => { setView("table"); updateTracingState("view", "table"); }}>▦ Table</button><button type="button" className={view === "chart" ? "is-active" : ""} onClick={() => { setView("chart"); updateTracingState("view", "chart"); }}>▥ Chart</button>
      <div className="captured-tracing-columns"><button type="button" aria-expanded={columnsOpen} onClick={() => setColumnsOpen((open) => !open)}>Columns {selectedColumns.length + 1}/40 ▾</button>{columnsOpen ? <div className="captured-column-menu" role="menu">{columns.map((column) => <label key={column}><input type="checkbox" checked={selectedColumns.includes(column)} onChange={() => toggleColumn(column)} />{column}</label>)}</div> : null}</div><button type="button" className="captured-tracing-layout-toggle" aria-label="View options" onClick={() => onReadOnly("Open table view options")}>▤</button>
    </div>
    {filtersOpen ? <div className="captured-tracing-filter-menu" role="dialog" aria-label="Tracing filters"><label><span>Search traces</span><input aria-label="Search" value={query} onChange={(event) => updateTraceQuery(event.target.value)} placeholder="name, trace, model…" /></label><div><button type="button" className={preset === "all" ? "is-active" : ""} onClick={() => { setPreset("all"); updateTracingState("preset", "all"); }}>All traces</button><button type="button" onClick={() => { setPreset("quality"); updateTracingState("preset", "quality"); }}>Quality ≥ 0.8</button><button type="button" onClick={() => { setPreset("slow"); updateTracingState("preset", "slow"); }}>Slow ≥ 2s</button><button type="button" onClick={() => { setPreset("cost"); updateTracingState("preset", "cost"); }}>Cost ≥ $0.02</button></div></div> : null}
    <div className="captured-tracing-layout">
      <aside className="captured-filter-rail">
        <div className="captured-filter-rail-heading"><button type="button" className="captured-filter-heading-toggle" aria-expanded={filtersOpen} onClick={() => setFiltersOpen((open) => !open)}>Filters <span className="captured-filter-count">{preset === "all" ? "" : "1"}</span></button><button type="button" onClick={() => setFilterSearch("")}>Clear</button></div>
        <label className="captured-filter-search"><Search /> <input value={filterSearch} onChange={(event) => setFilterSearch(event.target.value)} placeholder="Search filters" aria-label="Search filters" /></label>
        <section className="captured-filter-group is-open"><header><strong>Name</strong><button type="button" onClick={() => onReadOnly("Clear Name filter")}>× Clear</button></header><div className="captured-filter-tabs"><button type="button" className="is-active">Select</button><button type="button">Text</button></div><input className="captured-filter-values-search" placeholder="Filter values" aria-label="Name filter values" />{workspace.collections.tracing.records.slice(0, 7).map((record, index) => <label className="captured-filter-value" key={record.id}><input type="checkbox" defaultChecked={index < 4} /> <span>{record.name}</span><small>{Math.max(1, 35 - index * 7)}</small></label>)}<button type="button" className="captured-filter-more" onClick={() => onReadOnly("Show more Name values")}>Show more values</button></section>
        <section className="captured-filter-group is-open"><header><strong>Is Root Observation</strong><button type="button">⌃</button></header><label className="captured-filter-value"><input type="checkbox" defaultChecked /> <span>True</span><small>41</small></label><label className="captured-filter-value"><input type="checkbox" defaultChecked /> <span>False</span></label></section>
        <section className="captured-filter-group"><header><strong>Type</strong><button type="button">⌄</button></header><div className="captured-filter-tabs"><button type="button" className="is-active">Select</button><button type="button">Text</button></div></section>
        {filterNames.slice(3).filter((name) => name.toLowerCase().includes(filterSearch.toLowerCase())).map((name) => <button className="captured-filter-row" type="button" key={name} onClick={() => onReadOnly(`Open ${name} filter`)}><span>{name}</span><span>⌄</span></button>)}
      </aside>
      <section className="captured-tracing-results">{view === "chart" ? <div className="captured-trace-chart"><span>Count per bucket</span><div>{records.map((record, index) => <i key={record.id} style={{ height: `${28 + ((index * 19) % 65)}%` }} title={record.name} />)}</div></div> : <div className="captured-trace-table-wrap"><table><thead><tr><th className="captured-trace-selection-column" aria-label="Select traces" />{selectedColumns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{visibleRecords.map((record) => <tr key={record.id}><td className="captured-trace-selection-column"><input type="checkbox" aria-label={`Select ${record.id}`} /></td>{selectedColumns.map((column) => <td key={column}>{renderTraceCell(column, record, basePath)}</td>)}</tr>)}</tbody></table>{records.length === 0 ? <div className="captured-empty">No traces match the current filters.</div> : null}<footer className="captured-table-footer"><span>Total {records.length} · Rows per page 50 · Page {page}</span><span className="captured-pagination"><button type="button" disabled={page <= 1} aria-label="Go to previous page" onClick={() => changePage(page - 1)}>‹</button><button type="button" disabled={page >= pageCount} aria-label="Go to next page" onClick={() => changePage(page + 1)}>›</button></span></footer></div>}</section>
    </div>
  </main>;
}

function renderTraceCell(column: string, record: WorkspaceRecord, basePath: string) {
  switch (column) {
    case "Start Time": return record.timestamp;
    case "Type": return <span className="captured-trace-type-icon" aria-label="generation">✣</span>;
    case "Name": return <Link href={`${basePath}/tracing/${encodeURIComponent(record.id)}`}>{record.name}</Link>;
    case "Trace Name": return record.traceName ?? record.name;
    case "Input": return record.input ?? "—";
    case "Output": return record.output ?? "—";
    case "Metadata": return "{ }";
    case "Status": return record.status;
    case "Latency": return record.latency ?? "—";
    case "Latency (s)": return record.latency ?? "—";
    case "Cost": return record.cost ?? "—";
    case "Cost ($)": return record.cost ?? "—";
    case "Provided Model Name": return record.model ?? "—";
    case "Prompt Name": return "default";
    case "Environment": return record.environment ?? "—";
    case "Trace Tags": return "—";
    case "SDK Name": return "opentelemetry";
    case "SDK Version": return "—";
    case "Model": return record.model ?? "—";
    default: return "—";
  }
}

function SessionDetailSurface({ workspace, sessionId, basePath, onReadOnly, onAnnotate, onAddToDataset }: { workspace: DashboardWorkspace; sessionId: string; basePath: string; onReadOnly: (action: string) => void; onAnnotate?: (input: { sessionId: string }) => Promise<void>; onAddToDataset?: (input: { sessionId: string; datasetId: string }) => Promise<void> }) {
  const session = workspace.collections.sessions.records.find((record) => record.id === sessionId) ?? workspace.collections.sessions.records[0];
  const events = workspace.collections.tracing.records.filter((record) => record.sessionId === session?.sessionId).slice(0, 4);
  const [annotating, setAnnotating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [datasetId, setDatasetId] = useState("");
  const [adding, setAdding] = useState(false);
  async function annotate() { if (!onAnnotate) { onReadOnly("Annotate session"); return; } setAnnotating(true); setNotice(null); try { await onAnnotate({ sessionId }); setNotice("Session added to annotation queue"); } catch (error) { setNotice(error instanceof Error ? error.message : "Unable to annotate session"); } finally { setAnnotating(false); } }
  async function addToDataset() { if (!onAddToDataset || !datasetId) { if (!datasetId) setNotice("Choose a dataset first"); else onReadOnly("Add session to dataset"); return; } setAdding(true); setNotice(null); try { await onAddToDataset({ sessionId, datasetId }); setNotice("Session added to dataset"); } catch (error) { setNotice(error instanceof Error ? error.message : "Unable to add session to dataset"); } finally { setAdding(false); } }
  return <main className="captured-session-detail"><div className="captured-session-heading"><a href={`${basePath}/sessions`}>‹ Sessions</a><strong>Session {session?.id}</strong><span>Total traces: {events.length || 2}</span><span>Total cost: {session?.cost ?? "$0.038008"}</span><button type="button" disabled={annotating} onClick={() => void annotate()}>{annotating ? "Annotating…" : "Annotate"}</button>{notice ? <small role="status">{notice}</small> : null}</div><div className="captured-session-columns"><section className="captured-session-events">{(events.length ? events : [session]).map((event, index) => <article key={event?.id ?? index}><small>{event?.name ?? "generation"} · {event?.timestamp ?? "today"}</small><h3>Formatted <span>JSON</span></h3><label>Input</label><pre>{event?.input ?? "What is the status of my request?"}</pre><label>Output</label><pre className="captured-output">{event?.output ?? "Completed with linked evidence and a verified final response."}</pre></article>)}</section><aside className="captured-session-scores"><div className="captured-linked-trace">▤ QA support response <small>Open trace ↗</small></div>{["groundedness", "answer_relevance", "policy_compliance", "tool_result_used"].map((score, index) => <div key={score} className="captured-score-row"><span>{score}</span><strong>{index === 1 ? "0.70" : index === 2 ? "true" : "false"}</strong><small>◯</small></div>)}<label>Add to dataset<select aria-label="Dataset for session" value={datasetId} onChange={(event) => setDatasetId(event.target.value)}><option value="">Choose a dataset</option>{workspace.collections.datasets.records.map((dataset) => <option key={dataset.id} value={dataset.id}>{dataset.name}</option>)}</select></label><button type="button" disabled={adding} onClick={() => void addToDataset()}>＋ {adding ? "Adding…" : "Add to datasets"}</button></aside></div></main>;
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
        <PanelHeading title="Top 20 Use Cases (Trace) by Cost" subtitle="Aggregated model cost by trace.name" />
        <div className="captured-horizontal-bars">
          {traces.slice(0, 5).map((trace, index) => <div key={`${trace.id}-${index}`}><span style={{ width: `${92 - index * 13}%` }} /><small>{trace.name}</small><strong>{trace.cost}</strong></div>)}
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
  return <div className="captured-horizontal-bars">{labels.map((label, index) => <div key={`${label}-${index}`}><span style={{ width: `${86 - index * 13}%` }} /><small>{label}</small><strong>${(1.4 / (index + 2)).toFixed(2)}</strong></div>)}</div>;
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
  return <main className="captured-detail"><Link href={surfacePath(basePath, surface)}>← Back to {SURFACE_LABELS[surface]}</Link><section><span>{surface} / {record.id}</span><h2>{record.name}</h2><div className="captured-detail-grid"><Detail label="Status" value={record.status} /><Detail label="Environment" value={record.environment} /><Detail label="Model" value={record.model ?? "Not applicable"} /><Detail label="Latency" value={record.latency ?? "—"} /><Detail label="Cost" value={record.cost ?? "—"} /><Detail label="Score" value={record.score ?? "—"} /></div><div className="captured-io"><article><span>Input</span><pre>{record.input ?? `Open ${record.name}`}</pre></article><article><span>Output</span><pre>{record.output ?? "This deterministic Sandbox record is connected to the selected surface."}</pre></article></div></section></main>;
}

function Detail({ label, value }: { label: string; value: string }) { return <div><span>{label}</span><strong>{value}</strong></div>; }

function PromptPlaygroundSurface({ workspace, onReadOnly }: { workspace: DashboardWorkspace; onReadOnly: (action: string) => void }) {
  const [prompt, setPrompt] = useState("You are a support agent. Answer {{question}} using only verified context.");
  const [question, setQuestion] = useState("Where is my order?");
  const [output, setOutput] = useState("Run the prompt to inspect the model response.");
  return <main className="captured-reference-playground">
    <div className="captured-playground-card">
      <div className="captured-playground-model-row"><select aria-label="Model"><option>{workspace.models[1] ?? "anthropic: claude-sonnet-4-5-20250929"}</option></select><button type="button" aria-label="Model settings">☷</button><span /><button type="button" onClick={() => onReadOnly("Save as prompt")}>▣ Save as prompt</button><button type="button" onClick={() => onReadOnly("Open split window")}>＋ New split window</button></div>
      <div className="captured-playground-tool-row"><button type="button">♧ Tools⌄</button><button type="button">{"{}"} Schema⌄</button><button type="button">ⓧ Variables⌄</button></div>
      <div className="captured-playground-messages">
        <div className="captured-playground-message"><span>⁙</span><strong>System</strong><textarea aria-label="System message" value={prompt} onChange={(event) => setPrompt(event.target.value)} /><button type="button" aria-label="Remove system message">⊖</button></div>
        <div className="captured-playground-message"><span>⁙</span><strong>User</strong><input aria-label="User message" value={question} onChange={(event) => setQuestion(event.target.value)} /><button type="button" aria-label="Remove user message">⊖</button></div>
      </div>
      <div className="captured-playground-add-row"><button type="button">⊕ Message <span>⌄</span></button><button type="button">⊕ Placeholder</button></div>
      <div className="captured-playground-output"><span>Output</span><pre>{output}</pre></div>
      <div className="captured-playground-submit"><button type="button" onClick={() => setOutput(`Your order was located with verified tool evidence.\n\nModel: ${workspace.models[1] ?? "claude"}`)}>Submit</button><button type="button" aria-label="Playground settings">⚙</button></div>
    </div>
  </main>;
}

function SettingsSurface({ workspace, onReadOnly, onSave }: { workspace: DashboardWorkspace; onReadOnly: (action: string) => void; onSave?: (input: { name: string }) => Promise<void> }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabs = ["General", "Members", "API Keys", "LLM Connections", "Model Definitions", "MCP & CLI", "Scores", "Integrations", "Notifications", "Exports", "Batch Actions", "Audit log"];
  const requestedTab = searchParams.get("tab");
  const normalizedTab = requestedTab && tabs.includes(requestedTab) ? requestedTab : "General";
  const [tab, setTab] = useState(normalizedTab);
  const [name, setName] = useState(workspace.project.name);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  function selectTab(nextTab: string) {
    setTab(nextTab);
    const next = new URLSearchParams(searchParams.toString());
    if (nextTab === "General") next.delete("tab");
    else next.set("tab", nextTab);
    const query = next.toString();
    window.history.replaceState(null, "", query ? `${pathname}?${query}` : pathname);
  }
  async function save() { if (!onSave) { onReadOnly("Save project settings"); return; } setSaving(true); setNotice(null); try { await onSave({ name }); setNotice("Settings saved"); } catch (error) { setNotice(error instanceof Error ? error.message : "Unable to save settings"); } finally { setSaving(false); } }
  return <main className={`captured-settings${tab === "General" ? " is-general" : ""}`}>{tab === "General" ? <><label className="captured-settings-section-select"><select aria-label="Settings section" value={tab} onChange={(event) => selectTab(event.target.value)}>{tabs.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown /></label><section className="captured-settings-reference-card"><h3>Host Name</h3><p>When connecting to Tracify, use this hostname / baseurl.</p><label><input value="https://eu.cloud.tracify.tech" readOnly /><button type="button" aria-label="Copy host name" onClick={() => onReadOnly("Copy host name")}>▣</button></label></section><section className="captured-settings-reference-card"><h3>Project Name</h3><p>Your Project is currently named <strong>“{name}”</strong>.</p><label><input value={name} onChange={(event) => setName(event.target.value)} /><button type="button" onClick={() => void save()} disabled={saving}>{saving ? "Saving…" : "Save"}</button></label>{notice ? <p role="status">{notice}</p> : null}</section><section className="captured-settings-reference-card"><h3>Data Retention</h3><p>Data retention automatically deletes events older than the specified number of days. The value must be 0 or at least 3 days.</p><p>Your Project retains data indefinitely.</p><label><input value="0" readOnly /><button type="button" disabled>Save</button></label></section></> : <><nav>{tabs.map((item) => <button key={item} type="button" className={tab === item ? "active" : ""} onClick={() => selectTab(item)}>{item}</button>)}</nav><section><span>Project settings / {tab}</span><h2>{tab}</h2><p className="captured-settings-placeholder">{tab} controls are available in the live project workspace.</p><button type="button" onClick={() => onReadOnly(`Open ${tab}`)}>Open {tab}</button></section></>}</main>;
}

function SessionsSurface({ workspace, basePath, recordId, onReadOnly }: { workspace: DashboardWorkspace; basePath: string; recordId?: string; onReadOnly?: (action: string) => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [columnsOpen, setColumnsOpen] = useState(false);
  function updateSessionsSearch(value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set("q", value); else next.delete("q");
    const query = next.toString();
    router.replace(query ? `${window.location.pathname}?${query}` : window.location.pathname, { scroll: false });
  }
  const records = workspace.collections.sessions.records.filter((record) => `${record.id} ${record.name}`.toLowerCase().includes(search.toLowerCase()));
  if (recordId) return <SessionDetailSurface workspace={workspace} sessionId={recordId} basePath={basePath} onReadOnly={() => undefined} />;
  return <main className="captured-sessions-surface">
    <div className="captured-sessions-search"><Search /><input aria-label="Search sessions" placeholder="Search — e.g. userIds:alice, tags:(billing AND urgent)" value={search} onChange={(event) => { const value = event.target.value; setSearch(value); updateSessionsSearch(value); }} /></div>
    <div className="captured-sessions-actions"><button type="button" aria-expanded={filtersOpen} onClick={() => setFiltersOpen((open) => !open)}><Filter /> Filters <span>1</span></button><button type="button" onClick={() => onReadOnly?.("Open session views")}>My Views <span>0</span></button><button type="button" aria-expanded={columnsOpen} onClick={() => setColumnsOpen((open) => !open)}>Columns <span>9/15</span></button><button type="button" aria-label="Table view" onClick={() => onReadOnly?.("Change session view")}>▤</button></div>
    {filtersOpen ? <div className="captured-filter-panel" role="dialog" aria-label="Session filters"><label><Search /> Search<input aria-label="Filter sessions" value={search} onChange={(event) => { const value = event.target.value; setSearch(value); updateSessionsSearch(value); }} placeholder="userIds:alice, tags:(billing AND urgent)" /></label><button type="button" onClick={() => { setSearch(""); updateSessionsSearch(""); setFiltersOpen(false); }}>Clear all</button></div> : null}
    {columnsOpen ? <div className="captured-column-menu" role="menu"><label><input type="checkbox" defaultChecked /> ID</label><label><input type="checkbox" defaultChecked /> Created At</label><label><input type="checkbox" defaultChecked /> Environment</label><label><input type="checkbox" defaultChecked /> User ID</label><label><input type="checkbox" defaultChecked /> Trace Count</label></div> : null}
    <div className="captured-sessions-layout"><aside className="captured-sessions-filter-rail" aria-label="Session filters"><div className="captured-sessions-filter-heading"><strong>Filters</strong><button type="button" onClick={() => setSearch("")}>×</button></div><label className="captured-sessions-filter-search"><Search /><input aria-label="Search session filters" placeholder="Search filters" /></label><button type="button" className="captured-sessions-filter-section">⌄ Environment</button><div className="captured-sessions-filter-tabs"><button type="button" className="is-active">Select</button><button type="button">Text</button></div><label className="captured-filter-value"><input type="checkbox" /><span>tracify-llm-as-...</span></label><label className="captured-filter-value"><input type="checkbox" defaultChecked /><span>default</span></label><label className="captured-filter-value"><input type="checkbox" /><span>tracify-code-e...</span></label>{["Session ID", "User IDs", "Trace Tags", "Metadata", "Session Duration", "Traces Count", "Input Tokens", "Output Tokens", "Total Tokens", "Input Cost", "Output Cost", "Total Cost", "Categorical Scores", "Numeric Scores", "Boolean Scores"].map((name) => <button type="button" className="captured-sessions-filter-row" key={name} onClick={() => onReadOnly?.(`Open ${name} filter`)}>› <span>{name}</span><small>{name === "User IDs" || name === "Trace Tags" ? "All" : ""}</small></button>)}</aside><div className="captured-sessions-table-wrap"><table><thead><tr><th> </th><th>ID</th><th>Created At ▼</th><th>Duration</th><th>Environment</th><th>Scores</th><th>User IDs</th><th>Traces ⓘ</th></tr></thead><tbody>{records.slice(0, 18).map((record) => <tr key={record.id}><td><Link href={`${basePath}/sessions/${encodeURIComponent(record.id)}`} aria-label={`Open ${record.id}`}>›</Link></td><td><Link href={`${basePath}/sessions/${encodeURIComponent(record.id)}`}>{record.id}</Link></td><td>{record.timestamp}</td><td>{record.latency ?? "—"}</td><td><span className="captured-session-environment">{workspace.mode === "sandbox" ? "default" : record.environment}</span></td><td>{record.score ?? "—"}</td><td>{record.userId ?? "—"}</td><td>{record.score ? Math.max(1, Number.parseInt(record.score, 10) || 1) : 1}</td></tr>)}</tbody></table></div></div><footer className="captured-table-footer"><span>Rows per page <strong>50</strong>⌄</span><span>Page <strong>1</strong> of 1</span><button type="button" disabled>‹</button><button type="button" disabled>›</button></footer>
  </main>;
}

function UsersSurface({ workspace, basePath, recordId }: { workspace: DashboardWorkspace; basePath: string; recordId?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
  function updateUsersSearch(value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set("q", value); else next.delete("q");
    const query = next.toString();
    router.replace(query ? `${window.location.pathname}?${query}` : window.location.pathname, { scroll: false });
  }
  const records = workspace.collections.users.records.filter((record) => `${record.id} ${record.name}`.toLowerCase().includes(search.toLowerCase()));
  const totalEvents = [39, 27, 18, 18, 49, 15, 33, 1, 12, 6, 12, 12, 12, 12, 12, 3, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12];
  const totalTokens = ["61.3K", "37.39K", "32.22K", "27.99K", "349.95K", "24.39K", "189.84K", "285", "27.99K", "1.17K", "24.7K", "30.98K", "24.65K", "28.11K", "24.57K", "215", "27.99K", "29.69K", "24.57K", "28.11K", "24.57K", "215", "27.99K", "29.69K", "24.57K", "28.11K", "24.57K", "29.69K"];
  if (recordId) return <RecordDetail record={records[0] ?? workspace.collections.users.records[0]} surface="users" basePath={basePath} />;
  return <main className="captured-users-surface"><div className="captured-users-controls"><label><Search /><input aria-label="Search User ID" placeholder="Search (User ID)" value={search} onChange={(event) => { const value = event.target.value; setSearch(value); updateUsersSearch(value); }} /></label><button type="button">Env <span>⌄</span><b>1</b></button><button type="button">Filters <span>⌄</span></button></div><div className="captured-users-table-wrap"><table><thead><tr><th>User ID ⓘ</th><th>Environment</th><th>First Event ⓘ</th><th>Last Event ⓘ</th><th>Total Events ⓘ</th><th>Total Tokens ⓘ</th></tr></thead><tbody>{records.slice(0, 19).map((record, index) => <tr key={record.id}><td><Link href={`${basePath}/users/${encodeURIComponent(record.id)}`}>{record.id}</Link></td><td><span>default</span></td><td>{formatUserEventTimestamp(record.timestamp)}</td><td>{formatUserEventTimestamp(record.timestamp)}</td><td>{totalEvents[index] ?? 12}</td><td>{totalTokens[index] ?? "27.99K"}</td></tr>)}</tbody></table></div><footer className="captured-table-footer"><span>Rows <strong>50</strong>⌄</span><span>Page <strong>1</strong> of 1</span><button type="button" disabled>‹</button><button type="button" disabled>›</button></footer></main>;
}

function formatUserEventTimestamp(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/);
  if (!match) return value;
  const [, year, month, day, rawHour, minute, second] = match;
  const hour = Number(rawHour);
  return `${Number(month)}/${Number(day)}/${year} ${hour % 12 || 12}:${minute}:${second} ${hour >= 12 ? "PM" : "AM"}`;
}
