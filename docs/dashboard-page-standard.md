# Dashboard page standard

The Tracing page (`/dashboard/[projectId]/tracing`) is the reference implementation for every live
dashboard page. A new or rebuilt page is done only when it meets each section below and the proof in
"Done means" is attached to its PR. Reference code: `src/components/dashboard/tracing/`.

## Data

- Real data only. Lists and charts come from the project's analytics backend through an authenticated
  API route (`/api/projects/[projectId]/...`) that checks project access. No sandbox fixtures on live routes.
- One request returns everything the view needs for a filter state: the rows, the total count, chart
  buckets and summary stats. Summary stats cover every matching record, not just the visible page.
- Server queries build every filter into one shared clause function so list, chart and stats always agree.
- Values from the URL are validated and capped on the server (time range at most 90 days, text at 200 chars).

## Live by default

- New records appear without a reload or a Refresh click. Poll every 3–5 s while the tab is visible,
  and skip when the tab is hidden or a request is already in flight. Back off (double, capped at
  30–60 s) while nothing changes or a poll fails, and drop back to the base interval when data changes.
- A successful poll clears any earlier error, so one failed request never leaves the page stuck.
- Polled API routes must stay cheap: check project access once, remember it per session with
  `src/lib/access-cache.ts`, and skip Convex token, access and cache writes on later polls. For project-level
  routes use `denyProjectAccess(request, projectId)` from `src/lib/project-route-access.ts`, which does both. Per-poll
  Convex calls trip Convex's JWKS rate limit (HTTP 429) for every viewer.
- Every route that returns project data checks the viewer's access (`canAccessProject`), including
  detail routes looked up by id. Never use an unchecked lookup such as `agentRuns.getByRunId` for viewers.
- Show the state in the header: a "Live" control with a pulsing dot that the viewer can pause. Remember
  the choice per browser. Fixed (zoomed) time windows do not poll and say why.
- Re-render only when data changed, keep scroll and selection, and do not flash a loading state on polls.
- Rows that arrive after the first load get a short highlight. Detail panels update while open.

## Layout and look

- Dark dashboard palette: background `#0B0D10`, panels `#0E1115`/`#111418`, borders `#1F242C`/`#262C35`,
  text `#E6E9EE`, secondary `#8B93A1`, muted `#6B7380`. Yellow `#F4D44D` is the only accent (active
  state, selection bar, chart). Green `#5BE3A0` = ok/live, red `#FF6B6B`/`#FF8A8A` = errors, blue
  `#8AB4FF` = links that filter.
- Order top to bottom: header (title, search, time range, Live, Refresh) → active filter chips and page
  actions → summary stats strip → chart → table → footer (count, rows per page, paging).
- Numbers, ids, times and costs use the mono font. Times show relative ("5m ago") with the absolute
  local time on hover. Durations, costs and counts use the shared helpers in `tracing/format.ts`.
- No horizontal page scroll at any width from 360 px up. Wide tables scroll inside their container.
  Phones start with secondary panels (filters) collapsed.

## Interaction

- Every filter is in the URL, so any view can be shared and survives reload.
- Clicking a value in a row (model, user, session, tag) filters by it. Active filters show as removable
  chips with "Clear all".
- Clicking a chart bar zooms to that window, with a visible reset.
- Sortable columns show their direction and set `aria-sort`. Column choice is remembered per browser.
- Export: the visible rows download as CSV (spreadsheet-safe) and a single record downloads as JSON.
- Detail opens in a side panel with its own URL (`?trace=`), "Copy link", previous/next, and close.
- Keyboard: `/` focuses search, `j`/`k` or arrows move through rows, `Esc` closes the panel.
- Inside a detail view: filter by type with counts, search, expand/collapse all, jump to first error,
  and copy buttons on every payload.

## Grouped errors

Any page that lists records with errors shows an "Error groups" panel (`tracing/error-groups.tsx`).

- A group is the same tool (or model) + error type + the first 120 characters of the error message with
  ids, paths and numbers replaced (`ERROR_MESSAGE_KEY` in `src/lib/tinybird.ts`). Its id is a hash of the
  three, so it can live in the URL (`?errorGroup=`).
- A failed step uses the same rule as the record's error count (`IS_ERROR`), so the numbers agree.
- Each group shows count, records affected, first and last seen (relative, absolute on hover) and the tool.
  Sorted by count, top 20, with "top 20 of N" when there are more.
- Groups are computed over every record matching the current filters (use `matchingRunIds`, which shares
  the list's WHERE and HAVING), and the group filter uses the same time range, so "N traces" on a group
  equals the list total after clicking it. Test that for every group, not just one.
- Clicking a group adds a removable filter chip; clicking it again removes it. The panel's open/closed
  state is remembered per browser; the group query only runs while it is open.

## Detail views: tree, timeline, graph

Detail panels for a record made of steps offer `Tree | Timeline | Graph` tabs (`tracing/trace-views.tsx`).

- Tree stays the default. The chosen view is in the URL (`?view=`), and all views share one selected
  step, one data source (the polled detail request) and one set of step filters.
- Timeline: one bar per step on a shared time axis, in tree order, so overlapping bars show parallel
  work and gaps show waiting. Hover or focus shows name, latency, cost and tokens.
- Graph: steps as nodes with parent → child arrows. Colour = step type (the same colours as the type
  badges), size = latency, failed = red, selected = yellow ring. Clicking a node selects the step.
- Both are SVG/HTML from data already loaded; they need no extra request. Wide or tall views scroll
  inside their own box, never the page. Nodes and bars are buttons with a full `aria-label`.

## Aggregate map

Pages that summarise many records can add a `List | Map` toggle (`tracing/agent-map.tsx`, `?mode=map`).

- Computed on the server for the current range and filters (`traceAgentMap`), never from the visible
  page. Hard caps (40 nodes, 100 arrows) keep it fast; say "N of M" when capped.
- Nodes are tools and models; an arrow A → B counts how often B ran directly after A in the same record,
  with error rate and median latency (of B). Arrows with failures are red.
- Clicking a node or arrow switches back to the list, filtered (`?node=`, `?edge=`) to the records that
  contain it, with a chip. The node and arrow counts must equal the filtered list total.
- The map polls like the list (live, hidden-tab skip, back-off to 60 s) through its own route with the
  shared access check. Below the drawing, a table lists the busiest arrows: it is the accessible and
  phone-friendly way to use the map.

## States

- Loading, empty and error states are designed, not blank. Empty explains why (filters vs. no data)
  and offers the next action. Errors say what failed and offer "Try again".
- Nothing recorded is shown as a muted dash, never as an empty cell or `null`.

## Accessibility

- Real buttons and labels for every control; icon-only buttons have `aria-label`. Toggle buttons set
  `aria-pressed`. Live and summary regions are labelled. Contrast stays readable on the dark palette.

## Done means

Attach this evidence to the PR before asking for owner approval:

1. ESLint on changed files and full `tsc --noEmit` pass; production build succeeds.
2. On the Ready Vercel preview, signed in as the robot account:
   - the click-every-control test for the page passes with zero console or page errors;
   - the live-update test passes (a record sent after load appears in the list, and in an open detail view,
     in every detail view tab);
   - any counts the page shows for groups or map elements equal the filtered list totals;
   - screenshots at desktop (1440×900) and phone (390×844) widths, with no horizontal overflow.
3. The owner has looked at the preview and approved it. Visual changes never merge without that.
