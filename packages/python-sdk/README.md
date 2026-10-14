# Tracify Python SDK

Observability and tracing for AI agents. Gain full visibility into your agent's decision-making process, tool usage, and LLM costs.

## Installation

```bash
pip install tracify-sdk
```

## Quickstart

1. Get your API Key from the [Tracify Dashboard](https://tracify.tech).
2. Set it as an environment variable:

```bash
export TRACIFY_API_KEY=your_sk_live_...
```

3. Instrument your agent:

```python
from tracify import trace_agent, llm_call, tool_call

@trace_agent(environment="development", release="quickstart")
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

## Steps

Inside a `@trace_agent` function, every step you record is linked to the step it ran in, so the trace graph
shows which step called which and how loops repeat. Use `span` for a block and `observe` for a function:

```python
import tracify

@tracify.observe(type="tool")
def search_docs(query):
    return search(query)

@tracify.trace_agent()
def answer(question):
    for turn in range(5):
        with tracify.span("think", type="agent"):
            with tracify.span("chat", type="llm", input=question) as step:
                reply = call_model(question)
                step.set_output(reply.text)
                step.set(model="claude-sonnet-5-5", input_tokens=reply.usage.input, output_tokens=reply.usage.output)
            if reply.done:
                return reply.text
            search_docs(reply.query)
```

`type` is one of `agent`, `llm`, `tool`, `retrieval` or `span`. Errors are recorded with their type and
message. Concurrent runs (threads or asyncio tasks) stay in separate traces. Inputs and outputs have obvious
secrets (bearer tokens, API keys, JWTs, `password=` values) removed and are capped at 10,000 characters;
avoid sending anything else you would not want stored.

## Features

- **@trace_agent Decorator:** Automatically captures run lifecycle and errors.
- **Granular Spans:** Manually record LLMs, tools, and custom decisions.
- **Cost Tracking:** Monitor your infrastructure spend in real-time.
- **Asynchronous & Synchronous Support:** Works with `async/await` or standard functions.
- **Session context:** Attach `session_id`, `end_user_id`, `environment`, `release`, and `tags` to connect related traces.

## Feedback and evaluation scores

Pass `project_id` when constructing the client to attach end-user feedback and typed scores to traces:

```python
client = TracifyClient(project_id="your-project-id")
client.feedback(run_id, True, kind="thumb", comment="Helpful answer")
client.score(run_id, "answer_quality", 0.92, data_type="numeric")
```

Feedback and scores use the same API key as ingestion and do not interrupt the agent when delivery fails.

## Prompt deployment

Resolve a deployed prompt without shipping a new application build:

```python
deployed = client.get_prompt("support-agent", "production")
client.ingest(spanType="llm", input=question, output=answer, promptVersionId=deployed["version"]["id"])
```

Prompt responses are cached for 60 seconds by default. Use `cache_ttl_seconds=0` or provide a `fallback` for development and guaranteed-availability behavior.

## License

MIT
