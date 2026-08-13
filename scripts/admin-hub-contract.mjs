import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const page = await readFile("src/app/(frontend)/admin/page.tsx", "utf8");
const sidebar = await readFile(
  "src/components/dashboard/dashboard-sidebar.tsx",
  "utf8",
);

assert.match(page, /requireLibraryAccess\("\/admin"\)/);
assert.match(page, /href:\s*"\/admin\/library"/);
assert.match(page, /href:\s*"\/cms"/);
assert.match(sidebar, /title: "Admin"[\s\S]*href: "\/admin"/);
assert.doesNotMatch(sidebar, /title: "Content"/);
assert.doesNotMatch(sidebar, /title: "Admin Library"/);
