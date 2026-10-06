import fs from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";

function archiveRouteRedirects() {
  const indexPath = path.join(
    process.cwd(),
    "public",
    "output",
    "langfuse-capture",
    "index.html",
  );

  if (!fs.existsSync(indexPath)) return [];

  const html = fs.readFileSync(indexPath, "utf8");
  const redirects = new Map<string, string>();
  const links = /<a href="([^"]+)">([\s\S]*?)<\/a>/g;

  for (const match of html.matchAll(links)) {
    const file = match[1];
    const label = match[2].replace(/<[^>]+>/g, "");
    const route = label.match(/—\s(\/[^\s<]*)/u)?.[1];
    if (!route || route === "/" || !file.startsWith("pages/")) continue;
    redirects.set(route.split("?")[0], `/output/langfuse-capture/${file}`);
  }

  return [...redirects.entries()].map(([source, destination]) => ({
    source,
    destination,
    permanent: false,
  }));
}

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async redirects() {
    // Interactive sandbox routes. Query strings on the source are forwarded by Next.
    const sandbox = (source: string, destination: string) => ({ source, destination, permanent: false });
    const project = "/project/:projectId";

    return [
      sandbox(project, "/playground"),
      sandbox(`${project}/dashboards`, "/playground/dashboards"),
      sandbox(`${project}/dashboards/new`, "/playground/dashboards/new"),
      sandbox(`${project}/dashboards/:dashboardId`, "/playground/dashboards/:dashboardId"),
      sandbox(`${project}/widgets`, "/playground/dashboards"),
      sandbox(`${project}/traces/setup`, "/playground/tracing"),
      sandbox(`${project}/traces`, "/playground/tracing"),
      sandbox(`${project}/traces/:traceId`, "/playground/tracing/:traceId"),
      sandbox(`${project}/sessions`, "/playground/sessions"),
      sandbox(`${project}/sessions/:sessionId`, "/playground/sessions/:sessionId"),
      sandbox(`${project}/users`, "/playground/users"),
      sandbox(`${project}/users/:userId`, "/playground/users/:userId"),
      sandbox(`${project}/alerts`, "/playground/alerts"),
      sandbox(`${project}/alerts/new`, "/playground/alerts?view=create"),
      sandbox(`${project}/prompts`, "/playground/prompts"),
      sandbox(`${project}/prompts/new`, "/playground/prompts?view=create"),
      sandbox(`${project}/playground`, "/playground/playground"),
      sandbox(`${project}/scores`, "/playground/scores"),
      sandbox(`${project}/scores/analytics`, "/playground/scores"),
      sandbox(`${project}/evals`, "/playground/evaluators"),
      sandbox(`${project}/evals/rules`, "/playground/evaluators"),
      sandbox(`${project}/annotation-queues`, "/playground/annotation-queues"),
      sandbox(`${project}/datasets`, "/playground/datasets"),
      sandbox(`${project}/experiments`, "/playground/experiments"),
      sandbox(`${project}/settings`, "/playground/settings"),
      sandbox(`${project}/settings/api-keys`, "/playground/settings?tab=API%20Keys"),
      sandbox(`${project}/settings/llm-connections`, "/playground/settings?tab=LLM%20Connections"),
      sandbox(`${project}/automations`, "/playground/settings"),
      // Non-project archive routes (e.g. /organization/...) still resolve to the archive.
      ...archiveRouteRedirects().filter((redirect) => !redirect.source.startsWith("/project/")),
    ];
  },
};

export default nextConfig;
