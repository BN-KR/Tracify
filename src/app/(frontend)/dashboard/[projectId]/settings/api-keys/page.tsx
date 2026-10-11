import Link from "next/link";

type ApiKeysPageProps = { params: Promise<{ projectId: string }> };

export default async function ApiKeysPage({ params }: ApiKeysPageProps) {
  const { projectId } = await params;
  return (
    <main className="mx-auto w-full max-w-5xl p-6 text-white">
      <div className="mb-8 flex items-end justify-between gap-4 border-b border-white/15 pb-6">
        <div><Link href={`/dashboard/${projectId}/settings`} className="font-mono text-xs uppercase tracking-wider text-white/45 hover:text-white">← Settings</Link><h1 className="mt-4 text-3xl font-semibold">API keys</h1><p className="mt-2 text-sm text-white/60">Keys authenticate SDK ingestion for this project. Secrets are shown once and never stored in plaintext.</p></div>
        <form action={`/api/projects/${projectId}/api-keys`} method="post"><button type="submit" className="border border-white/30 bg-white px-4 py-2 font-mono text-xs uppercase tracking-wider text-black hover:bg-white/85">Create key</button></form>
      </div>
      <section className="border border-white/15 bg-white/[0.03]" aria-label="Project API keys">
        <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-white/10 px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-white/45"><span>Key</span><span>Created</span><span>Action</span></div>
        <div className="px-5 py-12 text-center"><p className="text-sm text-white/65">No active keys for this project.</p><p className="mt-2 text-xs text-white/40">Create a key to connect an SDK, then copy the secret before leaving this page.</p></div>
      </section>
      <aside className="mt-5 border-l-2 border-white/50 px-4 py-3 text-xs leading-5 text-white/55">Rotate compromised keys immediately. Existing spans remain visible, while new ingestion requests must use an active key.</aside>
    </main>
  );
}
