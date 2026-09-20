/**
 * Small, side-effect-free helpers for measuring repeated agent context.
 *
 * This intentionally does not change the stored payload. It lets ingestion
 * record whether a trace contains the message-array shape that benefits most
 * from trace-local content addressing before we migrate Tinybird storage.
 */

export type TracePayloadStats = {
  inputBytes: number;
  outputBytes: number;
  messageCount: number;
  uniqueMessageCount: number;
  repeatedMessageBytes: number;
};

function byteLength(value: string) {
  return new TextEncoder().encode(value).byteLength;
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  return `{${Object.keys(value as Record<string, unknown>).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson((value as Record<string, unknown>)[key])}`).join(",")}}`;
}

function messageStats(value: string) {
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return { messageCount: 0, uniqueMessageCount: 0, repeatedMessageBytes: 0 };

    const seen = new Set<string>();
    let repeatedMessageBytes = 0;
    for (const message of parsed) {
      if (!message || typeof message !== "object") continue;
      const key = canonicalJson(message);
      if (seen.has(key)) repeatedMessageBytes += byteLength(JSON.stringify(message));
      seen.add(key);
    }
    return { messageCount: parsed.length, uniqueMessageCount: seen.size, repeatedMessageBytes };
  } catch {
    return { messageCount: 0, uniqueMessageCount: 0, repeatedMessageBytes: 0 };
  }
}

export function measureTracePayload(input: string, output: string): TracePayloadStats {
  const inputStats = messageStats(input);
  const outputStats = messageStats(output);
  return {
    inputBytes: byteLength(input),
    outputBytes: byteLength(output),
    messageCount: inputStats.messageCount + outputStats.messageCount,
    uniqueMessageCount: inputStats.uniqueMessageCount + outputStats.uniqueMessageCount,
    repeatedMessageBytes: inputStats.repeatedMessageBytes + outputStats.repeatedMessageBytes,
  };
}
