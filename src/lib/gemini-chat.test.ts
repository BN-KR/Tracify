import assert from "node:assert/strict";
import test from "node:test";
import { buildGeminiBody, friendlyGeminiError, parseGemini } from "./gemini-chat.ts";

test("body carries system text and caps temperature", () => {
  const body = buildGeminiBody("hi", { system: "be brief", temperature: 5, maxOutputTokens: 50 });
  assert.equal(body.systemInstruction?.parts[0].text, "be brief");
  assert.equal(body.generationConfig.temperature, 2);
  assert.equal(body.contents[0].parts[0].text, "hi");
});
test("parse joins parts and reads usage", () => {
  const out = parseGemini({ candidates: [{ content: { parts: [{ text: "a" }, { text: "b" }] } }], usageMetadata: { promptTokenCount: 3, candidatesTokenCount: 2 } });
  assert.deepEqual([out.text, out.inputTokens, out.outputTokens], ["ab", 3, 2]);
});
test("empty safety stop is flagged, 429 reads plainly", () => {
  assert.equal(parseGemini({ candidates: [{ finishReason: "SAFETY" }] }).blocked, true);
  assert.match(friendlyGeminiError(429), /busy/);
});
