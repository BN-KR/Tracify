# Tracify TypeScript SDK

Observability and tracing for AI agents. Gain full visibility into your agent's decision-making process, tool usage, and LLM costs.

## Installation

```bash
npm install tracify-sdk
# or
yarn add tracify-sdk
```

## Quickstart

1. Get your API Key from the [Tracify Dashboard](https://tracify.tech).
2. Set it as an environment variable:

```bash
export TRACIFY_API_KEY=your_sk_live_...
```

3. Instrument your agent:

```typescript
import { traceAgent, llmCall, toolCall } from 'tracify-sdk';

const agent = traceAgent(async (query: string) => {
  // LLM Call
  await llmCall({
    input: query,
    output: "Thinking...",
    modelId: "gpt-4o",
    costUsd: 0.002,
    latencyMs: 800
  });
  
  // Tool Use
  await toolCall({
    toolName: "web_search",
    input: { q: query },
    output: "Found results...",
    latencyMs: 1200
  });
  
  return "Final Answer";
}, { environment: "development", release: "quickstart" });
```

## Steps

Inside a `traceAgent` function, every step you record is linked to the step it ran in, so the trace graph
shows which step called which and how loops repeat. Use `span` for a block and `observe` for a function:

```ts
import { observe, span, traceAgent } from "tracify-sdk";

const searchDocs = observe(async function searchDocs(query: string) {
  return search(query);
}, { type: "tool" });

export const answer = traceAgent(async (question: string) => {
  for (let turn = 0; turn < 5; turn++) {
    const reply = await span("think", () =>
      span("chat", async (step) => {
        const reply = await callModel(question);
        step.set({ model: "claude-sonnet-5-5", inputTokens: reply.usage.input, outputTokens: reply.usage.output });
        return reply;
      }, { type: "llm", input: question }),
    { type: "agent" });
    if (reply.done) return reply.text;
    await searchDocs(reply.query);
  }
});
```

`type` is one of `agent`, `llm`, `tool`, `retrieval` or `span`. Errors are recorded with their type and
message. Concurrent runs stay in separate traces (Node's AsyncLocalStorage). Inputs and outputs have obvious
secrets (bearer tokens, API keys, JWTs, `password=` values) removed and are capped at 10,000 characters;
avoid sending anything else you would not want stored.

## Features

- **traceAgent Wrapper:** Automatically captures run lifecycle and errors.
- **Granular Spans:** Manually record LLMs, tools, and custom decisions.
- **Environment Aware:** Automatically picks up API keys from `process.env`.
- **Lightweight:** Minimal dependencies, optimized for Node.js and Edge runtimes.
- **Session context:** Add `sessionId`, `endUserId`, `environment`, `release`, and `tags` to connect related traces.

## Feedback and evaluation scores

Pass `projectId` when constructing the client to attach end-user feedback and typed scores to traces:

```typescript
const client = new TracifyClient({ apiKey: process.env.TRACIFY_API_KEY, projectId: "your-project-id" });
client.feedback(runId, true, { kind: "thumb", comment: "Helpful answer" });
client.score(runId, "answer_quality", 0.92, { dataType: "numeric" });
```

These helpers use the project API key, deduplicate when given a `dedupeKey`, and never throw into the agent process.

## Prompt deployment

Resolve a deployed prompt without shipping a new application build:

```typescript
const deployed = await client.getPrompt("support-agent", "production");
await client.ingest({ spanType: "llm", input: question, output, promptVersionId: deployed.version.id });
```

Prompt responses are cached for 60 seconds by default. Pass `{ cacheTtlMs: 0, fallback }` for development or guaranteed-availability behavior.

## License

MIT
