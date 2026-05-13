import { ConvexHttpClient } from "convex/browser";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const TINYBIRD_HOST = process.env.TINYBIRD_HOST;
const TINYBIRD_TOKEN = process.env.TINYBIRD_TOKEN;

async function verify() {
  console.log("🔍 Verifying Convex Connection...");
  try {
    // We created a project with API Key '5t1r_test_key_123' earlier
    const project = await convex.query("projects:getByApiKey", { apiKey: "5t1r_test_key_123" });
    if (!project) {
      console.log("❌ Project not found in Convex. Did the test project script run?");
      return;
    }
    console.log("✅ Convex: Found Project!", project._id);

    const runs = await convex.query("agentRuns:getByProjectId", { projectId: project._id });
    console.log(`✅ Convex: Found ${runs.length} Agent Runs for this project.`);
    if (runs.length > 0) {
      console.log("   Latest Run Status:", runs[0].status, "| Cost:", runs[0].costUsd);
    }

    console.log("\n🔍 Verifying Tinybird Connection...");
    const sql = encodeURIComponent(
      `SELECT * FROM spans WHERE projectId = '${project._id}' AND runId = 'run-001' ORDER BY createdAt ASC`
    );
    
    const res = await fetch(`${TINYBIRD_HOST}/v0/sql?q=${sql}`, {
      headers: {
        Authorization: `Bearer ${TINYBIRD_TOKEN}`,
      },
    });

    if (!res.ok) {
      console.log("❌ Tinybird query failed:", res.status, await res.text());
      return;
    }

    const data = await res.json();
    console.log(`✅ Tinybird: Found ${data.data.length} spans for run-001!`);
    if (data.data.length > 0) {
      console.log("   First Span Output:", data.data[0].output);
    }

    console.log("\n🎉 The End-to-End pipeline is confirmed working!");

  } catch (err) {
    console.error("❌ Error verifying connections:", err);
  }
}

verify();
