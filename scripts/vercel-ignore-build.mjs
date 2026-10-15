// Vercel "ignoreCommand": exit 0 = skip the build, exit 1 = build.
// Only the EU dashboard project (tracify-cloud-eu) is limited, to save the shared
// daily build allowance. It builds main and branches starting with "preview/".
// Every other Vercel project (marketing previews) builds everything as before.
import { pathToFileURL } from "node:url";

export const EU_PROJECT_ID = "prj_Delx3TQzcym3ccHm2JIW0mMRpepY";

export function shouldBuild(env) {
  const isEu =
    env.VERCEL_PROJECT_ID === EU_PROJECT_ID ||
    env.TRACIFY_BUILD_ONLY_MAIN_AND_PREVIEW === "1";
  if (!isEu) return true;
  const branch = env.VERCEL_GIT_COMMIT_REF ?? "";
  return branch === "main" || branch.startsWith("preview/");
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const build = shouldBuild(process.env);
  console.log(build ? "Building." : "Skipping: EU project only builds main and preview/ branches.");
  process.exit(build ? 1 : 0);
}
