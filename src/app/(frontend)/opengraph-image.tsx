import { ImageResponse } from "next/og";

export const alt = "Every run leaves a trail. AI agent tracing and observability by Tracify.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#000",
          color: "#fff",
          padding: "52px 60px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #555", paddingBottom: 18, fontSize: 16, letterSpacing: 3, color: "#bbb" }}>
          <span>TRACIFY</span>
          <span>AI AGENT OBSERVABILITY</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 55 }}>
          <div style={{ width: 580, display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 18, letterSpacing: 2, color: "#aaa" }}>TRACE THE RUN. FIND THE DECISION.</span>
            <span style={{ marginTop: 22, fontSize: 78, fontWeight: 700, lineHeight: 0.98, letterSpacing: -5 }}>Every run leaves a trail.</span>
            <span style={{ marginTop: 26, fontSize: 23, lineHeight: 1.4, color: "#ccc" }}>Inspect the model, tool, and retrieval decisions behind an agent response.</span>
          </div>
          <div style={{ width: 430, display: "flex", flexDirection: "column", border: "1px solid #555", padding: 22, fontFamily: "monospace" }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #444", paddingBottom: 14, fontSize: 14, letterSpacing: 1, color: "#aaa" }}><span>SAMPLE TRACE</span><span>RUN_018</span></div>
            {[
              ["14:08:31", "MODEL", "response drafted"],
              ["14:08:31", "TOOL", "orders.lookup"],
              ["14:08:32", "RETRIEVAL", "0 sources returned"],
              ["14:08:32", "EVALUATION", "0.42 · review"],
            ].map(([time, kind, detail], index) => (
              <div key={kind} style={{ display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #333", padding: "19px 0", fontSize: 11, color: index === 2 ? "#fff" : "#999" }}>
                <span style={{ width: 66, color: "#777" }}>{time}</span>
                <span style={{ width: 90, letterSpacing: 1 }}>{kind}</span>
                <span>{detail}</span>
              </div>
            ))}
            <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid #444", fontSize: 13, color: "#ccc" }}>ILLUSTRATIVE DATA · NO CUSTOMER INFORMATION</div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #555", paddingTop: 16, fontSize: 14, letterSpacing: 2, color: "#aaa" }}>
          <span>TRACES · COST · EVALUATION</span>
          <span>TRACIFY.TECH</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
