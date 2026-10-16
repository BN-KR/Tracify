"use client";

import { useRouter } from "next/navigation";

import { TracesOverTime } from "@/components/dashboard/tracing/trace-charts";
import { DEMO_BASE_PATH } from "@/lib/demo/demo-config";

type Histogram = React.ComponentProps<typeof TracesOverTime>["histogram"];

/** The Tracing page's traces-over-time chart; clicking a bar opens the traces from that period. */
export function OverviewChart({ histogram, range }: { histogram: Histogram; range: { from: number; to: number } }) {
  const router = useRouter();
  return <TracesOverTime histogram={histogram} range={range} onZoom={(from, to) => router.push(`${DEMO_BASE_PATH}/tracing?from=${from}&to=${to}`)} />;
}
