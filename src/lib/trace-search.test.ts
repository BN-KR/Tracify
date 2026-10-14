import { describe, expect, it } from "vitest";
import { parseCost, parseLatency, parseSearch, replaceToken, splitToken, tokenAt, tokenize } from "./trace-search";

describe("tokenize", () => {
  it("splits on whitespace and keeps quoted runs together", () => {
    expect(tokenize('model:gpt-5 name:"my agent" timeout').map((token) => token.raw)).toEqual(["model:gpt-5", 'name:"my agent"', "timeout"]);
  });
  it("reports positions and handles an unclosed quote", () => {
    const [first, second] = tokenize('a  name:"my ag');
    expect([first!.start, first!.end]).toEqual([0, 1]);
    expect(second!.raw).toBe('name:"my ag');
  });
});

describe("splitToken", () => {
  it("knows fields and aliases, case-insensitively, and unquotes values", () => {
    expect(splitToken('Model:"gpt 5"')).toMatchObject({ field: { key: "modelId" }, value: "gpt 5" });
    expect(splitToken("environment:prod")).toMatchObject({ field: { key: "environment" }, value: "prod" });
  });
  it("ignores unknown fields, urls and bare words", () => {
    expect(splitToken("https://example.com")).toBeNull();
    expect(splitToken("foo:bar")).toBeNull();
    expect(splitToken("timeout")).toBeNull();
  });
});

describe("parseSearch", () => {
  it("turns known tokens into filters and keeps the rest as text", () => {
    const parsed = parseSearch("model:gpt-5 status:error latency:>2s upstream timeout");
    expect(parsed.errors).toEqual([]);
    expect(parsed.text).toBe("upstream timeout");
    expect(parsed.filters.map((filter) => [filter.field.key, filter.value])).toEqual([["modelId", "gpt-5"], ["status", "error"], ["minLatencyMs", 2000]]);
  });
  it("keeps an incomplete token and an unknown field as text", () => {
    expect(parseSearch("name: foo:bar").text).toBe("name: foo:bar");
  });
  it("reports unusable values and applies nothing for them", () => {
    const parsed = parseSearch("latency:fast status:maybe cost:free");
    expect(parsed.filters).toEqual([]);
    expect(parsed.errors).toHaveLength(3);
  });
});

describe("numbers", () => {
  it("reads latency with units", () => {
    expect([">2s", ">=500ms", "1.5s", "250", "2m"].map(parseLatency)).toEqual([2000, 500, 1500, 250, 120000]);
    expect(parseLatency("fast")).toBeNull();
  });
  it("reads cost with or without a dollar sign", () => {
    expect([">0.01", "$0.5", "2"].map(parseCost)).toEqual([0.01, 0.5, 2]);
    expect(parseCost("free")).toBeNull();
  });
});

describe("editing", () => {
  it("finds the token the caret is in or just after", () => {
    expect(tokenAt("model:g status", 7)?.raw).toBe("model:g");
    expect(tokenAt("model:g status", 8)?.raw).toBe("status");
    expect(tokenAt("a ", 2)).toBeNull();
  });
  it("replaces a token and places the caret after the replacement", () => {
    const token = tokenAt("hello mod", 9)!;
    expect(replaceToken("hello mod", token, "model:", 9)).toEqual({ text: "hello model:", caret: 12 });
    expect(replaceToken("model:gpt timeout", tokenAt("model:gpt timeout", 3)!, "", 3)).toEqual({ text: "timeout", caret: 0 });
  });
});
