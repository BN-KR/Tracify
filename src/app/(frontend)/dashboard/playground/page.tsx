import { redirect } from "next/navigation";

import { DEMO_BASE_PATH } from "@/lib/demo/demo-config";

/** The projectless Playground was an old copy; the demo project now hosts the current one. */
export default function Page() {
  redirect(`${DEMO_BASE_PATH}/playground`);
}
