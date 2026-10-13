import type { ElkNode } from "elkjs/lib/elk-api.js";
import type { XYPosition } from "@xyflow/react";

let elkPromise: Promise<InstanceType<(typeof import("elkjs/lib/elk.bundled.js"))["default"]>> | null = null;

export async function layoutWithElk(
  id: string,
  nodes: Array<{ id: string; width: number; height: number }>,
  edges: Array<{ id: string; source: string; target: string }>,
  previous: Map<string, XYPosition>,
) {
  const graph: ElkNode = {
    id,
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": "RIGHT",
      "elk.edgeRouting": "ORTHOGONAL",
      "elk.layered.spacing.nodeNodeBetweenLayers": "76",
      "elk.spacing.nodeNode": "24",
      "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
      "elk.layered.cycleBreaking.strategy": "GREEDY",
    },
    children: nodes.map((node) => ({ id: node.id, width: node.width, height: node.height })),
    edges: edges.map((edge) => ({ id: edge.id, sources: [edge.source], targets: [edge.target] })),
  };
  elkPromise ??= import("elkjs/lib/elk.bundled.js").then(({ default: ELK }) => new ELK());
  const result = await (await elkPromise).layout(graph);
  const positions = new Map<string, XYPosition>();
  for (const node of result.children ?? []) {
    const old = previous.get(node.id);
    positions.set(node.id, old ?? { x: node.x ?? 0, y: node.y ?? 0 });
  }
  return positions;
}
