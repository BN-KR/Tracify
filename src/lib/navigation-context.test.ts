import { describe, expect, it } from "vitest";
import { parseEntryIntent, safeRelativePath, withAuthContext } from "./navigation-context";

describe("navigation context", () => {
  it("accepts internal paths and preserves query and hash", () => {
    expect(safeRelativePath("/checkout?plan=pro#payment")).toBe("/checkout?plan=pro#payment");
  });

  it("rejects external, protocol-relative, and backslash redirects", () => {
    expect(safeRelativePath("https://evil.example", "/sign-in")).toBe("/sign-in");
    expect(safeRelativePath("//evil.example", "/sign-in")).toBe("/sign-in");
    expect(safeRelativePath("/\\evil.example", "/sign-in")).toBe("/sign-in");
  });

  it("parses only supported entry intents", () => {
    expect(parseEntryIntent("explore")).toBe("explore");
    expect(parseEntryIntent("build")).toBe("build");
    expect(parseEntryIntent("admin")).toBeNull();
  });

  it("adds intent without changing the destination path", () => {
    expect(withAuthContext("/playground", "explore")).toBe("/playground?intent=explore");
  });
});
