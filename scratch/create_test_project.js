import { ConvexHttpClient } from "convex/browser";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

async function run() {
  try {
    const id = await convex.mutation("projects:create", {
      name: "Test Project",
      clerkOrgId: "org_test",
      apiKey: "5t1r_test_key_123"
    });
    console.log("Created project with ID:", id);
  } catch (err) {
    console.error("Error creating project:", err);
  }
}

run();
