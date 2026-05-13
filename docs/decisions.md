# Decisions

## 2026-05-10
**Decision:**
Use Tinybird for telemetry and Convex for application metadata.

**Reason:**
Convex is optimized for reactive UI state, but not for high-throughput time-series data. Telemetry spans generate massive volume. Tinybird (Clickhouse) excels at this. 

**Impact:**
Requires an Inngest background pipeline to handle the split write: spans go to Tinybird, roll-up metrics (span counts, costs) go to Convex for live UI updates.

## 2026-05-10
**Decision:**
Use Clerk for Auth and Organizations.

**Reason:**
Provides out-of-the-box organization support which is required for a multi-tenant B2B observability platform.

**Impact:**
Middleware protects dashboard routes, but we must manually authenticate SDK ingest requests via API keys stored in Convex.

## 2026-05-11
**Decision:**
Use the Tinybird CLI (`.datasource` and `.pipe` files) rather than the Tinybird TypeScript SDK for schema definitions.

**Reason:**
The TS SDK tightly couples our schema to a Node.js runtime. By using the standard `.datasource` text files, our Tinybird configuration remains language-agnostic. This is critical because our data model must be easily referenced by both the Python and TypeScript instrumentation SDKs without requiring Node dependencies.

**Impact:**
We maintain a `tinybird/` directory with raw Clickhouse definitions. Because we are using a **Tinybird Forward** workspace, we must use the Go-based CLI and run `tb --cloud deploy` rather than `tb push` to deploy schemas to the workspace.

## 2026-05-11
**Decision:**
Define explicit `JSONPaths` in `spans.datasource`.

**Reason:**
When ingesting NDJSON payloads into the Tinybird Events API (`/v0/events`) within a Tinybird Forward workspace, Tinybird requires explicit mapping of JSON keys to Data Source columns (e.g., `` `spanId` String `json:$.spanId` ``). It does not automatically infer them in Forward mode.

**Impact:**
All new columns added to Tinybird datasources must include a `json:$.key` mapping to prevent 400 Ingestion Errors.
