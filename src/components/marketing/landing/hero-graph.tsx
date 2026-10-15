"use client";

import { useReducedMotion } from "framer-motion";

const CYCLE = 8;

const nodes = [
  { id: "agent", x: 280, y: 36, label: "support-agent", kind: "AGENT", at: 0.02 },
  { id: "chat1", x: 280, y: 120, label: "chat", kind: "LLM", at: 0.14 },
  { id: "docs", x: 130, y: 210, label: "docs.search", kind: "TOOL", at: 0.3 },
  { id: "order", x: 430, y: 210, label: "order.lookup", kind: "TOOL", at: 0.36 },
  { id: "chat2", x: 280, y: 300, label: "chat · retry", kind: "LLM", at: 0.54 },
  { id: "refund", x: 280, y: 380, label: "refund.issue", kind: "TOOL", at: 0.7 },
] as const;

const edges = [
  { d: "M280 58 L280 98", start: 0.06 },
  { d: "M280 142 C280 176 130 176 130 188", start: 0.18 },
  { d: "M280 142 C280 176 430 176 430 188", start: 0.2 },
  { d: "M130 232 C130 266 280 266 280 278", start: 0.4 },
  { d: "M430 232 C430 266 280 266 280 278", start: 0.42 },
  { d: "M280 322 L280 358", start: 0.58 },
] as const;

const LEN = 0.1;

function Packet({ d, start }: { d: string; start: number }) {
  const e = start + LEN;
  return (
    <circle r="4" fill="#f4d44d" opacity="0">
      <animateMotion
        dur={`${CYCLE}s`}
        repeatCount="indefinite"
        path={d}
        calcMode="linear"
        keyPoints="0;0;1;1"
        keyTimes={`0;${start};${e};1`}
      />
      <animate
        attributeName="opacity"
        dur={`${CYCLE}s`}
        repeatCount="indefinite"
        values="0;0;1;1;0;0"
        keyTimes={`0;${start};${start + 0.001};${e};${e + 0.001};1`}
      />
    </circle>
  );
}

export function HeroGraph() {
  const reduce = useReducedMotion();
  return (
    <svg
      viewBox="0 0 560 420"
      className="h-auto w-full"
      role="img"
      aria-label="Animated flow graph of an agent run: the agent calls a model, two tools run, the model retries, and a final refund tool call fails."
    >
      <defs>
        <pattern id="hg-dots" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="#ffffff" opacity="0.12" />
        </pattern>
      </defs>
      <rect width="560" height="420" fill="url(#hg-dots)" />
      {edges.map((e) => (
        <path key={e.d} d={e.d} fill="none" stroke="#ffffff" strokeOpacity="0.28" strokeWidth="1.5" />
      ))}
      {nodes.map((n) => {
        const failed = n.id === "refund";
        return (
          <g key={n.id}>
            <rect
              x={n.x - 80}
              y={n.y - 22}
              width="160"
              height="44"
              fill="#141414"
              stroke={failed ? "#f4d44d" : "#ffffff"}
              strokeOpacity={failed ? 1 : 0.3}
              strokeDasharray={failed ? "4 3" : undefined}
            >
              {!reduce && (
                <animate
                  attributeName="stroke"
                  dur={`${CYCLE}s`}
                  repeatCount="indefinite"
                  values="#ffffff;#ffffff;#f4d44d;#f4d44d;#ffffff;#ffffff"
                  keyTimes={`0;${n.at};${n.at + 0.001};${n.at + 0.09};${n.at + 0.1};1`}
                />
              )}
            </rect>
            <text x={n.x - 68} y={n.y - 4} fill="#f4d44d" fontSize="8" letterSpacing="1.2" fontFamily="var(--font-geist-mono), monospace">
              {n.kind}
            </text>
            <text x={n.x - 68} y={n.y + 12} fill="#ffffff" fontSize="12" fontFamily="var(--font-geist-mono), monospace">
              {n.label}
            </text>
            {failed && (
              <g>
                <rect x={n.x + 92} y={n.y - 11} width="76" height="22" fill="#f4d44d" opacity={reduce ? 1 : 0}>
                  {!reduce && (
                    <animate
                      attributeName="opacity"
                      dur={`${CYCLE}s`}
                      repeatCount="indefinite"
                      values="0;0;1;1;0;0"
                      keyTimes={`0;${n.at};${n.at + 0.02};0.95;0.96;1`}
                    />
                  )}
                </rect>
                <text x={n.x + 100} y={n.y + 4} fill="#090909" fontSize="10" fontFamily="var(--font-geist-mono), monospace" opacity={reduce ? 1 : 0}>
                  502 FAILED
                  {!reduce && (
                    <animate
                      attributeName="opacity"
                      dur={`${CYCLE}s`}
                      repeatCount="indefinite"
                      values="0;0;1;1;0;0"
                      keyTimes={`0;${n.at};${n.at + 0.02};0.95;0.96;1`}
                    />
                  )}
                </text>
              </g>
            )}
          </g>
        );
      })}
      {!reduce && edges.map((e) => <Packet key={`p-${e.d}`} d={e.d} start={e.start} />)}
    </svg>
  );
}
