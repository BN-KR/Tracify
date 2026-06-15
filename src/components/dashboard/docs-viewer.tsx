"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { BookOpen, Terminal, ChevronRight } from "lucide-react";
import { useState } from "react";

const DOCS = {
  quickstart: {
    title: "Quickstart",
    content: `
# Quickstart

Welcome to **Tracify**. This guide will help you integrate our observability SDK into your agentic workflow in less than 2 minutes.

## 1. Install the SDK

Depending on your environment, run one of the following commands:

\`\`\`bash
# Python
pip install tracify

# TypeScript / Node.js
npm install tracify
\`\`\`

## 2. Initialize the Client

Initialize the SDK with your Project API Key. You can find your API key in the [Settings](/dashboard/settings) page.

\`\`\`python
from tracify import TracifyClient

client = TracifyClient(api_key="5t1r_sk_live_...")
\`\`\`

## 3. Instrument your Agent

Wrap your agent's main execution loop with the \`@trace_agent\` decorator.

\`\`\`python
from tracify import trace_agent

@trace_agent(client=client)
def run_agent(task):
    # Your agent logic here
    pass
\`\`\`

## 4. View your Traces

Once your agent runs, traces will appear in the [Runs](/dashboard/runs) list in real-time.
    `,
  },
  sdk_python: {
    title: "Python SDK",
    content: `
# Python SDK Reference

The Tracify Python SDK provides deep instrumentation for LLM-based agents.

## Core Decorators

### \`@trace_agent\`
Traces a full agentic run.
- \`name\`: (Optional) Custom name for the run.
- \`metadata\`: (Optional) Dict of additional data.

### \`@llm_call\`
Traces an individual LLM request.
- \`model\`: The model ID (e.g., "gpt-4").
- \`tags\`: (Optional) List of strings for filtering.

### \`@tool_call\`
Traces a tool or function execution by the agent.
- \`tool_name\`: Name of the tool.

## Advanced Usage

### Manual Span Control
\`\`\`python
with client.span(name="Thinking Process"):
    # manual logic
    pass
\`\`\`
    `,
  },
  sdk_ts: {
    title: "TypeScript SDK",
    content: `
# TypeScript SDK Reference

High-performance observability for Node.js and Browser-based agents.

## Installation
\`\`\`bash
npm install tracify
\`\`\`

## Usage
\`\`\`typescript
import { TracifyClient } from "tracify";

const client = new TracifyClient({
  apiKey: process.env.TRACIFY_API_KEY
});

async function main() {
  await client.trace("My Agent", async (span) => {
    // instrumented code
  });
}
\`\`\`
    `,
  },
};

export function DocsViewer() {
  const [activeTab, setActiveTab] = useState<keyof typeof DOCS>("quickstart");

  return (
    <div className="flex h-full min-h-[600px] border border-[#2A2A2A] bg-[#0A0A0A] font-mono">
      {/* Docs Sidebar */}
      <div className="w-64 border-r border-[#2A2A2A] bg-[#111111]">
        <div className="flex items-center gap-2 border-b border-[#2A2A2A] p-4 text-[12px] font-bold text-white uppercase tracking-widest">
          <BookOpen className="size-4" />
          <span>Documentation</span>
        </div>
        <div className="p-2 space-y-1">
          {Object.entries(DOCS).map(([id, doc]) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={cn(
                "flex w-full items-center justify-between px-3 py-2 text-[12px] transition-colors outline-none",
                activeTab === id
                  ? "bg-[#161616] text-white"
                  : "text-[#666666] hover:bg-[#161616] hover:text-[#999999]"
              )}
            >
              <span>{doc.title}</span>
              <ChevronRight className={cn("size-3", activeTab === id ? "opacity-100" : "opacity-0")} />
            </button>
          ))}
        </div>
      </div>

      {/* Docs Content */}
      <div className="flex-1 overflow-y-auto p-10 scrollbar-hide">
        <div className="max-w-3xl mx-auto prose prose-invert prose-zinc prose-sm">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ className, ...props }) => (
                <h1 className={cn("text-2xl font-bold border-b border-[#2A2A2A] pb-4 mb-8 text-white", className)} {...props} />
              ),
              h2: ({ className, ...props }) => (
                <h2 className={cn("text-lg font-bold text-white mt-10 mb-4", className)} {...props} />
              ),
              code: ({ className, children, ...props }) => {
                const match = /language-(\w+)/.exec(className || "");
                const isInline = !match;
                return isInline ? (
                  <code className="bg-[#161616] px-1 py-0.5 rounded-none text-[#CCCCCC]" {...props}>
                    {children}
                  </code>
                ) : (
                  <div className="relative group my-6">
                    <div className="absolute -left-4 top-0 bottom-0 w-1 bg-white opacity-20" />
                    <pre className="bg-[#111111] p-4 border border-[#2A2A2A] overflow-x-auto rounded-none">
                      <code className={cn("font-mono text-xs text-[#999999]", className)} {...props}>
                        {children}
                      </code>
                    </pre>
                  </div>
                );
              },
              p: ({ className, ...props }) => (
                <p className={cn("text-[#999999] leading-relaxed mb-4", className)} {...props} />
              ),
              ul: ({ className, ...props }) => (
                <ul className={cn("list-square list-inside mb-4 text-[#999999]", className)} {...props} />
              ),
            }}
          >
            {DOCS[activeTab].content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
