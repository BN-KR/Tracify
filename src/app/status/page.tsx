import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Status | tracify",
  description: "Current operational status for tracify services.",
};

const services = [
  "Dashboard and authentication",
  "Telemetry ingestion",
  "Trace and analytics queries",
  "Notifications and orchestration policies",
];

export default function StatusPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-32">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">
          Platform / Status
        </p>
        <h1 className="mt-5 font-pixel text-4xl md:text-6xl">Service status</h1>
        <p className="mt-6 font-sans text-lg leading-relaxed text-zinc-400">
          Operational status will be published here as automated monitoring and
          incident history are connected. For now, use the support contact for
          incident reports.
        </p>
        <div className="mt-12 divide-y divide-zinc-800 border border-zinc-800 bg-[#0a0a0a]">
          {services.map((service) => (
            <div
              key={service}
              className="flex items-center justify-between gap-6 p-5 font-mono text-sm"
            >
              <span>{service}</span>
              <span className="text-zinc-500">
                Monitoring setup in progress
              </span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
