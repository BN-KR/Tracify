import { describe, expect, it } from "vitest";
import { getAuthCallbackAction } from "./auth-callback-state";

describe("auth callback state", () => {
  it("waits for Convex when Better Auth already has a session", () => {
    expect(getAuthCallbackAction({
      sessionPending: false,
      hasSession: true,
      convexStatus: "unauthenticated",
    })).toBe("wait");
  });

  it("continues only after both session layers are ready", () => {
    expect(getAuthCallbackAction({
      sessionPending: false,
      hasSession: true,
      convexStatus: "authenticated",
    })).toBe("continue");
  });

  it("returns to sign-in when Better Auth has no session", () => {
    expect(getAuthCallbackAction({
      sessionPending: false,
      hasSession: false,
      convexStatus: "unauthenticated",
    })).toBe("sign-in");
  });
});
