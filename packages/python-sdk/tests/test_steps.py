import asyncio
import threading
import pytest
import tracify
from tracify import TracifyClient


class Recorder(TracifyClient):
    def __init__(self):
        super().__init__(api_key="tracify_sk_live_eu_test")
        self.sent = []

    def _send_span(self, span):
        self.sent.append(span)


@pytest.fixture
def client():
    return Recorder()


def by_name(spans):
    return {span.get("toolName") or span.get("modelId"): span for span in spans}


def test_nested_steps_link_to_their_parent_and_root(client):
    @tracify.trace_agent(client=client, name="answer")
    def answer(question):
        with tracify.span("plan", type="agent", client=client):
            with tracify.span("search", type="tool", input=question, client=client) as step:
                step.set_output(["doc"])
            tracify.llm_call("prompt", "reply", "claude", 0.01, 5, client=client, input_tokens=10, output_tokens=3, name="chat")
        return "done"

    assert answer("why?") == "done"
    spans = by_name(client.sent)
    root = spans["answer"]
    assert root["spanType"] == "run_end" and "parentSpanId" not in root
    assert spans["plan"]["parentSpanId"] == root["spanId"]
    assert spans["search"]["parentSpanId"] == spans["plan"]["spanId"]
    assert spans["chat"]["parentSpanId"] == spans["plan"]["spanId"]
    assert spans["chat"]["inputTokens"] == 10 and spans["chat"]["outputTokens"] == 3
    assert {span["runId"] for span in client.sent} == {root["runId"]}
    assert spans["search"]["output"] == '["doc"]'


def test_failure_marks_step_and_root(client):
    @tracify.trace_agent(client=client)
    def run():
        with tracify.span("lookup", type="tool", client=client):
            raise ValueError("boom")

    with pytest.raises(ValueError):
        run()
    spans = by_name(client.sent)
    assert spans["lookup"]["errorType"] == "ValueError"
    assert spans["run"]["spanType"] == "error" and spans["run"]["errorMessage"] == "boom"


def test_concurrent_runs_stay_apart(client):
    @tracify.trace_agent(client=client)
    def run(tag):
        with tracify.span(f"step-{tag}", client=client):
            threading.Event().wait(0.02)

    threads = [threading.Thread(target=run, args=(i,)) for i in range(4)]
    for thread in threads: thread.start()
    for thread in threads: thread.join()
    roots = {span["spanId"]: span["runId"] for span in client.sent if span["spanType"] == "run_end"}
    for span in client.sent:
        if span["spanType"] != "run_end":
            assert roots[span["parentSpanId"]] == span["runId"]
    assert len(set(roots.values())) == 4


def test_async_observe_nests(client):
    @tracify.observe(type="tool", client=client)
    async def fetch(url):
        return {"url": url}

    @tracify.trace_agent(client=client)
    async def run():
        return await asyncio.gather(fetch("a"), fetch("b"))

    asyncio.run(run())
    root = next(span for span in client.sent if span["spanType"] == "run_end")
    fetches = [span for span in client.sent if span.get("toolName") == "fetch"]
    assert len(fetches) == 2 and all(span["parentSpanId"] == root["spanId"] for span in fetches)


def test_payloads_are_redacted_and_capped(client):
    secret = "sk-ant-" + "a" * 30
    with tracify.span("call", input={"api_key": "hunter2hunter2", "auth": f"Bearer {'x' * 40}", "k": secret}, client=client) as step:
        step.set_output("y" * 20_000)
    sent = client.sent[-1]
    assert "hunter2" not in sent["input"] and secret not in sent["input"] and "x" * 40 not in sent["input"]
    assert len(sent["output"]) < 10_100 and "truncated" in sent["output"]
