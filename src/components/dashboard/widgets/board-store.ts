"use client";

import { useCallback, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { moveWidget } from "@/lib/widget-utils";

export type Scores = FunctionReturnType<typeof api.evaluation.scoreMetrics> | undefined;
export type Board = { id: string; name: string; isDefault: boolean; updatedAt: number; widgets: Array<{ id: string; widgetType: string; position: number }> };

/** What the dashboards page needs from wherever boards are kept: Convex for a real project, local state for the demo. */
export type BoardStore = {
  boards: Board[] | undefined;
  scores: Scores;
  create: (name: string, isDefault: boolean) => Promise<string>;
  addWidget: (boardId: string, widgetType: string) => Promise<void>;
  removeWidget: (boardId: string, widgetId: string) => Promise<void>;
  reorder: (boardId: string, widgetIds: string[]) => Promise<void>;
  rename: (boardId: string, name: string) => Promise<void>;
  removeBoard: (boardId: string) => Promise<void>;
  reset: (boardId: string) => Promise<void>;
};

export function useConvexBoards(projectId: string): BoardStore {
  const typed = projectId as Id<"projects">;
  const dashboards = useQuery(api.dashboards.list, { projectId: typed });
  const scores = useQuery(api.evaluation.scoreMetrics, { projectId: typed });
  const create = useMutation(api.dashboards.create);
  const addWidget = useMutation(api.dashboards.addWidget);
  const removeWidget = useMutation(api.dashboards.removeWidget);
  const reorder = useMutation(api.dashboards.reorderWidgets);
  const rename = useMutation(api.dashboards.rename);
  const remove = useMutation(api.dashboards.remove);
  const reset = useMutation(api.dashboards.reset);
  return {
    boards: dashboards?.map((dashboard) => ({
      id: dashboard._id, name: dashboard.name, isDefault: dashboard.isDefault, updatedAt: dashboard.updatedAt,
      widgets: dashboard.widgets.map((widget) => ({ id: widget._id, widgetType: widget.widgetType, position: widget.position })),
    })),
    scores,
    create: (name, isDefault) => create({ projectId: typed, name, isDefault }),
    addWidget: async (boardId, widgetType) => { await addWidget({ projectId: typed, dashboardId: boardId as Id<"dashboardConfigs">, widgetType }); },
    removeWidget: async (boardId, widgetId) => { await removeWidget({ projectId: typed, dashboardId: boardId as Id<"dashboardConfigs">, widgetId: widgetId as Id<"dashboardWidgets"> }); },
    reorder: async (boardId, widgetIds) => { await reorder({ projectId: typed, dashboardId: boardId as Id<"dashboardConfigs">, widgetIds: widgetIds as Id<"dashboardWidgets">[] }); },
    rename: async (boardId, name) => { await rename({ projectId: typed, dashboardId: boardId as Id<"dashboardConfigs">, name }); },
    removeBoard: async (boardId) => { await remove({ projectId: typed, dashboardId: boardId as Id<"dashboardConfigs"> }); },
    reset: async (boardId) => { await reset({ projectId: typed, dashboardId: boardId as Id<"dashboardConfigs"> }); },
  };
}

const widgets = (types: string[]) => types.map((widgetType, position) => ({ id: `w-${widgetType}`, widgetType, position }));
const SEED: Board[] = [
  { id: "board-overview", name: "Overview", isDefault: true, updatedAt: 0, widgets: widgets(["trace_volume", "error_rate", "cost_by_model", "latency", "cost_daily", "top_users"]) },
  { id: "board-cost", name: "Cost watch", isDefault: false, updatedAt: 0, widgets: widgets(["cost_daily", "cost_by_model", "cost_by_tool", "top_users"]) },
];

/** The public demo: boards live in the page, so visitors can try editing without an account and nothing is saved. */
export function useDemoBoards(): BoardStore {
  const [boards, setBoards] = useState<Board[]>(SEED);
  const patch = useCallback((boardId: string, change: (board: Board) => Board) => setBoards((current) => current.map((board) => (board.id === boardId ? { ...change(board), updatedAt: Date.now() } : board))), []);
  return {
    boards, scores: [],
    create: async (name, isDefault) => { const id = `board-${Date.now()}`; setBoards((current) => [...current, { id, name, isDefault, updatedAt: Date.now(), widgets: [] }]); return id; },
    addWidget: async (boardId, widgetType) => patch(boardId, (board) => ({ ...board, widgets: [...board.widgets, { id: `w-${widgetType}-${Date.now()}`, widgetType, position: board.widgets.length }] })),
    removeWidget: async (boardId, widgetId) => patch(boardId, (board) => ({ ...board, widgets: board.widgets.filter((widget) => widget.id !== widgetId).map((widget, position) => ({ ...widget, position })) })),
    reorder: async (boardId, ids) => patch(boardId, (board) => ({ ...board, widgets: ids.map((id, position) => ({ ...board.widgets.find((widget) => widget.id === id)!, position })) })),
    rename: async (boardId, name) => patch(boardId, (board) => ({ ...board, name })),
    removeBoard: async (boardId) => setBoards((current) => current.filter((board) => board.id !== boardId)),
    reset: async (boardId) => patch(boardId, (board) => ({ ...board, widgets: [] })),
  };
}

export { moveWidget };
