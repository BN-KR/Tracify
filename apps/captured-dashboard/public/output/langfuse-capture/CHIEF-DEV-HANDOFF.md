# Langfuse dashboard reference — developer handoff

## Exact reference

Local preview: http://localhost:4173/output/langfuse-capture/pages/empty-home.html

Source file on the sender's machine: `C:\opencrawl\output\langfuse-capture\pages\empty-home.html`.

This is a rendered HTML capture of the empty Langfuse project, subsequently packaged with local asset links. It is not the Langfuse source repository or a working backend. The packaged page has zero script tags. Its appearance comes from captured HTML, inline styles/SVGs, and five original stylesheets.

## What to send

Send the whole `C:\opencrawl\output\langfuse-capture` folder, preserving its structure. The localhost URL works only on the sender's computer; the recipient must serve their own copy.

```
langfuse-capture/
  CHIEF-DEV-HANDOFF.md
  IMPLEMENTATION-PROMPT.md
  index.html                    # all packaged page links
  pages/
    empty-home.html             # authoritative target for this request
    017.html                    # empty-project Tracing
    023.html                    # populated demo Home
    025.html                    # populated demo Tracing
    ...
  assets/                       # actual dependencies referenced by pages
  raw/                          # original rendered HTML before packaging
  capture-manifest.json          # source URLs, files, scripts and assets
  packaging-report.json          # coverage and unresolved destinations
  verification-report.json       # local file-reference checks
  uncaptured.html                # placeholder for destinations not saved yet
```

The separately created `langfuse-fileset` folder is a secondary copy. The requested URL uses `langfuse-capture` exclusively. Top-level `C:\opencrawl\langfuse.html`, `langfuse.css`, and `langfuse.js` are earlier mock files and are not used by this page.

## Exact styling dependencies

The page links to these five files, in this order. Preserve their order when reproducing the reference:

1. `assets/515d44628f87714d.css`
2. `assets/49f7325df5594aed.css`
3. `assets/4537aa0dee131b6a.css`
4. `assets/371d0ca2ee200c6e.css`
5. `assets/03374a5bcd2175d9.css`

Shared images include `939a9b8c1571c75e.svg` (black wordmark), `d364d36d888eba44.svg` (white wordmark), and `79b9057c187b2055.svg` (icon), all under `assets/`. Many interface icons and charts are inline SVG inside the HTML. The document includes a captured profile image and account labels; replace these with the target product's own identity before shipping. Keep the original archive private and out of public deployment/commits.

Archived JS files are included as source evidence. They do not run in these packaged pages. Simply adding their script tags will not make the snapshot interactive: the production application expects its own routing, server rendering, authentication, and APIs.

## Preview on another machine

From the transferred `langfuse-capture` directory, with Python installed:

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Then open `http://localhost:4173/pages/empty-home.html` or `http://localhost:4173/index.html`.

On the existing OpenCrawl checkout, `node server.js` serves the repository root and the original longer URL. The static HTML does not require the crawler or its Playwright dependency to display.

Use HTTP for baseline comparison. Direct-file rendering has not been verified. The captured stylesheet links still carry `crossorigin="anonymous"`, which is a possible file-origin loading issue; the earlier explanation blaming only CSP was not verified. No universal direct-file compatibility is claimed.

## Integrate into your dashboard

First establish a visual baseline at the same viewport size and browser zoom. Open the captured reference and the target implementation side by side. Use actual computed CSS and element sizes to reproduce the sidebar, header, breadcrumb controls, card grid, text, borders, icons, spacing, and dark theme.

For a quick reference preview inside an existing app, place the whole folder under a static public path and embed `pages/empty-home.html` in an iframe. This preserves the capture and isolates its global CSS; it remains a static preview.

For a production dashboard, build components in the existing application's stack from the captured DOM and styles. Retain the host app's auth, routing, data layer and conventions. Extract reusable sidebar/header/card components; preserve the root theme classes and relevant CSS variables. Avoid importing the complete captured global styles into the host app without isolation, since resets and utility classes can conflict. Replace captured project/account data and links with application data and routes.

Implement menus, tabs, filters, time ranges, sidebar collapse, project switching, charts and empty states using the host app's own state and APIs. Match what is visible in the reference; never infer backend functionality from a static button. No-data chart messages are an intentional part of the empty-project state.

## Acceptance checks

- Match the reference at identical desktop viewport and zoom, then verify narrow layouts independently. Captured inline chart/grid dimensions may need responsive reconstruction.
- Confirm all visual assets resolve locally, with no production Langfuse calls.
- Test each implemented navigation/control with the host application's data and keyboard interactions.
- Clearly identify any control or destination still unimplemented.
- Do not equate the archive's file checks with interaction or visual QA.

Current archive report: 111 packaged pages and 161 unresolved source destinations. It is an incomplete source archive. The last static verification checked 3,804 references with zero missing local files; links to `uncaptured.html` count as existing files, not completed destination captures.

## Capture tooling provenance

`C:\opencrawl\package-langfuse.mjs` builds the local snapshots from `raw/` and the manifest, downloads known assets, rewrites links, and removes executable script tags. `C:\opencrawl\verify-langfuse-archive.mjs` checks document endings and local HTML resource references. Neither is required for ordinary preview. The original browser capture was performed through the authorized browser's Playwright interface; the archive is not a complete reproducible capture pipeline.
