export default async function RunReceivedPlaceholderPage(
  props: PageProps<"/dashboard/[projectId]/runs/[runId]">,
) {
  const { runId } = await props.params;

  return (
    <div className="max-w-3xl border border-[#2A2A2A] bg-[#111111] p-6 font-mono">
      <div className="mb-2 text-[11px] uppercase tracking-wide text-[#666666]">
        run.received
      </div>
      <h1 className="text-2xl text-white">Run received.</h1>
      <dl className="mt-6 grid gap-4 border-t border-[#2A2A2A] pt-5 text-sm">
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-[#666666]">
            run_id
          </dt>
          <dd className="mt-1 break-all text-[#CCCCCC]">{runId}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-[#666666]">
            status
          </dt>
          <dd className="mt-1 text-[#10B981]">received</dd>
        </div>
      </dl>
      <p className="mt-6 border-t border-[#2A2A2A] pt-5 font-sans text-sm leading-6 text-[#999999]">
        The trace viewer is the next milestone.
      </p>
    </div>
  );
}
