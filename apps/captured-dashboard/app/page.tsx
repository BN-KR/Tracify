import { redirect } from "next/navigation";
import { normalizePlaygroundSegment, playgroundPath } from "../features/dashboard-workspace/route-map";

// Entry route for the standalone Sandbox. It accepts a `surface` intent that
// is validated against the shared route map (aliases included) so external
// launch links land on the requested Glass Grid surface. Unknown intents
// always fall back to Home; only canonical /playground destinations are ever
// produced, so the entry point cannot be steered to an arbitrary path.
export default async function CapturedDashboardEntry({ searchParams }: { searchParams: Promise<{ surface?: string | string[] }> }) {
  const { surface } = await searchParams;
  const requested = Array.isArray(surface) ? surface[0] : surface;
  const token = (requested ?? "").trim().toLowerCase();
  if (token) {
    const resolved = normalizePlaygroundSegment(token.split("/")[0]);
    if (resolved) redirect(playgroundPath("/playground", resolved));
  }
  redirect("/playground");
}
