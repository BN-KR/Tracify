import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Checkout enables managed payments under the required preview API version", async () => {
  const checkoutRoute = await readFile(new URL("../src/app/api/stripe/checkout/route.ts", import.meta.url), "utf8");

  assert.match(checkoutRoute, /managed_payments:\s*\{\s*enabled:\s*true\s*\}/);
  assert.match(checkoutRoute, /apiVersion:\s*"2026-02-25\.preview"/);
});

test("the catalog script creates the blueprint product with its tax code and monthly price", async () => {
  const catalogScript = await readFile(new URL("./create-managed-payments-product.mjs", import.meta.url), "utf8");

  assert.match(catalogScript, /name:\s*"Basic subscription"/);
  assert.match(catalogScript, /description:\s*"A basic subscription to our service"/);
  assert.match(catalogScript, /tax_code:\s*"txcd_10103100"/);
  assert.match(catalogScript, /unit_amount:\s*1000/);
  assert.match(catalogScript, /interval:\s*"month"/);
});
