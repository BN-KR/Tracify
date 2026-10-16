"use client";
import { useEffect, useRef, useState } from "react";
import { savedViewState } from "@/lib/saved-view-state";
type View = {
  _id: string;
  name: string;
  target: "traces" | "steps";
  shared: boolean;
  editable: boolean;
  query: Record<string, string>;
  columns: string[];
};
type Props = {
  projectId: string;
  target: View["target"];
  query: Record<string, string>;
  columns: string[];
  onApply: (query: Record<string, string>, columns: string[]) => void;
};
const button =
  "rounded border border-[#262C35] bg-[#111418] px-2 py-1 text-xs text-[#C9CED6] disabled:opacity-50";
export function SavedViews({
  projectId,
  target,
  query,
  columns,
  onApply,
}: Props) {
  const [open, setOpen] = useState(false),
    [views, setViews] = useState<View[]>([]),
    [loading, setLoading] = useState(false),
    [error, setError] = useState("");
  const [name, setName] = useState(""),
    [shared, setShared] = useState(false),
    [busy, setBusy] = useState(false),
    [active, setActive] = useState<View | null>(null);
  const [editing, setEditing] = useState<"new" | "edit" | false>(false),
    [message, setMessage] = useState("");
  const applied = useRef<string | null>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const url = `/api/projects/${encodeURIComponent(projectId)}/saved-views`,
    id = query.savedView;
  const hasSnapshot = Boolean(query.columns);
  useEffect(() => {
    if ((!open && !id) || (!open && id && applied.current === id)) return;
    const controller = new AbortController();
    // This fetch is initiated only by an explicit menu open or a shared-view URL.
    setLoading(true);
    setError("");
    fetch(`${url}${id ? `?id=${encodeURIComponent(id)}` : ""}`, {
      signal: controller.signal,
    })
      .then(async (r) => {
        if (!r.ok) {
          const body = (await r.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw Error(
            body?.error ?? "Saved views are unavailable. Try again shortly.",
          );
        }
        return r.json() as Promise<View[]>;
      })
      .then((rows) => {
        if (controller.signal.aborted) return;
        setViews(rows);
        if (!id || applied.current === id) return;
        const view = rows.find((v) => v._id === id);
        if (!view) {
          setError("This view is unavailable or private to another member.");
          return;
        }
        applied.current = id;
        setActive(view);
        // A full URL snapshot may contain unsaved edits; reload must preserve them.
        if (hasSnapshot && view.target === target) return;
        if (view.target === target)
          onApply(
            {
              ...view.query,
              savedView: view._id,
              columns: JSON.stringify(view.columns),
            },
            view.columns,
          );
        else
          window.location.assign(
            `/dashboard/${encodeURIComponent(projectId)}/${view.target === "traces" ? "tracing" : "steps"}?${new URLSearchParams({ ...view.query, savedView: view._id, columns: JSON.stringify(view.columns) })}`,
          );
      })
      .catch((e) => {
        if (!controller.signal.aborted) setError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [open, id, url, target, projectId, onApply, hasSnapshot]);
  useEffect(() => {
    if (!open) return;
    dialog.current?.focus();
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setOpen(false);
      }
    };
    window.addEventListener("keydown", escape, true);
    return () => window.removeEventListener("keydown", escape, true);
  }, [open]);
  const dirty =
    active &&
    savedViewState(query, columns) !==
      savedViewState(active.query, active.columns);
  async function save(update: boolean) {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...(update && active ? { id: active._id } : {}),
          name,
          target,
          shared,
          query,
          columns,
        }),
      });
      if (!response.ok) throw Error((await response.json()).error);
      const { id } = await response.json();
      const view: View = {
        _id: id,
        name: name.trim(),
        target,
        shared,
        editable: true,
        query,
        columns,
      };
      setViews((current) => [view, ...current.filter((v) => v._id !== id)]);
      setActive(view);
      applied.current = id;
      onApply(
        { ...query, savedView: id, columns: JSON.stringify(columns) },
        columns,
      );
      setEditing(false);
      setMessage("View saved");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save view");
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    if (!active) return;
    setBusy(true);
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "delete", id: active._id }),
      });
      if (!response.ok) throw Error("Could not delete view");
      setViews((v) => v.filter((row) => row._id !== active._id));
      setActive(null);
      onApply({ ...query, savedView: "" }, columns);
      setEditing(false);
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }
  function apply(view: View) {
    applied.current = view._id;
    setActive(view);
    setOpen(false);
    setEditing(false);
    if (view.target === target)
      onApply(
        {
          ...view.query,
          savedView: view._id,
          columns: JSON.stringify(view.columns),
        },
        view.columns,
      );
    else
      window.location.assign(
        `/dashboard/${encodeURIComponent(projectId)}/${view.target === "traces" ? "tracing" : "steps"}?${new URLSearchParams({ ...view.query, savedView: view._id, columns: JSON.stringify(view.columns) })}`,
      );
  }
  return (
    <div className="relative min-w-0">
      <button
        type="button"
        className={`${button} max-w-[220px] truncate`}
        aria-expanded={open}
        aria-controls="saved-view-menu"
        onClick={() => {
          setOpen(!open);
          setMessage("");
        }}
      >
        {active ? `${active.name}${dirty ? " · Modified" : ""}` : "Saved views"}
      </button>
      {id && error && !open ? <p role="alert" className="mt-1 max-w-[220px] text-xs text-[#FF6B6B]">{error} <button type="button" className="underline" onClick={()=>onApply({...query,savedView:""},columns)}>Clear view</button></p> : null}
      {open ? (
        <div
          id="saved-view-menu"
          role="dialog"
          aria-label="Saved views"
          tabIndex={-1}
          ref={dialog}
          className="absolute right-0 z-40 mt-1 w-[min(320px,calc(100vw-32px))] border border-[#262C35] bg-[#111418] p-3 shadow-xl outline-none"
        >
          <div className="mb-2 flex justify-between">
            <strong className="text-xs">Saved views</strong>
            <button
              type="button"
              aria-label="Close saved views"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </div>
          {loading ? <p role="status">Loading views…</p> : null}
          {error ? (
            <p role="alert" className="text-xs text-[#FF6B6B]">
              {error}
            </p>
          ) : null}
          {message ? (
            <p role="status" className="text-xs">
              {message}
            </p>
          ) : null}
          <ul className="max-h-52 overflow-y-auto">
            {views.map((view) => (
              <li key={view._id}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-2 py-1 text-left text-xs hover:text-white"
                  onClick={() => apply(view)}
                >
                  <span className="truncate">{view.name}</span>
                  <span className="shrink-0 text-[#8B93A1]">
                    {view.shared ? "Team" : "Private"} · {view.target}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {!loading && !error && !views.length ? (
            <p className="text-xs text-[#8B93A1]">
              Save filters, columns and time range for later.
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              className={button}
              type="button"
              onClick={() => {
                setEditing("new");
                setName("");
                setShared(false);
              }}
            >
              Save as new
            </button>
            {active?.editable ? (
              <button
                className={button}
                type="button"
                onClick={() => {
                  setEditing("edit");
                  setName(active.name);
                  setShared(active.shared);
                }}
              >
                Edit current view
              </button>
            ) : null}
            {active?.shared ? (
              <button
                type="button"
                className={button}
                onClick={() => {
                  navigator.clipboard
                    .writeText(
                      `${location.origin}/dashboard/${encodeURIComponent(projectId)}/${active.target === "traces" ? "tracing" : "steps"}?savedView=${encodeURIComponent(active._id)}`,
                    )
                    .then(() => setMessage("Link copied"))
                    .catch(() => setError("Could not copy link"));
                }}
              >
                Copy team link
              </button>
            ) : null}
          </div>
          {editing ? (
            <form
              className="mt-3 space-y-2 border-t border-[#262C35] pt-3"
              onSubmit={(e) => {
                e.preventDefault();
                void save(editing === "edit");
              }}
            >
              <label className="block text-xs">
                View name
                <input
                  required
                  maxLength={80}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded border border-[#262C35] bg-[#0B0D10] px-2 py-1.5"
                />
              </label>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={shared}
                  onChange={(e) => setShared(e.target.checked)}
                />
                Share with project members
              </label>
              <p className="text-[11px] text-[#8B93A1]">
                Relative ranges stay relative. Fixed dates stay fixed.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  className={button}
                  type="submit"
                  disabled={busy || !name.trim()}
                >
                  Save view
                </button>
                {active?.editable ? (
                  <>
                    <button
                      type="button"
                      className={button}
                      disabled={busy || !name.trim()}
                      onClick={() => void save(true)}
                    >
                      Update current
                    </button>
                    <button
                      type="button"
                      className={button}
                      disabled={busy}
                      onClick={() => void remove()}
                    >
                      Delete current
                    </button>
                  </>
                ) : null}
                <button
                  type="button"
                  className={button}
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
