import { expect, test } from "@playwright/test";

test("public product surfaces load", async ({ request }) => {
  for (const route of ["/", "/pricing", "/docs", "/integrations"]) {
    const response = await request.get(route);
    expect(response.ok(), `${route} should return a successful response`).toBeTruthy();
    expect((await response.text()).trim(), `${route} should return a body`).not.toBe("");
  }
});

test("sign-in route redirects safely when auth is unavailable", async ({ request }) => {
  const response = await request.get("/sign-in", { maxRedirects: 0 });
  expect([200, 301, 302, 307, 308]).toContain(response.status());
});
