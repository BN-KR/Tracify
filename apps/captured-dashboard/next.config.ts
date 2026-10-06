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
    const snapshot = (page: string) => `/output/langfuse-capture/pages/${page}.html`;

    return [
      { source: "/project/:projectId", destination: snapshot("023"), permanent: false },
      { source: "/project/:projectId/dashboards", destination: snapshot("024"), permanent: false },
      { source: "/project/:projectId/dashboards/new", destination: snapshot("038"), permanent: false },
      { source: "/project/:projectId/dashboards/:dashboardId", destination: snapshot("040"), permanent: false },
      { source: "/project/:projectId/traces/setup", destination: snapshot("015"), permanent: false },
      { source: "/project/:projectId/traces", destination: snapshot("025"), permanent: false },
      { source: "/project/:projectId/sessions", destination: snapshot("026"), permanent: false },
      { source: "/project/:projectId/sessions/:sessionId", destination: snapshot("065"), permanent: false },
      { source: "/project/:projectId/users", destination: snapshot("027"), permanent: false },
      { source: "/project/:projectId/users/:userId", destination: snapshot("066"), permanent: false },
      { source: "/project/:projectId/alerts", destination: snapshot("028"), permanent: false },
      { source: "/project/:projectId/prompts", destination: snapshot("029"), permanent: false },
      { source: "/project/:projectId/playground", destination: snapshot("030"), permanent: false },
      { source: "/project/:projectId/scores", destination: snapshot("031"), permanent: false },
      { source: "/project/:projectId/evals", destination: snapshot("032"), permanent: false },
      { source: "/project/:projectId/annotation-queues", destination: snapshot("033"), permanent: false },
      { source: "/project/:projectId/datasets", destination: snapshot("034"), permanent: false },
      { source: "/project/:projectId/experiments", destination: snapshot("035"), permanent: false },
      { source: "/project/:projectId/settings", destination: snapshot("036"), permanent: false },
      { source: "/project/:projectId/settings/api-keys", destination: snapshot("044"), permanent: false },
      { source: "/project/:projectId/settings/llm-connections", destination: snapshot("051"), permanent: false },
      { source: "/project/:projectId/automations", destination: snapshot("045"), permanent: false },
      { source: "/project/:projectId/alerts/new", destination: snapshot("048"), permanent: false },
      ...archiveRouteRedirects(),
    ];
  },
};

export default nextConfig;
