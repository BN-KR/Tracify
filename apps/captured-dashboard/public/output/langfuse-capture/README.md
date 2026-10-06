# Captured Langfuse dashboard

Open `index.html` through the OpenCrawl server to browse the saved pages:

`http://localhost:4173/output/langfuse-capture/index.html`

This folder contains rendered HTML snapshots captured from an authorized Langfuse browser session, plus local CSS, images, fonts, SVGs, and archived script files. The `pages/` files are frozen snapshots. API calls, hydration, forms, and interactive mutations are disabled during packaging so the folder does not write back to Langfuse.

Run `node package-langfuse.mjs` from `C:\opencrawl` after adding more captures. Run `node verify-langfuse-archive.mjs` to check local document references.

The package is still being expanded. `STATUS.md`, `capture-manifest.json`, `packaging-report.json`, and `verification-report.json` are the source of truth for capture coverage and unresolved links.
