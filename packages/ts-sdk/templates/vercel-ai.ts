import { generateText, wrapLanguageModel } from "ai";
import { openai } from "@ai-sdk/openai";
import { tracifyMiddleware } from "tracify-sdk";

// One line: wrap the model once, and every call made with it is traced.
const model = wrapLanguageModel({ model: openai("gpt-4o-mini"), middleware: tracifyMiddleware() });

async function main() {
  const { text } = await generateText({ model, prompt: "Give me a one-line joke about logs." });
  console.log(text);
}
main();
