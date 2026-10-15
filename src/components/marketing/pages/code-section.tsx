"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Reveal } from "@/components/marketing/landing/reveal";

export type Snippet = { title: string; lede: string; ts: string; py: string };

const imp = {
  ts: "npm install tracify-sdk",
  py: "pip install tracify-sdk",
};

export function CodeSection({ snippet }: { snippet: Snippet }) {
  const [lang, setLang] = useState<"ts" | "py">("ts");
  const [copied, setCopied] = useState(false);
  const code = snippet[lang];
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard can be blocked; the code stays selectable */
    }
  };
  return (
    <section className="bg-[#eceae3] px-5 py-24 text-[#090909] md:px-8 md:py-32">
      <div className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <Reveal>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-black/50">Instrument it</p>
          <h2 className="mt-4 font-pixel text-[clamp(2.2rem,4.6vw,4.4rem)] leading-[0.9] tracking-[-0.06em]">{snippet.title}</h2>
          <p className="mt-6 max-w-md text-base leading-7 text-black/62">{snippet.lede}</p>
          <p className="mt-8 inline-block border border-black px-3 py-2 font-mono text-[11px] tracking-[0.04em]">$ {imp[lang]}</p>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="bg-[#090909] text-[#eceae3]">
            <div className="flex items-center justify-between border-b border-white/15 px-4 py-3">
              <div className="flex gap-1" role="tablist" aria-label="Language">
                {(["ts", "py"] as const).map((l) => (
                  <button
                    key={l}
                    role="tab"
                    aria-selected={lang === l}
                    onClick={() => setLang(l)}
                    className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors ${lang === l ? "bg-[#f4d44d] text-[#090909]" : "text-white/55 hover:text-white"}`}
                  >
                    {l === "ts" ? "TypeScript" : "Python"}
                  </button>
                ))}
              </div>
              <button onClick={copy} className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-white/60 transition-colors hover:text-[#f4d44d]" aria-label="Copy code">
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <pre className="overflow-x-auto p-5 font-mono text-[12px] leading-6 md:p-7 md:text-[13px] md:leading-7">
              <code>{code}</code>
            </pre>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export const snippets: Record<string, Snippet> = {
  "trace-viewer": {
    title: "Wrap the agent once. Get the whole run.",
    lede: "Every span you open inside traceAgent is linked to the step it ran in, so loops, retries and handoffs show up as a tree you can read.",
    ts: `import { traceAgent, span } from "tracify-sdk";

export const answer = traceAgent(async (question: string) => {
  const plan = await span("plan", () => callModel(question), { type: "llm", input: question });
  const docs = await span("search", () => search(plan.query), { type: "tool" });
  return span("answer", () => callModel(question, docs), { type: "llm" });
}, { environment: "production", release: "2.14" });`,
    py: `import tracify

@tracify.trace_agent(environment="production", release="2.14")
def answer(question):
    with tracify.span("plan", type="llm", input=question):
        plan = call_model(question)
    with tracify.span("search", type="tool"):
        docs = search(plan.query)
    with tracify.span("answer", type="llm"):
        return call_model(question, docs)`,
  },
  "cost-dashboard": {
    title: "Put a price on every call.",
    lede: "Record cost where the call happens. Spend then rolls up by day, run, model and tool, with retries counted on their own.",
    ts: `import { traceAgent, llmCall } from "tracify-sdk";

export const answer = traceAgent(async (question: string) => {
  const reply = await callModel(question);
  await llmCall({
    input: question,
    output: reply.text,
    modelId: "gpt-4o",
    costUsd: 0.002,
    latencyMs: 800,
  });
  return reply.text;
}, { environment: "production", release: "2.14" });`,
    py: `from tracify import trace_agent, llm_call

@trace_agent(environment="production", release="2.14")
def answer(question):
    reply = call_model(question)
    llm_call(
        input_data=question,
        output_data=reply.text,
        model_id="gpt-4o",
        cost_usd=0.002,
        latency_ms=800,
    )
    return reply.text`,
  },
  "tool-calls": {
    title: "Mark a function as a tool. Done.",
    lede: "observe records the arguments, the result, the timing and any error, and keeps the call attached to the step that chose it.",
    ts: `import { observe, traceAgent } from "tracify-sdk";

const searchDocs = observe(async function searchDocs(query: string) {
  return search(query);
}, { type: "tool" });

export const answer = traceAgent(async (question: string) => {
  const hits = await searchDocs(question);
  return summarize(hits);
});`,
    py: `import tracify

@tracify.observe(type="tool")
def search_docs(query):
    return search(query)

@tracify.trace_agent()
def answer(question):
    hits = search_docs(question)
    return summarize(hits)`,
  },
  "llm-calls": {
    title: "Tag the model. Keep the tokens.",
    lede: "Set the model and token counts on the span and they roll up into the run total, next to latency and cost.",
    ts: `import { span, traceAgent } from "tracify-sdk";

export const answer = traceAgent(async (question: string) => {
  return span("chat", async (step) => {
    const reply = await callModel(question);
    step.set({ model: "claude-sonnet-5-5", inputTokens: reply.usage.input, outputTokens: reply.usage.output });
    return reply.text;
  }, { type: "llm", input: question });
});`,
    py: `import tracify

@tracify.trace_agent()
def answer(question):
    with tracify.span("chat", type="llm", input=question) as step:
        reply = call_model(question)
        step.set_output(reply.text)
        step.set(model="claude-sonnet-5-5", input_tokens=reply.usage.input, output_tokens=reply.usage.output)
    return reply.text`,
  },
  failures: {
    title: "Errors are captured for you.",
    lede: "Throw inside a span and Tracify records the error type and message on that step, inside the full run, so the first crack is easy to find.",
    ts: `import { span, traceAgent } from "tracify-sdk";

export const answer = traceAgent(async (question: string) => {
  const docs = await span("search", async () => {
    const hits = await search(question);
    if (hits.length === 0) throw new Error("empty result");
    return hits;
  }, { type: "tool" });
  return summarize(docs);
}, { environment: "production", release: "2.14" });`,
    py: `import tracify

@tracify.trace_agent(environment="production", release="2.14")
def answer(question):
    with tracify.span("search", type="tool"):
        hits = search(question)
        if not hits:
            raise ValueError("empty result")
    return summarize(hits)`,
  },
  research: {
    title: "Make every source a step.",
    lede: "Record retrievals as their own spans and the trace shows which sources each claim rests on, and which it does not.",
    ts: `import { span, traceAgent } from "tracify-sdk";

export const research = traceAgent(async (question: string) => {
  const sources = await span("retrieve", () => searchWeb(question), { type: "retrieval", input: question });
  return span("synthesize", () => writeAnswer(question, sources), { type: "llm" });
}, { environment: "production" });`,
    py: `import tracify

@tracify.trace_agent(environment="production")
def research(question):
    with tracify.span("retrieve", type="retrieval", input=question):
        sources = search_web(question)
    with tracify.span("synthesize", type="llm"):
        return write_answer(question, sources)`,
  },
  support: {
    title: "Tie every trace to a conversation.",
    lede: "Add a session and an end user and every ticket's runs line up in one place, so an escalation has its whole history.",
    ts: `import { traceAgent } from "tracify-sdk";

export const handleTicket = traceAgent(async (ticket: Ticket) => {
  const account = await loadAccount(ticket.customerId);
  return resolve(ticket, account);
}, { environment: "production", release: "2.14", sessionId: "ticket-1842", endUserId: "cus_204", tags: ["support"] });`,
    py: `import tracify

@tracify.trace_agent(environment="production", release="2.14", session_id="ticket-1842", end_user_id="cus_204", tags=["support"])
def handle_ticket(ticket):
    account = load_account(ticket.customer_id)
    return resolve(ticket, account)`,
  },
  automation: {
    title: "Trace the chain, not just the end.",
    lede: "Wrap each step of the workflow and retries show up as their own spans, so a duplicated side effect is visible instead of silent.",
    ts: `import { observe, traceAgent } from "tracify-sdk";

const chargeCard = observe(async function chargeCard(order: Order) {
  return billing.charge(order.id, { idempotencyKey: order.id });
}, { type: "tool" });

export const runOrder = traceAgent(async (order: Order) => {
  await chargeCard(order);
  return fulfil(order);
}, { environment: "production" });`,
    py: `import tracify

@tracify.observe(type="tool")
def charge_card(order):
    return billing.charge(order.id, idempotency_key=order.id)

@tracify.trace_agent(environment="production")
def run_order(order):
    charge_card(order)
    return fulfil(order)`,
  },
  "tool-calling": {
    title: "See the arguments the model chose.",
    lede: "Wrap each tool and the exact payload, the result and every retry are recorded, so loops and rejected schemas stand out.",
    ts: `import { observe, traceAgent } from "tracify-sdk";

const issueRefund = observe(async function issueRefund(args: { amount: number; currency: string }) {
  return payments.refund(args);
}, { type: "tool" });

export const agent = traceAgent(async (request: string) => {
  const call = await pickTool(request);
  return issueRefund(call.args);
});`,
    py: `import tracify

@tracify.observe(type="tool")
def issue_refund(amount, currency):
    return payments.refund(amount, currency)

@tracify.trace_agent()
def agent(request):
    call = pick_tool(request)
    return issue_refund(**call.args)`,
  },
};
