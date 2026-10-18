"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { repairJson } from "@/lib/tools/json-fixer";
import { Badge, buttonClass, Caption, CopyButton, ghostClass, TextArea } from "./ui";
import { sampleBrokenJson } from "./samples";

export function JsonFixer() {
  const [text, setText] = useState("");
  const [minify, setMinify] = useState(false);
  const deferred = useDeferredValue(text);
  const result = useMemo(() => (deferred.trim() ? repairJson(deferred.slice(0, 2_000_000)) : null), [deferred]);
  const output = result?.ok ? (minify ? result.minified : result.text) : "";

  function download() {
    const url = URL.createObjectURL(new Blob([output], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "fixed.json";
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <TextArea label="Broken JSON or model output" value={text} onChange={setText} rows={18} mono placeholder={"Paste anything that is meant to be JSON, even with chatty text around it."} hint="Nothing is uploaded. It is fixed in your browser." />
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className={buttonClass} onClick={() => setText(sampleBrokenJson)}>Try a broken example</button>
            <button type="button" className={ghostClass} onClick={() => setText("")} disabled={!text}>Clear</button>
          </div>
        </div>
        <div className="space-y-4">
          <TextArea label="Valid JSON" value={output} onChange={() => {}} rows={18} mono placeholder="The fixed JSON appears here." />
          <div className="flex flex-wrap items-center gap-3">
            <CopyButton text={output} label="Copy JSON" disabled={!output} />
            <button type="button" className={buttonClass} onClick={download} disabled={!output}>Download</button>
            <label className="ml-auto flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.1em]">
              <input type="checkbox" checked={minify} onChange={(e) => setMinify(e.target.checked)} className="size-4 accent-black" />
              Minify
            </label>
          </div>
        </div>
      </div>

      <div aria-live="polite">
        {!result ? (
          <p className="border border-dashed border-black/40 p-6 text-sm leading-6 text-black/65">Paste broken JSON, or try the example. You will see the fixed version and a list of exactly what was changed.</p>
        ) : !result.ok ? (
          <div role="alert" className="border border-black bg-white p-6">
            <p className="font-medium">This could not be fixed.</p>
            <p className="mt-2 text-sm leading-6 text-black/70">{result.error}</p>
          </div>
        ) : (
          <div className="border border-black bg-white p-5 md:p-6">
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone="ok">{result.alreadyValid ? "Already valid" : "Fixed"}</Badge>
              <p className="font-medium">{result.alreadyValid ? "This was already valid JSON. It has only been formatted." : `${result.fixes.reduce((a, f) => a + f.count, 0)} change${result.fixes.reduce((a, f) => a + f.count, 0) === 1 ? "" : "s"} made`}</p>
            </div>
            {result.fixes.length > 0 ? (
              <>
                <div className="mt-5"><Caption>What was changed</Caption></div>
                <ul className="mt-3 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
                  {result.fixes.map((f) => (
                    <li key={f.label} className="flex items-baseline justify-between gap-3 border-b border-black/10 pb-1.5"><span>{f.label}</span><span className="font-mono text-xs text-black/55">×{f.count}</span></li>
                  ))}
                </ul>
                <p className="mt-4 text-xs leading-5 text-black/60">Check the result before you rely on it. Where output was cut off, the data stops where the original stopped: nothing is made up.</p>
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
