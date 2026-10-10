# Tracify Dashboard — Visual Direction Concepts

> **No-code-change boundary:** This document proposes three distinct
> visual directions for a professional AI-observability dashboard. It is
> a design-reference document only. No application source files were
> modified to produce it. All directions are built on the existing stack:
> shadcn/ui (base-nova), 21st.dev components, and GSAP for motion.

---

## Visual Direction 1

### "Signal / Noise" — Monochrome Terminal Precision

**Design philosophy:** Data-first, zero decoration. Every pixel earns
its place by reducing cognitive load or surfacing a signal. Inspired by
high-frequency trading terminals and unix system monitors — a tool that
a senior engineer treats as a trusted instrument, not a consumer app.

---

#### Colour System

| Token | Value | Usage |
|---|---|---|
| `--bg-shell` | `#0a0a0a` | Sidebar background |
| `--bg-canvas` | `#111111` | Main content area |
| `--bg-surface` | `#1a1a1a` | Cards, panels |
| `--bg-raised` | `#222222` | Hover state, selected rows |
| `--border` | `#2a2a2a` | All borders |
| `--text-primary` | `#f0f0f0` | Headings, active labels |
| `--text-secondary` | `rgba(240,240,240,0.55)` | Body, metadata |
| `--text-muted` | `rgba(240,240,240,0.30)` | Timestamps, secondary labels |
| `--accent-signal` | `#f4d44d` | Single accent — errors, active state, CTA |
| `--accent-ok` | `#3ddc97` | Success/healthy indicators |
| `--accent-warn` | `#f4a22d` | Warning indicators |
| `--accent-fail` | `#e05252` | Error/failure indicators |

**Palette rule:** Monochrome substrate; colour is reserved exclusively
for semantic signal states (ok / warn / fail) and the single brand
accent yellow. No decorative colour.

---

#### Typography

| Role | Font | Size / Weight | Letter-spacing |
|---|---|---|---|
| Wordmark / H1 | Geist Pixel Square | 32–64 px / 400 | -0.05 em |
| Section heading | Geist Mono | 11 px / 500 | +0.14 em uppercase |
| Data label | Geist Mono | 10 px / 400 | +0.10 em uppercase |
| Body / description | Geist Mono | 12 px / 400 | 0 |
| Metric value | Geist Mono | 28–48 px / 600 | -0.03 em tabular-nums |
| Code / span ID | Geist Mono | 11 px / 400 | 0 |

**Density:** Compact. Row height 32 px in tables; padding 8 px on
cards; no rounded corners (`border-radius: 0`).

---

#### Navigation Layout

- **Left rail** — 48 px collapsed / 184 px expanded (matches current
  shell dimensions exactly; no layout shift for existing users).
- Collapsed state shows icons only in a 48 px rail; active icon
  highlighted with `--accent-signal` left border (3 px) and icon
  tinted yellow.
- Expanded state shows icon + label in `Geist Mono 10px uppercase`.
- Group labels rendered as full-width muted dividers (no chevrons).
- Project switcher at the top of the rail in a pill container;
  region flag and project name in monospace.
- Bottom of sidebar: user avatar (initials only) + collapse toggle.

---

#### Chart Style

Built with shadcn/ui charts (Recharts) and 21st.dev sparkline components.

| Chart type | Style |
|---|---|
| Time-series line | 1 px stroke, `--accent-signal` for primary metric, `--text-muted` for secondary; no fill |
| Bar / histogram | 2 px wide bars, monochrome fill `--bg-raised`, active bar `--accent-signal` |
| Sparkline (in tables) | 1 px stroke, 48 px wide, no axes |
| Scatter / heatmap | Dot size 4 px; colour mapped through 5-stop greyscale + accent for outliers |
| Donut / pie | Rarely used; when needed: monochrome segments with accent slice for focus |
| Axes | 10 px Geist Mono, `--text-muted`, no grid lines (use subtle horizontal rules at 20 % opacity) |
| Tooltips | shadcn/ui `<Tooltip>` dark variant; 10 px mono, `--bg-raised` background, 1 px `--border` |

---

#### Motion Rules (GSAP)

| Interaction | Motion | Duration | Easing |
|---|---|---|---|
| Page enter | `gsap.from(content, { opacity: 0, y: 8 })` | 120 ms | `power2.out` |
| Sidebar expand / collapse | `gsap.to(rail, { width: ... })` | 150 ms | `power2.inOut` |
| Row hover | CSS transition `background-color` | 80 ms | linear |
| Metric value update | `gsap.to(num, { innerHTML: newVal, snap: 'innerHTML' })` with GSAP counter | 600 ms | `power1.out` |
| Skeleton loading | CSS `@keyframes` shimmer `--bg-surface` → `--bg-raised` | 1200 ms | linear infinite |
| Error flash | `gsap.fromTo(el, { backgroundColor: '#e05252' }, { backgroundColor: 'transparent' })` | 400 ms | `power2.out` |
| Alert badge pulse | `gsap.to(dot, { scale: 1.4, repeat: -1, yoyo: true })` | 800 ms | `sine.inOut` |

**Rule:** No motion on idle content. Motion fires only on state change
or user action. `prefers-reduced-motion` disables all GSAP transforms;
opacity fades ≤120 ms remain.

---

#### Example Components

**KPI tile (shadcn/ui Card)**
```
┌─────────────────────────┐
│ TOTAL TOKENS             │  ← 10px Mono uppercase label, --text-muted
│ 24,871,042              │  ← 48px Mono tabular-nums, --text-primary
│ ▲ +12.4% vs last 7d     │  ← 10px Mono, --accent-ok
└─────────────────────────┘
```

**Trace row (shadcn/ui Table)**
```
RUN ID        MODEL       TOKENS   COST      LATENCY   STATUS
3fa2e1bc…     gpt-4o      4,821    $0.072    1.2 s     ● ok
```
Status dot: 6 px circle, colour from semantic tokens.

**Sidebar item (expanded)**
```
│ ∕  Tracing                │  ← icon + label; active: 3px yellow left-border
```

---

## Visual Direction 2

### "Glass Grid" — Translucent Data Architecture

**Design philosophy:** A contemporary SaaS aesthetic that signals trust
and modernity to a mixed technical/management audience. Semi-transparent
panels, a cool-neutral palette, and generous whitespace make complex data
readable at a glance for both engineers and executives in a single tool.
Inspired by Vercel Analytics, Linear, and Datadog's newer UI direction.

---

#### Colour System

| Token | Value | Usage |
|---|---|---|
| `--bg-shell` | `#0d1117` | Sidebar / shell background |
| `--bg-canvas` | `#0f1318` | Main content area |
| `--bg-glass` | `rgba(255,255,255,0.04)` | Card surface (glass panel) |
| `--bg-glass-hover` | `rgba(255,255,255,0.07)` | Card hover |
| `--border-glass` | `rgba(255,255,255,0.08)` | Card/panel borders |
| `--border-strong` | `rgba(255,255,255,0.16)` | Focused/active borders |
| `--text-primary` | `#e6edf3` | Headings, values |
| `--text-secondary` | `rgba(230,237,243,0.60)` | Labels, metadata |
| `--text-muted` | `rgba(230,237,243,0.35)` | Timestamps, hints |
| `--accent-primary` | `#3b82f6` | Primary CTA, active nav, links |
| `--accent-purple` | `#8b5cf6` | AI/LLM signal, evaluation |
| `--accent-emerald` | `#10b981` | Success, healthy |
| `--accent-amber` | `#f59e0b` | Warning |
| `--accent-red` | `#ef4444` | Error/failure |

**Palette rule:** Blue as the single dominant accent; purple reserved
for AI-specific indicators (LLM calls, token counts, evaluation scores);
status colours from the standard semantic set above.

---

#### Typography

| Role | Font | Size / Weight | Notes |
|---|---|---|---|
| Wordmark | Inter Display | 24 px / 700 | tracking -0.03 em |
| Page heading | Inter | 20 px / 600 | |
| Section label | Inter | 11 px / 500 | uppercase +0.08 em |
| Body | Inter | 13 px / 400 | line-height 1.6 |
| Data value | Inter | 32 px / 700 | tabular-nums |
| Code / IDs | Geist Mono | 12 px / 400 | |
| Table header | Inter | 11 px / 500 | uppercase |
| Table cell | Inter | 13 px / 400 | |

**Density:** Medium. Row height 40 px; card padding 20 px;
`border-radius: 8px` on cards and panels; `4px` on badges and tags.

---

#### Navigation Layout

- **Left sidebar** — 220 px wide (expanded), icon-only 64 px (collapsed).
- Background: `--bg-shell` with a 1 px right border `--border-glass`.
- Subtle `backdrop-filter: blur(8px)` on the sidebar when the content
  layer is scrolled (creates glass separation from content).
- Group headings as small uppercase labels with `--text-muted`.
- Active nav item: `--bg-glass-hover` background with a `--accent-primary`
  left indicator bar (2 px).
- Nested items indented 12 px; collapsible groups with animated
  chevrons.
- **Top bar** — 56 px; project switcher (left), global search (centre,
  `⌘K`), user avatar + notification bell (right).
- Breadcrumb trail beneath top bar on detail pages.

---

#### Chart Style

| Chart type | Style |
|---|---|
| Time-series area | Gradient fill from `--accent-primary` at 40 % opacity to transparent; 2 px stroke |
| Bar | Rounded top (radius 3 px); `--accent-primary` fill; hover highlights with glow shadow |
| Sparkline | 1.5 px stroke, `--accent-primary`; tiny gradient area |
| Scatter | 5 px dots; `--accent-purple` for LLM spans; alpha 60 % for density |
| Donut | 4 segments max; gap 2 px; animated entry (arc unfurl) |
| Heatmap (eval scores) | 5-step sequential blue scale from `--bg-glass` to `--accent-primary` |
| Tooltips | 13 px Inter, `--bg-shell` background, `box-shadow: 0 8px 24px rgba(0,0,0,0.4)` |
| Grid lines | Horizontal only; `--border-glass`; no vertical |

---

#### Motion Rules (GSAP)

| Interaction | Motion | Duration | Easing |
|---|---|---|---|
| Page enter | `gsap.from('.card', { opacity: 0, y: 16, stagger: 0.04 })` | 200 ms | `power3.out` |
| Sidebar collapse | `gsap.to(sidebar, { width: 64 })` + fade labels | 200 ms | `power2.inOut` |
| Card hover lift | CSS `transform: translateY(-2px)` + `box-shadow` increase | 120 ms | ease-out |
| Chart bar enter | `gsap.from(bars, { scaleY: 0, transformOrigin: 'bottom', stagger: 0.02 })` | 500 ms | `elastic.out(1, 0.5)` |
| Number counter | GSAP `innerHTML` counter snap | 800 ms | `power2.out` |
| Notification badge | Scale + opacity pop | 160 ms | `back.out(2)` |
| Skeleton shimmer | CSS gradient animation | 1400 ms | linear infinite |
| Drawer/sheet open | `gsap.from(drawer, { x: '100%' })` | 240 ms | `power3.out` |

**Rule:** Staggered card entry on initial page load only; subsequent
data refreshes animate only the changed values. Respect
`prefers-reduced-motion`.

---

#### Example Components

**KPI tile (shadcn/ui Card with glass)**
```
┌──────────────────────────────────────────────┐
│  LLM Calls this week          ↑ 18.2%        │
│  ─────────────────────────────────────────   │
│  1,284,091                                   │  ← 32px Inter 700
│  ═══════════════════════════════╸            │  ← sparkline
│  vs 1,086,812 last week                      │  ← 11px muted
└──────────────────────────────────────────────┘
```

**Trace row (shadcn/ui Table)**
```
● Run ID        Model      Tokens    Cost     P95 lat   Score
  3fa2e1bc      gpt-4o     4,821     $0.07    1.2s      ★ 0.92
```
LLM model badge in `--accent-purple`; score in `--accent-emerald`.

**Evaluation score card**
```
┌──────────────────────────────────────────────┐
│  FAITHFULNESS              Evaluator: GPT-4o │
│  ████████████████░░░░  84%                   │
│  ─────────────────────────────────────────   │
│  Pass rate trend  ╱╲╱──────╱                │
└──────────────────────────────────────────────┘
```

---

## Visual Direction 3

### "Amber Operations" — High-Contrast Industrial Monitoring

**Design philosophy:** An ops-room aesthetic for teams who monitor
production AI agents under pressure. High contrast, warm amber against
deep charcoal, scanline-inspired grid overlays, and a minimal colour
palette that remains legible on enterprise screen-share and projector
setups. Inspired by NOC dashboards, Bloomberg Terminal, and
industrial HMI systems.

---

#### Colour System

| Token | Value | Usage |
|---|---|---|
| `--bg-shell` | `#0c0c0a` | Sidebar / shell |
| `--bg-canvas` | `#131310` | Main content area |
| `--bg-surface` | `#1c1c18` | Cards, table rows |
| `--bg-active` | `#242420` | Selected/hover state |
| `--border` | `#2e2e28` | All structural borders |
| `--border-accent` | `rgba(255,176,0,0.25)` | Focus / active borders |
| `--text-primary` | `#f5f0e0` | Headings, values |
| `--text-secondary` | `rgba(245,240,224,0.60)` | Labels |
| `--text-muted` | `rgba(245,240,224,0.30)` | Timestamps, hints |
| `--amber-bright` | `#ffb000` | Primary accent — active states, CTAs, key metrics |
| `--amber-dim` | `rgba(255,176,0,0.40)` | Secondary amber use |
| `--amber-glow` | `rgba(255,176,0,0.12)` | Background tint on active elements |
| `--green-ok` | `#4ade80` | Healthy / ok status |
| `--red-fail` | `#f87171` | Error / failure |
| `--orange-warn` | `#fb923c` | Warning |

**Palette rule:** Amber is the dominant single accent — used for active
nav, primary metrics, and CTAs. Green and red are reserved for binary
ok/fail semantics only. No blue anywhere.

---

#### Typography

| Role | Font | Size / Weight | Notes |
|---|---|---|---|
| Wordmark | Geist Pixel Square | 28 px / 400 | tracking -0.04 em |
| Page heading | Geist Mono | 16 px / 700 | uppercase tracking +0.06 em |
| Section label | Geist Mono | 9 px / 500 | uppercase tracking +0.18 em |
| Body | Geist Mono | 12 px / 400 | |
| Data value | Geist Mono | 40 px / 700 | tabular-nums; amber for primary |
| Sub-value | Geist Mono | 14 px / 400 | dimmer amber |
| Code / IDs | Geist Mono | 11 px / 400 | |

**Density:** Compact-to-medium. Row height 36 px; card padding 16 px;
`border-radius: 2px` (slightly more than zero — avoids harsh aliasing on
projector screens); no shadows, depth conveyed through borders and
background levels.

---

#### Navigation Layout

- **Left sidebar** — 200 px (expanded), 52 px icon-only (collapsed).
- Background: `--bg-shell` with a right border `--border` 1 px.
- Group headings: `--amber-dim` text 9 px uppercase, ruled divider
  above each group.
- Active item: `--amber-glow` background fill + `--amber-bright` 3 px
  left border + icon tinted `--amber-bright`.
- Inactive icon: `--text-muted` at 60 %.
- Project switcher: amber border pill at sidebar top; region indicator
  in 9 px mono.
- Footer: collapse button + user initials badge (amber on dark).
- **Subtle scanline overlay** on the sidebar at 3 % opacity (CSS
  `repeating-linear-gradient`) — subtle texture, not retro pastiche.
- No top navigation bar; breadcrumb is embedded in the page header of
  each route.

---

#### Chart Style

| Chart type | Style |
|---|---|
| Time-series line | `--amber-bright` 1.5 px line; amber fill `--amber-glow`; no curve smoothing (straight segments) |
| Bar histogram | 2 px wide; `--amber-bright` fill; empty bars as `--bg-active` placeholders |
| Sparkline | 1 px amber line; no fill; width 56 px in table cells |
| Scatter | 4 px squares (not circles) for industrial feel; amber for selected spans |
| Heatmap (eval/scores) | 5-step sequential: `--bg-surface` → `--amber-bright`; gridlines at every cell |
| Gauge / radial | Amber arc on charcoal track; numeric in centre; GSAP animation on mount |
| Status grid | Small 12×12 px coloured squares in a grid; ok/warn/fail semantic colours |
| Tooltips | 10 px Geist Mono, `--bg-active` background, amber 1 px border |

---

#### Motion Rules (GSAP)

| Interaction | Motion | Duration | Easing |
|---|---|---|---|
| Page enter | `gsap.from('.panel', { opacity: 0, stagger: 0.03 })` — no Y offset | 160 ms | `power1.out` |
| Sidebar expand/collapse | Width tween | 160 ms | `power2.inOut` |
| Metric value update | GSAP counter with 2-decimal snap | 700 ms | `power1.out` |
| New alert badge enter | Scale from 0 + amber flash | 200 ms | `back.out(1.5)` |
| Row highlight on live update | `gsap.fromTo(row, { backgroundColor: '--amber-glow' }, { backgroundColor: 'transparent' })` | 800 ms | `power2.out` |
| Chart redraw | New data points slide in from right on x-axis | 300 ms | `power2.inOut` |
| Gauge fill | Arc lerp from 0 on mount | 900 ms | `power3.out` |
| Error state shake | `gsap.to(el, { x: [-4, 4, -2, 2, 0], ease: 'none' })` | 300 ms | — |

**Rule:** Live-updating rows flash amber on new data. All motion
communicates system state change, never decorative animation.
`prefers-reduced-motion` eliminates all transforms; opacity fades ≤160 ms remain.

---

#### Example Components

**KPI tile (operational style)**
```
┌────────────────────────────────────────────┐
│  ACTIVE RUNS                               │  ← 9px amber uppercase
│  ──────────────────────────────────────    │
│  247                                       │  ← 40px amber 700
│  PEAK TODAY: 412  |  7D AVG: 189           │  ← 9px muted
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░ 63%          │  ← progress bar
└────────────────────────────────────────────┘
```

**Trace row (high-density operational table)**
```
TIME        RUN ID    MODEL    TOKENS  LATENCY  STATUS
19:43:02    3fa2e1bc  gpt-4o   4,821    1.2s    ● OK
19:43:01    8bc91fa3  claude   2,103    0.8s    ● OK
19:42:59    1de44f2a  gpt-4o   9,210    3.4s    ▲ WARN
```
Status column: 8 px coloured square + mono label. Warn row background
gets subtle `--amber-glow` fill.

**Alert feed panel (live)**
```
┌─ ALERT FEED ──────────────── ● LIVE ──────┐
│ 19:43  P2  Token budget exceeded — prod    │  ← amber text
│ 19:41  P1  Eval score < 0.7 threshold     │  ← red text
│ 19:38  P3  Latency spike on gpt-4o        │  ← orange text
│ 19:35  OK  Resilience test passed         │  ← green text
└────────────────────────────────────────────┘
```

**Score gauge (21st.dev radial, GSAP animated)**
```
        ╔═══════════════╗
        ║    0.84       ║  ← amber Mono 40px
        ║  FAITHFULNESS ║  ← 9px muted uppercase
        ║  ●●●●●●●●○○   ║  ← 10-dot indicator
        ╚═══════════════╝
```

---

## Component Library Mapping

All three directions use the same underlying component primitives;
the visual direction is applied through CSS custom-property tokens and
Tailwind config overrides. No new primitives need to be introduced.

| Component need | shadcn/ui primitive | 21st.dev component | Notes |
|---|---|---|---|
| KPI tiles | `Card`, `CardContent` | `StatCard`, `MetricTile` | |
| Navigation | `Sidebar`, custom `NavItem` | `CommandMenu` for ⌘K | |
| Data table | `Table`, `DataTable` | `VirtualizedTable` | Virtualize for large trace lists |
| Charts | `ChartContainer` (Recharts) | `Sparkline`, `MiniChart` | |
| Timeline/waterfall | Custom SVG or `Timeline` | — | Trace waterfall |
| Gauge / radial | Custom SVG + GSAP | `RadialProgress` | |
| Drawer / sheet | `Sheet` | — | Mobile sidebar, detail panels |
| Command palette | `CommandDialog` | — | Global ⌘K search |
| Tooltip | `Tooltip`, `TooltipContent` | — | Chart tooltips |
| Badge / status dot | `Badge` | `StatusDot` | |
| Alert / toast | `Toast`, `Sonner` | — | Real-time alert feed |
| Code display | `CodeBlock` | — | Span input/output |
| Progress | `Progress` | `LinearProgress` | Quota / score bars |
| Skeleton | `Skeleton` | — | Loading states |
| Tabs | `Tabs`, `TabsList` | — | Settings page, evaluation sub-nav |
| Dialog / modal | `Dialog` | — | Confirm destructive actions |
| Dropdown | `DropdownMenu` | — | Row actions, project switcher |
| Form | `Form`, `Input`, `Select` | — | Alert/automation builders |

---

## Selecting Between Directions

| Criterion | Direction 1 — Signal/Noise | Direction 2 — Glass Grid | Direction 3 — Amber Operations |
|---|---|---|---|
| Primary audience | Senior engineers, CLI-first power users | Mixed eng + product + management | On-call engineers, NOC / ops teams |
| Design precedent | Datadog classic, Honeycomb | Vercel, Linear, Planetscale | Bloomberg, NOC dashboards, Grafana dark |
| Information density | Very high | Medium | High |
| Brand alignment | Direct continuation of current Tracify monochrome | Modern SaaS expansion | Differentiated operational positioning |
| Motion budget | Minimal, functional | Moderate, expressive | Minimal, state-driven |
| Risk | May feel unchanged to users expecting evolution | Glass effect requires care on low-end displays | Amber palette is opinionated; may not suit all customers |
| Recommended for | V2 refinement with existing users | New customer acquisition and executive reviews | AI ops / production monitoring use case |
