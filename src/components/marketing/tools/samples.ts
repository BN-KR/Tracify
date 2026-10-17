/** Example inputs for the free tools. They are invented, so nobody's data is shown. */

export const sampleTrace = JSON.stringify(
  [
    { name: "plan_task", type: "llm", model: "gpt-4o", start_time: "2026-10-17T10:00:00.000Z", duration_ms: 1100, usage: { prompt_tokens: 1450, completion_tokens: 180 } },
    { name: "search_orders", type: "tool", start_time: "2026-10-17T10:00:01.100Z", duration_ms: 380, input: { customer: "c_4821", status: "open" } },
    { name: "answer_draft", type: "llm", model: "gpt-4o", start_time: "2026-10-17T10:00:01.500Z", duration_ms: 1600, usage: { prompt_tokens: 2900, completion_tokens: 240 } },
    { name: "lookup_refund_policy", type: "tool", start_time: "2026-10-17T10:00:03.100Z", duration_ms: 9400, input: { region: "EU" } },
    { name: "answer_draft", type: "llm", model: "gpt-4o", start_time: "2026-10-17T10:00:12.500Z", duration_ms: 1900, usage: { prompt_tokens: 6100, completion_tokens: 260 } },
    { name: "send_email", type: "tool", start_time: "2026-10-17T10:00:14.400Z", duration_ms: 700, input: { to: "customer", template: "refund" }, status: "error", error: "429 Too Many Requests: rate limit reached for the email API" },
    { name: "send_email", type: "tool", start_time: "2026-10-17T10:00:15.200Z", duration_ms: 650, input: { to: "customer", template: "refund" }, status: "error", error: "429 Too Many Requests: rate limit reached for the email API" },
    { name: "send_email", type: "tool", start_time: "2026-10-17T10:00:16.000Z", duration_ms: 640, input: { to: "customer", template: "refund" }, status: "error", error: "429 Too Many Requests: rate limit reached for the email API" },
  ],
  null,
  2,
);

export const sampleLog = `2026-10-17 10:00:00,120 INFO  Agent run started run_id=r_8842
2026-10-17 10:00:00,980 INFO  model gpt-4o prompt_tokens=1450 completion_tokens=180
2026-10-17 10:00:01,100 INFO  calling tool: search_orders customer=c_4821
2026-10-17 10:00:01,490 INFO  model gpt-4o prompt_tokens=2900 completion_tokens=240
2026-10-17 10:00:03,100 INFO  calling tool: lookup_refund_policy region=EU
2026-10-17 10:00:12,500 WARN  tool lookup_refund_policy was slow
2026-10-17 10:00:12,520 INFO  model gpt-4o prompt_tokens=6100 completion_tokens=260
2026-10-17 10:00:14,400 ERROR Traceback (most recent call last):
  File "agent/tools.py", line 88, in send_email
    raise RateLimitError("429 Too Many Requests")
RateLimitError: 429 Too Many Requests: rate limit reached
2026-10-17 10:00:14,900 INFO  Run finished status=failed`;

export const sampleBrokenJson = `Sure! Here is the data you asked for:

\`\`\`json
{
  'customer': "Ada Lovelace",
  orders: [
    {id: 1, total: 19.99, paid: True,},
    {id: 2, total: 5, paid: False}   // refunded later
  ],
  "note": "She said "thanks" twice",
  "address": null,
\`\`\`

Let me know if you need anything else!`;

export const sampleTools = JSON.stringify(
  [
    {
      type: "function",
      function: {
        name: "get_weather",
        description: "Get weather",
        parameters: { type: "object", properties: { city: { type: "string" }, unit: { type: "string" }, days: { type: "number" } }, required: ["city", "country"] },
      },
    },
    {
      type: "function",
      function: {
        name: "search",
        description: "Searches the product catalogue and returns up to 10 matching items with price and stock. Use when the customer asks what is available.",
        parameters: { type: "object", properties: { query: { type: "string", description: "What the customer is looking for, in plain words" }, filters: { type: "array" } }, required: ["query"] },
      },
    },
  ],
  null,
  2,
);

export const samplePrompt = `You are a helpful assistant.

It is important that you answer the customer in order to resolve their problem due to the fact that they are waiting.



Please note that you should always be very polite and really helpful.
Always cite the policy document when you talk about refunds.
Always cite the policy document when you talk about refunds.

Today is 2026-10-17. The customer's session id: 88231.

Here is the output format, as JSON:
\`\`\`json
{
  "answer": "string",
  "sources": [
    "string"
  ],
  "needs_human": false
}
\`\`\`
`;
