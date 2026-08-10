import { ImageResponse } from "next/og";

export const alt = "Tracify agent observability: make every agent run a better decision";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", overflow: "hidden", background: "#050505", color: "#ffffff", padding: "56px", fontFamily: "monospace" }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.22, backgroundImage: "linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)", backgroundSize: "72px 72px" }} />
      <div style={{ position: "relative", display: "flex", width: "100%", height: "100%", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ display: "flex", fontSize: 20, letterSpacing: "0.16em", textTransform: "uppercase" }}>tracify</div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "48px" }}>
          <div style={{ display: "flex", maxWidth: "650px", flexDirection: "column", gap: "24px" }}>
            <div style={{ display: "flex", fontSize: 18, color: "#999999", letterSpacing: "0.14em", textTransform: "uppercase" }}>The operational record for AI agents</div>
            <div style={{ display: "flex", fontSize: 68, fontWeight: 800, letterSpacing: "-0.07em", lineHeight: 0.92, textTransform: "uppercase" }}>Make every agent run a better decision.</div>
            <div style={{ display: "flex", fontSize: 18, color: "#aaaaaa" }}>Connect the trace, quality signal, and release decision.</div>
          </div>
          <div style={{ display: "flex", width: "350px", flexDirection: "column", border: "1px solid #555", background: "#0b0b0b" }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #333", padding: "14px 16px", color: "#aaaaaa", fontSize: 13, letterSpacing: "0.1em" }}><span>RUN HEALTH</span><span>v2.4.0</span></div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "16px", fontSize: 15 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>quality score</span><span>0.94</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#aaaaaa" }}><span>p95 latency</span><span>2.8s</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #333", paddingTop: "12px" }}><span style={{ color: "#ffffff" }}>RELEASE CHECK PASSED</span><span>→</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    size,
  );
}
