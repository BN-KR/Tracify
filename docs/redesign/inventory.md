# Tracify Authenticated Dashboard Route Inventory

> **No-code-change boundary:** This document is a read-only reference.
> It describes the existing authenticated surface as shipped. No
> application source files were modified to produce it.

---

## Authenticated Dashboard Route Inventory

This inventory covers every logged-in dashboard route at
`cloud.tracify.tech` and `eu.cloud.tracify.tech`.  Both hosts serve the
same Next.js application; the region is resolved at runtime via
`getTracifyRegion()`.  All routes below require a valid Clerk session.

Routes are grouped by functional area, matching the sidebar navigation
groups defined in `src/components/dashboard/dashboard-sidebar.tsx`.

---

### Authentication Boundary

| URL pattern | Source file | Description |
|---|---|---|
| `/sign-in/[[...sign-in]]` | `src/app/(frontend)/(auth)/sign-in/[[...sign-in]]/page.tsx` | Clerk-hosted sign-in page |
| `/sign-up/[[...sign-up]]` | `src/app/(frontend)/(auth)/sign-up/[[...sign-up]]/page.tsx` | Clerk-hosted sign-up page |
| `/auth/callback` | `src/app/(frontend)/auth/callback/` | OAuth callback handler |
| `/auth/error` | `src/app/(frontend)/auth/error/` | Auth error display |
| `/forgot-password` | `src/app/(frontend)/forgot-password/` | Password reset request |
| `/reset-password` | `src/app/(frontend)/reset-password/` | Password reset confirm |
| `/accept-invitation` | `src/app/(frontend)/accept-invitation/` | Org/team invitation acceptance |

Authentication is enforced by Clerk Keyless mode in local dev and via
a Clerk JWT template named `convex` (audience `convex`) in production.
The middleware at `src/middleware.ts` guards all `/dashboard/*` routes.

---

### Onboarding Flow

| URL pattern | Source file | Description |
|---|---|---|
| `/onboarding` | `src/app/(frontend)/onboarding/` | Onboarding entry; redirects to first step |
| `/onboarding/project` | `src/app/(frontend)/onboarding/project/` | Name and create a new project |
| `/onboarding/api-key` | `src/app/(frontend)/onboarding/api-key/` | API key shown once (HMAC-SHA256, prefix `tracify_sk_live_`) |
| `/onboarding/install` | `src/app/(frontend)/onboarding/install/` | SDK install instructions (TS / Python) |
| `/onboarding/waiting` | `src/app/(frontend)/onboarding/waiting/` | Polls for first trace ingestion |
| `/onboarding/success` | `src/app/(frontend)/onboarding/success/` | First-trace confirmation |

LocalStorage keys used by onboarding: `tracify.onboarding.*`

---

### Cloud Region Selector

| URL pattern | Source file | Description |
|---|---|---|
| `/cloud` | `src/app/(frontend)/cloud/` | Regional endpoint directory |
| `/cloud/connecting` | `src/app/(frontend)/cloud/connecting/` | Region connection handshake |
| `/cloud/mode` | `src/app/(frontend)/cloud/mode/` | Choose Sandbox (playground) or Build (live project) |
| `/cloud/region` | `src/app/(frontend)/cloud/region/` | Legacy route — redirects to `/cloud` |

---

### Dashboard Root — Project Selector

| URL pattern | Source file | Description |
|---|---|---|
| `/dashboard` | `src/app/(frontend)/dashboard/page.tsx` | `DashboardHomeRouter`: selects the last-used project from `tracify.lastProjectId` localStorage key; renders project list when none is set |

Layout: `src/app/(frontend)/dashboard/layout.tsx` wraps every dashboard
route in `DashboardShell` with `canAccessContent={false}` for org-level
pages.

---

### Organization & Account Management

These pages live under `/dashboard` but are **not** project-scoped.

| URL pattern | Source file | Description |
|---|---|---|
| `/dashboard/account` | `src/app/(frontend)/dashboard/account/page.tsx` | User profile, email, sign-out; `NotificationPreferences` component |
| `/dashboard/organizations` | `src/app/(frontend)/dashboard/organizations/page.tsx` | List and switch between Clerk organizations; `OrganizationWorkspace` component |
| `/dashboard/organization-settings` | `src/app/(frontend)/dashboard/organization-settings/page.tsx` | Org name, invite members, manage projects; `OrganizationSettings` component |
| `/dashboard/members` | `src/app/(frontend)/dashboard/members/page.tsx` | Read-only member list via `ProjectMembers` |
| `/dashboard/alerts` | `src/app/(frontend)/dashboard/alerts/page.tsx` | **Redirect** → `/dashboard` |
| `/dashboard/api-keys` | `src/app/(frontend)/dashboard/api-keys/page.tsx` | **Redirect** → `/dashboard` |
| `/dashboard/billing` | `src/app/(frontend)/dashboard/billing/page.tsx` | **Redirect** → `/dashboard` |
| `/dashboard/compare` | `src/app/(frontend)/dashboard/compare/page.tsx` | **Redirect** → `/dashboard` |
| `/dashboard/control` | `src/app/(frontend)/dashboard/control/page.tsx` | **Redirect** → `/dashboard` |
| `/dashboard/costs` | `src/app/(frontend)/dashboard/costs/page.tsx` | **Redirect** → `/dashboard` |
| `/dashboard/datasets` | `src/app/(frontend)/dashboard/datasets/page.tsx` | **Redirect** → `/dashboard` |
| `/dashboard/evaluation` | `src/app/(frontend)/dashboard/evaluation/page.tsx` | Live Evaluation Engine page; `DashboardTopbar` and `EvaluationEngineDashboard` with empty `projectId` |
| `/dashboard/experiments` | `src/app/(frontend)/dashboard/experiments/page.tsx` | **Redirect** → `/dashboard` |
| `/dashboard/investigate` | `src/app/(frontend)/dashboard/investigate/page.tsx` | **Redirect** → `/dashboard` |
| `/dashboard/manage` | `src/app/(frontend)/dashboard/manage/page.tsx` | **Redirect** → `/dashboard` |
| `/dashboard/playground` | `src/app/(frontend)/dashboard/playground/page.tsx` | **Redirect** → `/dashboard` |
| `/dashboard/prompts` | `src/app/(frontend)/dashboard/prompts/page.tsx` | **Redirect** → `/dashboard` |
| `/dashboard/quickstart` | `src/app/(frontend)/dashboard/quickstart/page.tsx` | **Redirect** → `/dashboard` |
| `/dashboard/reports` | `src/app/(frontend)/dashboard/reports/page.tsx` | **Redirect** → `/dashboard` |
| `/dashboard/resilience` | `src/app/(frontend)/dashboard/resilience/page.tsx` | **Redirect** → `/dashboard` |
| `/dashboard/runs` | `src/app/(frontend)/dashboard/runs/page.tsx` | **Redirect** → `/dashboard` |
| `/dashboard/search` | `src/app/(frontend)/dashboard/search/page.tsx` | **Redirect** → `/dashboard` |
| `/dashboard/sessions` | `src/app/(frontend)/dashboard/sessions/page.tsx` | **Redirect** → `/dashboard` |
| `/dashboard/settings` | `src/app/(frontend)/dashboard/settings/page.tsx` | **Redirect** → `/dashboard` |

---

### Project-Scoped Dashboard

All routes below are prefixed `/dashboard/[projectId]/`.  The
`[projectId]` layout at `src/app/(frontend)/dashboard/[projectId]/layout.tsx`
wraps every page in `ProjectRouteGate` which validates project access.

#### Primary — Overview & Dashboards

| URL pattern | Source file | Description |
|---|---|---|
| `/dashboard/[projectId]` | `src/app/(frontend)/dashboard/[projectId]/page.tsx` | Project overview: KPI tiles, activity charts, run summaries; `ProjectDashboardContent` |
| `/dashboard/[projectId]/dashboards` | `src/app/(frontend)/dashboard/[projectId]/dashboards/page.tsx` | Custom dashboard gallery; `LiveCapturedDashboards` |
| `/dashboard/[projectId]/dashboards/[dashboardId]` | `src/app/(frontend)/dashboard/[projectId]/dashboards/[dashboardId]/page.tsx` | Single custom dashboard; `LiveCapturedDashboards` with `dashboardId` |
| `/dashboard/[projectId]/dashboards/new` | `src/app/(frontend)/dashboard/[projectId]/dashboards/new/page.tsx` | Redirects to `/dashboards?view=create` |
| `/dashboard/[projectId]/widgets` | `src/app/(frontend)/dashboard/[projectId]/widgets/page.tsx` | **Redirect** → `/dashboard/[projectId]/dashboards` (Widget library alias) |
| `/dashboard/[projectId]/quickstart` | `src/app/(frontend)/dashboard/[projectId]/quickstart/page.tsx` | In-app quickstart guide; `QuickstartGuide` |
| `/dashboard/[projectId]/docs` | `src/app/(frontend)/dashboard/[projectId]/docs/page.tsx` | Embedded documentation viewer; `DocsViewer` |

---

#### Observability — Tracing, Sessions, Users, Alerts

| URL pattern | Source file | Description |
|---|---|---|
| `/dashboard/[projectId]/tracing` | `src/app/(frontend)/dashboard/[projectId]/tracing/page.tsx` | Paginated trace/run list with filters; `LiveCapturedTracing` |
| `/dashboard/[projectId]/tracing/[runId]` | `src/app/(frontend)/dashboard/[projectId]/tracing/[runId]/page.tsx` | Full trace detail — span waterfall, LLM call breakdown, token counts; `LiveCapturedTracing` with `runId` |
| `/dashboard/[projectId]/runs` | `src/app/(frontend)/dashboard/[projectId]/runs/page.tsx` | **Redirect** → `/tracing` |
| `/dashboard/[projectId]/runs/[runId]` | `src/app/(frontend)/dashboard/[projectId]/runs/[runId]/page.tsx` | **Redirect** → `/tracing/[runId]` |
| `/dashboard/[projectId]/traces` | `src/app/(frontend)/dashboard/[projectId]/traces/page.tsx` | **Redirect** → `/tracing` |
| `/dashboard/[projectId]/traces/setup` | `src/app/(frontend)/dashboard/[projectId]/traces/setup/` | Tracing setup / instrumentation guide |
| `/dashboard/[projectId]/sessions` | `src/app/(frontend)/dashboard/[projectId]/sessions/page.tsx` | Conversation session list with thread grouping; `LiveCapturedSessions` |
| `/dashboard/[projectId]/sessions/[sessionId]` | `src/app/(frontend)/dashboard/[projectId]/sessions/[sessionId]/page.tsx` | Single session detail — full message thread replay; `LiveCapturedSessions` with `sessionId` |
| `/dashboard/[projectId]/users` | `src/app/(frontend)/dashboard/[projectId]/users/page.tsx` | End-user list with usage stats; `LiveCapturedUsers` |
| `/dashboard/[projectId]/users/[userId]` | `src/app/(frontend)/dashboard/[projectId]/users/[userId]/page.tsx` | Single user profile — session history, cost attribution; `LiveCapturedUsers` with `userId` |
| `/dashboard/[projectId]/journey/[runId]` | `src/app/(frontend)/dashboard/[projectId]/journey/[runId]/page.tsx` | Agent journey view — node graph of tool calls for a single run; `AgentJourney` |
| `/dashboard/[projectId]/alerts` | `src/app/(frontend)/dashboard/[projectId]/alerts/page.tsx` | Alert rule list and status; `LiveCapturedAdmin` section `alerts` |
| `/dashboard/[projectId]/alerts/new` | `src/app/(frontend)/dashboard/[projectId]/alerts/new/page.tsx` | Create new alert rule |
| `/dashboard/[projectId]/search` | `src/app/(frontend)/dashboard/[projectId]/search/page.tsx` | **Redirect** → `/tracing` (preserves query params) |
| `/dashboard/[projectId]/operations` | `src/app/(frontend)/dashboard/[projectId]/operations/page.tsx` | **Redirect** → `/sessions` |

---

#### Analysis — Costs, Reports, Trace Compare, Investigation

| URL pattern | Source file | Description |
|---|---|---|
| `/dashboard/[projectId]/costs` | `src/app/(frontend)/dashboard/[projectId]/costs/page.tsx` | Token cost breakdown by model/run; savings chart; `LiveCapturedHome` surface `costs` |
| `/dashboard/[projectId]/reports` | `src/app/(frontend)/dashboard/[projectId]/reports/page.tsx` | Print-friendly project report; `ProjectReport` |
| `/dashboard/[projectId]/compare` | `src/app/(frontend)/dashboard/[projectId]/compare/page.tsx` | **Redirect** → `/tracing?mode=compare` (side-by-side trace comparison) |
| `/dashboard/[projectId]/investigate` | `src/app/(frontend)/dashboard/[projectId]/investigate/page.tsx` | Root-cause investigation mode; `InvestigationMode` |

---

#### Prompt Management & Playground

| URL pattern | Source file | Description |
|---|---|---|
| `/dashboard/[projectId]/prompts` | `src/app/(frontend)/dashboard/[projectId]/prompts/page.tsx` | Prompt version library; `LiveCapturedPrompts` |
| `/dashboard/[projectId]/prompts/new` | `src/app/(frontend)/dashboard/[projectId]/prompts/new/page.tsx` | Create new prompt version |
| `/dashboard/[projectId]/prompt-management` | `src/app/(frontend)/dashboard/[projectId]/prompt-management/page.tsx` | **Redirect** → `/prompts` |
| `/dashboard/[projectId]/playground` | `src/app/(frontend)/dashboard/[projectId]/playground/page.tsx` | Interactive prompt playground with live model calls; `PromptPlayground` + `ImproveLifecycleNav` |

---

#### Evaluation — Scores, Evaluators, Annotation, Datasets, Experiments

| URL pattern | Source file | Description |
|---|---|---|
| `/dashboard/[projectId]/scores` | `src/app/(frontend)/dashboard/[projectId]/scores/page.tsx` | Aggregate score trends and distributions; `LiveCapturedEvaluation` section `scores` |
| `/dashboard/[projectId]/scores/analytics` | `src/app/(frontend)/dashboard/[projectId]/scores/analytics/page.tsx` | Deeper score analytics; `LiveCapturedEvaluation` section `scores` toolbar `Scores analytics` |
| `/dashboard/[projectId]/evaluators` | `src/app/(frontend)/dashboard/[projectId]/evaluators/page.tsx` | Evaluator definitions (LLM-as-judge, heuristic); `LiveCapturedEvaluation` section `evaluators` |
| `/dashboard/[projectId]/evals` | `src/app/(frontend)/dashboard/[projectId]/evals/page.tsx` | **Redirect** → `/evaluators` |
| `/dashboard/[projectId]/evals/rules` | `src/app/(frontend)/dashboard/[projectId]/evals/rules/page.tsx` | Evaluation rule builder; `EvaluationEngineDashboard` section `evaluators` |
| `/dashboard/[projectId]/evaluation` | `src/app/(frontend)/dashboard/[projectId]/evaluation/page.tsx` | **Redirect** → `/evaluators` |
| `/dashboard/[projectId]/evaluation/datasets` | `src/app/(frontend)/dashboard/[projectId]/evaluation/datasets/page.tsx` | Datasets sub-tab within evaluation workspace |
| `/dashboard/[projectId]/evaluation/evaluators` | `src/app/(frontend)/dashboard/[projectId]/evaluation/evaluators/page.tsx` | Evaluators sub-tab |
| `/dashboard/[projectId]/evaluation/monitors` | `src/app/(frontend)/dashboard/[projectId]/evaluation/monitors/page.tsx` | Continuous evaluation monitors |
| `/dashboard/[projectId]/evaluation/review` | `src/app/(frontend)/dashboard/[projectId]/evaluation/review/page.tsx` | Human review queue within evaluation |
| `/dashboard/[projectId]/evaluation/runs` | `src/app/(frontend)/dashboard/[projectId]/evaluation/runs/page.tsx` | Evaluation run history |
| `/dashboard/[projectId]/evaluation/settings` | `src/app/(frontend)/dashboard/[projectId]/evaluation/settings/page.tsx` | Evaluation workspace settings |
| `/dashboard/[projectId]/annotation-queues` | `src/app/(frontend)/dashboard/[projectId]/annotation-queues/page.tsx` | Annotation queue list; `LiveCapturedAnnotations` |
| `/dashboard/[projectId]/human-annotation` | `src/app/(frontend)/dashboard/[projectId]/human-annotation/page.tsx` | Human review/annotation interface; `ReviewQueue` |
| `/dashboard/[projectId]/datasets` | `src/app/(frontend)/dashboard/[projectId]/datasets/page.tsx` | Dataset list for eval/fine-tuning; `LiveCapturedEvaluation` section `datasets` |
| `/dashboard/[projectId]/experiments` | `src/app/(frontend)/dashboard/[projectId]/experiments/page.tsx` | A/B and multi-variant experiment runner; `LiveCapturedExperiments` |

---

#### Operations & Runtime Control

| URL pattern | Source file | Description |
|---|---|---|
| `/dashboard/[projectId]/control` | `src/app/(frontend)/dashboard/[projectId]/control/page.tsx` | Runtime policy / orchestration guardrails; `ProjectOrchestration` |
| `/dashboard/[projectId]/automations` | `src/app/(frontend)/dashboard/[projectId]/automations/page.tsx` | Automation rule editor; `AutomationsWorkspace` |
| `/dashboard/[projectId]/automations/new` | `src/app/(frontend)/dashboard/[projectId]/automations/new/page.tsx` | Create automation rule |
| `/dashboard/[projectId]/resilience` | `src/app/(frontend)/dashboard/[projectId]/resilience/page.tsx` | Resilience testing dashboard (fault injection, retry coverage); `ResilienceTestingDashboard` |

---

#### Settings — Project Configuration

All sub-tabs below canonically redirect to `/settings?tab=<name>` on the
main settings page which is rendered by `LiveCapturedAdmin` section `settings`.

| URL pattern | Source file | Tab / Description |
|---|---|---|
| `/dashboard/[projectId]/settings` | `src/app/(frontend)/dashboard/[projectId]/settings/page.tsx` | Main settings page; `LiveCapturedAdmin` section `settings` |
| `/dashboard/[projectId]/settings/api-keys` | `settings/api-keys/page.tsx` | **Redirect** → `settings?tab=API Keys` |
| `/dashboard/[projectId]/settings/audit-logs` | `settings/audit-logs/page.tsx` | **Redirect** → `settings?tab=Audit log` |
| `/dashboard/[projectId]/settings/batch-actions` | `settings/batch-actions/page.tsx` | **Redirect** → `settings?tab=Batch Actions` |
| `/dashboard/[projectId]/settings/exports` | `settings/exports/page.tsx` | **Redirect** → `settings?tab=Exports` |
| `/dashboard/[projectId]/settings/integrations` | `settings/integrations/page.tsx` | **Redirect** → `settings?tab=Integrations` |
| `/dashboard/[projectId]/settings/llm-connections` | `settings/llm-connections/page.tsx` | **Redirect** → `settings?tab=LLM Connections` |
| `/dashboard/[projectId]/settings/mcp-cli` | `settings/mcp-cli/page.tsx` | **Redirect** → `settings?tab=MCP & CLI` |
| `/dashboard/[projectId]/settings/model-definitions` | `settings/model-definitions/page.tsx` | **Redirect** → `settings?tab=Model Definitions` |
| `/dashboard/[projectId]/settings/notifications` | `settings/notifications/page.tsx` | **Redirect** → `settings?tab=Notifications` |
| `/dashboard/[projectId]/settings/scores-configs` | `settings/scores-configs/page.tsx` | **Redirect** → `settings?tab=Scores` |

Settings tabs surfaced from the page:
`General` · `API Keys` · `MCP & CLI` · `LLM Connections` · `Model Definitions` · `Scores` · `Members` · `Integrations` · `Exports` · `Batch Actions` · `Audit log` · `Notifications` · `Billing`

| URL pattern | Source file | Description |
|---|---|---|
| `/dashboard/[projectId]/api-keys` | `src/app/(frontend)/dashboard/[projectId]/api-keys/page.tsx` | Standalone API key manager; `ApiKeysManager` |
| `/dashboard/[projectId]/billing` | `src/app/(frontend)/dashboard/[projectId]/billing/page.tsx` | Plan tier, ingest quota, upgrade; `BillingPlan` + `IngestQuotaCard` |
| `/dashboard/[projectId]/manage` | `src/app/(frontend)/dashboard/[projectId]/manage/page.tsx` | Project lifecycle management and stats; `ProjectManagement` |

---

### Standalone Playground (Unauthenticated / Synthetic)

| URL pattern | Source file | Description |
|---|---|---|
| `/playground` | `src/app/(frontend)/playground/` | Root — Sandbox home; `DashboardShell` with `synthetic=true` |
| `/playground/[...slug]` | `src/app/(frontend)/playground/[...slug]/` | Dynamic route handles every sidebar section (tracing, sessions, users, prompts, playground, scores, evaluators, datasets, experiments, resilience, control, alerts, automations, operations, settings, manage, api-keys, billing, widgets, compare) in Sandbox mode |

The playground uses the same sidebar groups as authenticated projects but
routes within `/playground/*` instead of `/dashboard/[projectId]/*`.

---

### Admin (Restricted)

| URL pattern | Source file | Description |
|---|---|---|
| `/admin` | `src/app/(frontend)/admin/` | Internal admin entry — independent auth gate |
| `/admin/composer` | `src/app/(frontend)/admin/composer/` | Content composer tool |
| `/admin/leads` | `src/app/(frontend)/admin/leads/` | Lead / early-access list |
| `/admin/library` | `src/app/(frontend)/admin/library/` | Component / asset library |

---

### Navigation & Shell Architecture

#### Sidebar groups (from `dashboard-sidebar.tsx`)

The sidebar renders two configurations depending on whether a `projectId`
is present.

**With `projectId` (full project workspace):**

| Group ID | Label | Items |
|---|---|---|
| `observe` | Observe | Home, Dashboards, Tracing, Sessions, Users, Search |
| `analyze` | Analyze | Costs, Reports, Trace Compare, Investigation |
| `improve` | Improve | Prompt Management, Evaluation, Scores, Evaluators, Human Annotation, Datasets, Experiments, Playground, Resilience |
| `operate` | Operate | Runtime Policy, Alerts, Automations, Operations, Integrations |
| `manage` | Manage | Settings, Members, Manage, API Keys, Billing, Widget library, Upgrade Plan |

**Without `projectId` (org-level / pre-project):**

| Group ID | Label | Items |
|---|---|---|
| `primary` | — | Home, Dashboards |
| `observe` | Observability | Tracing, Sessions, Users, Alerts |
| `improve` | Prompt Management | Prompts, Playground |
| `analyze` | Evaluation | Scores, Evaluators, Human Annotation, Datasets, Experiments |
| `manage` | — | Settings |
| `resources` | — | Book a call, Support |

#### Responsive behaviour

- Breakpoint `≤700 px` collapses sidebar into a mobile drawer toggled by
  a hamburger button.
- Collapsed rail width: `48 px` (3 rem) — shows icons only.
- Expanded width: `184 px` (11.5 rem).
- State persisted in `localStorage`:
  - Collapse state: `tracify.sidebar.collapsed`
  - Group open/close state: `tracify:dashboard-sidebar-groups`
- Keyboard shortcut `Ctrl+\` (or `⌘+\`) toggles sidebar collapse.
- Keyboard shortcut `Alt+Shift+O` (or `⌥⇧O`) navigates to the current
  project overview.

#### Dashboard shell theming

- The shell renders `data-dashboard-theme="tracify-v2"` by default.
- Legacy theme (`tracify-v2` → `legacy`) toggled via `?ui=legacy` query
  param or `NEXT_PUBLIC_TRACIFY_DASHBOARD_V2=false` env var.
- Background colours: `#101010` (content area) / `#000000` (sidebar).
- Sidebar text: `text-white/70` with `font-mono`.

---

### URL-Backed State Patterns

| Mechanism | Location | Example |
|---|---|---|
| `?tab=<name>` | Settings page | `/settings?tab=Members` |
| `?mode=compare` | Tracing page | `/tracing?mode=compare` |
| `?view=create` | Dashboards | `/dashboards?view=create` |
| `?ui=legacy` | All dashboard pages | Switches to legacy UI theme |
| `tracify.lastProjectId` localStorage | Dashboard root | Restores last project on return |

---

### Live Data Adapters

| Adapter component | Data source | Used by |
|---|---|---|
| `LiveCapturedTracing` | Tinybird time-series + Convex metadata | Tracing pages |
| `LiveCapturedSessions` | Tinybird + Convex | Sessions pages |
| `LiveCapturedUsers` | Tinybird + Convex | Users pages |
| `LiveCapturedHome` | Tinybird + Convex | Overview, Costs |
| `LiveCapturedDashboards` | Convex | Dashboards pages |
| `LiveCapturedPrompts` | Convex | Prompts page |
| `LiveCapturedEvaluation` | Convex | Scores, Evaluators, Datasets |
| `LiveCapturedExperiments` | Convex | Experiments page |
| `LiveCapturedAnnotations` | Convex | Annotation queues page |
| `LiveCapturedAdmin` | Convex | Alerts, Settings |
| `CapturedWorkspace` | Convex (workspace context) | All pages using project workspace frame |

Redis is used as an API cache layer between Tinybird and the dashboard.
Ingestion path: SDK → `POST /api/ingest` → Inngest → Tinybird + Convex.

---

### Existing Interactions to Preserve

The following interactions must be preserved conceptually in any redesign:

1. **Project switcher** — `ProjectSwitcher` component in sidebar header;
   stores selection in `tracify.lastProjectId`.
2. **Sidebar collapse** — toggle rail/full mode; persists in
   `tracify.sidebar.collapsed`; keyboard shortcut `Ctrl+\`.
3. **Sidebar group collapse** — per-group open state in
   `tracify:dashboard-sidebar-groups`.
4. **Mobile drawer** — ≤700 px viewport triggers overlay drawer mode.
5. **Trace waterfall** — span-level drill-down in tracing detail page.
6. **Agent journey graph** — node graph for `/journey/[runId]`.
7. **Side-by-side trace compare** — `/tracing?mode=compare`.
8. **Prompt playground live calls** — real model API calls from the
   playground editor.
9. **Human annotation queue** — review and label individual spans or
   outputs.
10. **Custom dashboard builder** — drag-and-compose widget layout in
    `/dashboards`.
11. **Evaluation run pipeline** — trigger, monitor, and review evaluation
    runs end to end.
12. **Alert rule builder** — `/alerts/new` create/edit alert conditions.
13. **Automation rule builder** — `/automations/new` create/edit
    automation triggers and actions.
14. **Settings tab navigation** — URL-backed tab state `?tab=<name>`.
15. **Region selector** — `/cloud` → `/cloud/mode` pre-auth flow.
