import { redirect } from "next/navigation";

/** Comparing needs a project; send people to the project picker. */
export default function Page() {
  redirect("/dashboard");
}
