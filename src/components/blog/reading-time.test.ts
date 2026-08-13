import assert from "node:assert/strict";
import test from "node:test";

import { getReadingTime } from "./reading-time.ts";

test("calculates reading time from a Markdoc plain-text body", () => {
  assert.equal(
    getReadingTime(Array.from({ length: 200 }, () => "word").join(" ")),
    1,
  );
  assert.equal(
    getReadingTime(Array.from({ length: 201 }, () => "word").join(" ")),
    2,
  );
});
