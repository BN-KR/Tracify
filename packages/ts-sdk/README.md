# 5to1r

Observability and tracing for AI agents. Gain full visibility into your agent's decision-making process, tool usage, and LLM costs.

## Installation

```bash
npm install 5to1r
# or
yarn add 5to1r
```

## Quickstart

1. Get your API Key from the [5to1r Dashboard](https://5to1r.com).
2. Set it as an environment variable:

```bash
export FIVETOONE_API_KEY=your_sk_live_...
```

3. Instrument your agent:

```typescript
import { traceAgent, llmCall, toolCall } from '5to1r';

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
});
```

## Features

- **traceAgent Wrapper:** Automatically captures run lifecycle and errors.
- **Granular Spans:** Manually record LLMs, tools, and custom decisions.
- **Environment Aware:** Automatically picks up API keys from `process.env`.
- **Lightweight:** Minimal dependencies, optimized for Node.js and Edge runtimes.

## License

MIT
