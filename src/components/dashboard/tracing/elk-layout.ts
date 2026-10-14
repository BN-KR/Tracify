import type { ElkNode } from "elkjs/lib/elk-api.js";
import type { XYPosition } from "@xyflow/react";

let elkPromise: Promise<InstanceType<(typeof import("elkjs/lib/elk.bundled.js"))["default"]>> | null = null;

export async function layoutWithElk(
  id: string,
  nodes: Array<{ id: string; width: number; height: number }>,
  edges: Array<{ id: string; source: string; target: string }>,
  previous: Map<string, XYPosition>,
  direction: "RIGHT" | "DOWN" = "RIGHT",
) {
  const graph: ElkNode = {
    id,
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": direction,
      "elk.edgeRouting": "ORTHOGONAL",
      "elk.layered.spacing.nodeNodeBetweenLayers": "76",
      "elk.spacing.nodeNode": "24",
      "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
      "elk.layered.cycleBreaking.strategy": "GREEDY",
      // Top-down flows keep the order steps first ran in, so loops point back up instead of reshuffling the cards.
      ...(direction === "DOWN" ? {
        "elk.layered.cycleBreaking.strategy": "DEPTH_FIRST",
        "elk.layered.considerModelOrder.strategy": "NODES_AND_EDGES",
        "elk.layered.crossingMinimization.forceNodeModelOrder": "true",
      } : {}),
    },
    children: nodes.map((node) => ({ id: node.id, width: node.width, height: node.height })),
    edges: edges.map((edge) => ({ id: edge.id, sources: [edge.source], targets: [edge.target] })),
  };
  elkPromise ??= import("elkjs/lib/elk.bundled.js").then(({ default: ELK }) => new ELK());
  const result = await (await elkPromise).layout(graph);
  const positions = new Map<string, XYPosition>();
  const dimensions = new Map(nodes.map((node) => [node.id, node]));
  const occupied = nodes.flatMap((node) => {
    const old = previous.get(node.id);
    return old ? [{ ...old, width: node.width, height: node.height }] : [];
  });
  for (const node of result.children ?? []) {
    const old = previous.get(node.id);
    const size = dimensions.get(node.id)!;
    const position = old ? { ...old } : { x: node.x ?? 0, y: node.y ?? 0 };
    if (!old) {
      while (occupied.some((item) => position.x < item.x + item.width + 12 && position.x + size.width + 12 > item.x && position.y < item.y + item.height + 12 && position.y + size.height + 12 > item.y)) {
        position.y += size.height + 24;
      }
      occupied.push({ ...position, width: size.width, height: size.height });
    }
    positions.set(node.id, position);
  }
  return positions;
}
