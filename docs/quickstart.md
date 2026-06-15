# tracify Quickstart Guide

Get your first agent trace live in less than 5 minutes.

## 1. Create a Project
Head to [tracify.tech/dashboard](https://tracify.tech/dashboard) and create your first project. Copy your **API Key** from the onboarding flow or the API Keys settings page.

## 2. Set Your Environment Variable
Ensure your agent can authenticate with our pipeline by setting the following environment variable:

```bash
export TRACIFY_API_KEY=5t1r_sk_live_...
```

## 3. Choose Your SDK

### Python
Install the package:
```bash
pip install tracify
```

Instrument your agent:
```python
from tracify import trace_agent, llm_call

@trace_agent()
async def my_agent():
    # Capture an LLM call
    llm_call(
        input_data="What is 5to1r?",
        output_data="The best observability for agents.",
        model_id="gpt-4",
        cost_usd=0.001
    )
    return "Done"
```

### TypeScript / Node.js
Install the package:
```bash
npm install tracify
```

Instrument your agent:
```typescript
import { traceAgent, llmCall } from 'tracify';

const agent = traceAgent(async () => {
  await llmCall({
    input: "What is 5to1r?",
    output: "The best observability for agents.",
    modelId: "gpt-4",
    costUsd: 0.001
  });
  return "Done";
});
```

## 4. View Your Traces
Run your agent once, then return to your [Tracify Runs Dashboard](https://tracify.tech/dashboard/runs). You should see your first run appear with its status, cost, and the full trace of spans you recorded.

## 5. Next Steps
- **Set Thresholds:** Go to Settings to configure cost and duration alerts.
- **Invite Your Team:** Connect your Clerk organization to share project access.
- **Deep Tracing:** Use `tool_call` and `decision` spans to capture the full reasoning chain.
