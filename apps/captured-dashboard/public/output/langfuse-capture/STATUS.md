# Langfuse source archive — capture in progress

Latest verified batch: 117 raw captures, 111 packaged distinct pages. Static verification checks 3,800 local references; all resolve and every packaged HTML has a closing document tag. This does not prove visual completeness or interactive behavior. Remaining source destinations: 160. See verification-report.json and packaging-report.json.

Latest batch: 75 raw captures, packaged as 69 distinct final URLs, including 38 additional nested dashboard/settings/record pages. Packaging reports 154 unresolved destinations after new links were discovered. Remaining work is still active; this is not a complete export.

These are actual rendered Langfuse pages captured through the logged-in Chrome session using the browser Playwright interface. They are not the hand-written mock at /langfuse.

- raw/ contains captured HTML for both supplied projects and the organization home.
- assets/ contains original downloaded CSS and images.
- capture-manifest.json records source URLs, page files, discovered links, script URLs, and asset exports.
- Later captures supersede earlier entries for duplicate URLs.

Packaging has started: index.html links to 32 unique rendered page snapshots in pages/. Captured navigation links are rewritten locally, original scripts are archived, and production hydration is disabled so it cannot replace the saved DOM or call live APIs. An initial browser check confirmed the original empty-project Tracing page renders locally with its real styling.

Incomplete: 132 discovered destinations still need capture or classification; nested pages, remaining asset dependencies, direct-file navigation, and whole-archive offline verification remain outstanding. Consult packaging-report.json. The archive is not complete.
