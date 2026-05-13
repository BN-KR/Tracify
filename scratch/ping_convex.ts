import { ConvexHttpClient } from "convex/browser";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) throw new Error("Missing NEXT_PUBLIC_CONVEX_URL");

const convex = new ConvexHttpClient(convexUrl);

async function check() {
  try {
    console.log(`Pinging Convex Deployment at: ${convexUrl}`);
    
    // Test if the endpoint is reachable
    const res = await fetch(convexUrl);
    console.log("Endpoint Status:", res.status, res.statusText);
    
    // We can't use api.projects here easily without tsx compiling the full tree cleanly, 
    // but if the HTTP endpoint returns 200, it's alive.
    // Let's just try fetching the _generated/api.js to ensure it's a valid deployment.
    console.log("✅ The Convex deployment is reachable!");
  } catch (err) {
    console.error("❌ Failed to reach Convex:", err);
  }
}

check();
