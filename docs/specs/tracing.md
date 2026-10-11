# Spec: Tracing

Status: approved by owner 2026-10-11. This file is also the template for every page spec.

## Goal
Find, filter and understand any agent run in seconds, on real data, in one polished dark screen.

## Owner decisions (from the spec questions)
- Trace detail opens in a **side panel**; the list stays visible.
- Above the table: **count over time** bar chart; clicking a bar narrows the time range.
- Detail view: **tree** of steps (agent → LLM → tool), each with time, cost and tokens.
- **Dark only.**

## Features (every item must work on real data; nothing fake or disabled)
List
- Time range picker (1h, 24h, 7d, 30d, custom) drives table and chart.
- Search box: trace name, trace id, input/output text.
- Filter sidebar: status, trace name, model, environment, release, user, session, tag, latency range, cost range. Active filters show as removable chips.
- Table columns: start time, status, trace name, input preview, output preview, latency, cost, tokens, model, user, session, tags. Column picker (show/hide), persisted per browser.
- Sort by start time, latency, cost.
- Pagination with rows-per-page; total count.
- Empty, loading and error states with a clear next action.

Detail panel
- Header: trace name, id (copy), status, latency, cost, tokens, user and session links, tags.
- Tree: nested steps from parentSpanId; collapse/expand; per-step type icon, name, latency, cost, tokens; errors in red.
- Step view: formatted input/output (chat messages rendered, JSON pretty-printed) with a raw toggle; attributes (model, tool, prompt version, environment, release, time to first token, retries, error type/message).
- Keyboard: up/down moves between traces, Esc closes the panel.

## Data
- List and chart: Tinybird spans (searchTraces / a count-by-bucket query), Convex agentRuns for status.
- Tree: spans_by_run including parentSpanId, tokens, errors.

## Acceptance
- Click-every-control browser test on the preview with the robot account: every button, filter, sort, pager, row and tree node does something visible; no console errors.
- Desktop (1440) and phone (390) screenshots posted to Teams.
- Preview link posted to Teams.
