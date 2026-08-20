# @tracify/playwright

The Tracify Playwright adapter captures browser-agent execution as ordinary Tracify spans. It is an instrumentation source, not a replacement for Playwright's runner or Trace Viewer.

## Install

```bash
npm install @tracify/playwright @playwright/test
```

Set `TRACIFY_API_KEY`, then add the reporter to `playwright.config.ts`:

```ts
import { defineConfig } from "@playwright/test";
import TracifyReporter from "@tracify/playwright";

export default defineConfig({
  reporter: [[TracifyReporter, { environment: "ci", release: process.env.GITHUB_SHA }]],
});
```

The reporter emits test lifecycle and step spans automatically. Browser actions, network requests, console errors, assertions, screenshots, trace artifacts, and CI metadata are represented by the typed `PlaywrightEvent` contract and can be recorded through the reporter instance when a fixture or helper observes them.

Configure `traceArtifactUrl` when CI uploads `trace.zip`; the adapter preserves the artifact link as metadata and does not reimplement Playwright's artifact viewer.

The first release intentionally sends metadata and artifact references, not raw screenshots, request bodies, or test secrets. Use the existing Tracify redaction and retention settings before sending sensitive values.
