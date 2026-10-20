import assert from "node:assert/strict";
import test from "node:test";
import { completeWithFallback } from "./llm-chain.ts";

const prompt = { system: "s", user: "u", maxOutputTokens: 50 };
const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status });
function stub(handler: (url: string) => Response) {
  const original = globalThis.fetch;
  globalThis.fetch = (async (input: unknown) => handler(String(input))) as typeof fetch;
  return () => { globalThis.fetch = original; };
}

test("falls back to Gemini when OpenAI is out of credit", async () => {
  const restore = stub((url) => url.includes("openai") ? json(429, { error: { message: "You exceeded your current quota" } }) : json(200, { candidates: [{ content: { parts: [{ text: "hello" }] } }] }));
  const quiet = console.error; console.error = () => {};
  try {
    const result = await completeWithFallback("t", { openai: "k", gemini: "g" }, {}, prompt);
    assert.deepEqual([result.text, result.provider, result.failures], ["hello", "gemini", ["quota"]]);
  } finally { restore(); console.error = quiet; }
});

test("reports both failures when neither answers", async () => {
  const restore = stub((url) => url.includes("openai") ? json(429, { error: { message: "Rate limit reached" } }) : json(403, { error: { message: "denied" } }));
  const quiet = console.error; console.error = () => {};
  try {
    const result = await completeWithFallback("t", { openai: "k", gemini: "g" }, {}, prompt);
    assert.deepEqual([result.text, result.provider, result.failures], ["", null, ["rate", "auth"]]);
  } finally { restore(); console.error = quiet; }
});

test("empty OpenAI answer still tries Gemini", async () => {
  const restore = stub((url) => url.includes("openai") ? json(200, { choices: [{ message: { content: "" } }] }) : json(200, { candidates: [{ content: { parts: [{ text: "ok" }] } }] }));
  try {
    assert.equal((await completeWithFallback("t", { openai: "k", gemini: "g" }, {}, prompt)).text, "ok");
  } finally { restore(); }
});
