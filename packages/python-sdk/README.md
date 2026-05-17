# 5to1r Python SDK

Observability and tracing for AI agents. Gain full visibility into your agent's decision-making process, tool usage, and LLM costs.

## Installation

```bash
pip install fivetoone
```

## Quickstart

1. Get your API Key from the [5to1r Dashboard](https://5to1r.com).
2. Set it as an environment variable:

```bash
export FIVETOONE_API_KEY=your_sk_live_...
```

3. Instrument your agent:

```python
from fivetoone import trace_agent, llm_call, tool_call

@trace_agent()
async def my_agent(query: str):
    # LLM Call
    llm_call(
        input_data=query,
        output_data="Thinking...",
        model_id="gpt-4o",
        cost_usd=0.002,
        latency_ms=800
    )
    
    # Tool Use
    tool_call(
        tool_name="web_search",
        input_data={"q": query},
        output_data="Found results...",
        latency_ms=1200
    )
    
    return "Final Answer"
```

## Features

- **@trace_agent Decorator:** Automatically captures run lifecycle and errors.
- **Granular Spans:** Manually record LLMs, tools, and custom decisions.
- **Cost Tracking:** Monitor your infrastructure spend in real-time.
- **Asynchronous & Synchronous Support:** Works with `async/await` or standard functions.

## License

MIT
