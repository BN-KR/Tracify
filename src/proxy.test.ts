import { afterEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

import { proxy } from "./proxy";

const originalDeploymentKind = process.env.NEXT_PUBLIC_TRACIFY_DEPLOYMENT_KIND;

afterEach(() => {
  if (originalDeploymentKind === undefined) {
    delete process.env.NEXT_PUBLIC_TRACIFY_DEPLOYMENT_KIND;
  } else {
    process.env.NEXT_PUBLIC_TRACIFY_DEPLOYMENT_KIND = originalDeploymentKind;
  }
});

describe("deployment host routing", () => {
  it("keeps the post-region mode selector on the regional cloud host", () => {
    process.env.NEXT_PUBLIC_TRACIFY_DEPLOYMENT_KIND = "cloud";
    const response = proxy(new NextRequest("https://eu.cloud.tracify.tech/cloud/mode?intent=build"));

    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("keeps the region directory on the marketing host", () => {
    process.env.NEXT_PUBLIC_TRACIFY_DEPLOYMENT_KIND = "cloud";
    const response = proxy(new NextRequest("https://eu.cloud.tracify.tech/cloud"));

    expect(response.headers.get("location")).toBe("https://www.tracify.tech/cloud");
  });

  it("sends direct production mode requests back through region selection", () => {
    process.env.NEXT_PUBLIC_TRACIFY_DEPLOYMENT_KIND = "marketing";
    const response = proxy(new NextRequest("https://www.tracify.tech/cloud/mode?intent=build"));

    expect(response.headers.get("location")).toBe("https://www.tracify.tech/cloud?next=%2Fcloud%2Fmode%3Fintent%3Dbuild");
  });

  it("keeps both localhost surfaces available for side-by-side review", () => {
    process.env.NEXT_PUBLIC_TRACIFY_DEPLOYMENT_KIND = "marketing";
    const response = proxy(new NextRequest("http://localhost:3000/cloud/mode"));

    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });
});
