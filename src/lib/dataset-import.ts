export type ImportItem = { input: string; expectedOutput?: string };
export type ImportResult = { items: ImportItem[]; problems: Array<{ line: number; message: string }>; truncated: boolean };

export const MAX_IMPORT_ROWS = 500;
const MAX_TEXT = 20_000;
const INPUT_KEYS = ["input", "question", "prompt", "query"];
const EXPECTED_KEYS = ["expectedOutput", "expected_output", "expected", "output", "answer"];

const text = (value: unknown): string | undefined => {
  if (value === undefined || value === null) return undefined;
  return typeof value === "string" ? value : JSON.stringify(value);
};
const pick = (record: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) if (record[key] !== undefined && record[key] !== null) return text(record[key]);
  return undefined;
};

function fromValue(value: unknown): ImportItem | string {
  if (typeof value === "string") return value.trim() ? { input: value.trim() } : "The row is empty";
  if (!value || typeof value !== "object" || Array.isArray(value)) return "Each row must be a text or an object with an input";
  const record = value as Record<string, unknown>;
  const input = pick(record, INPUT_KEYS)?.trim();
  if (!input) return `The row has no input (use one of ${INPUT_KEYS.join(", ")})`;
  const expected = pick(record, EXPECTED_KEYS)?.trim();
  return { input, ...(expected ? { expectedOutput: expected } : {}) };
}

/**
 * Turns pasted text into dataset rows. Accepts a JSON array, JSON lines, tab-separated "input, expected" lines
 * (what a spreadsheet copy gives), or plain lines where each line is an input.
 */
export function parseDatasetImport(raw: string): ImportResult {
  const trimmed = raw.trim();
  const items: ImportItem[] = [];
  const problems: ImportResult["problems"] = [];
  let truncated = false;
  const add = (candidate: ImportItem | string, line: number) => {
    if (typeof candidate === "string") { problems.push({ line, message: candidate }); return; }
    if (candidate.input.length > MAX_TEXT || (candidate.expectedOutput?.length ?? 0) > MAX_TEXT) { problems.push({ line, message: "A column is longer than 20,000 characters" }); return; }
    if (items.length >= MAX_IMPORT_ROWS) { truncated = true; return; }
    items.push(candidate);
  };
  if (!trimmed) return { items, problems, truncated };
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (!Array.isArray(parsed)) throw new Error("not an array");
      parsed.forEach((value, index) => add(fromValue(value), index + 1));
      return { items, problems, truncated };
    } catch {
      problems.push({ line: 1, message: "That looks like a JSON list but it could not be read" });
      return { items, problems, truncated };
    }
  }
  trimmed.split(/\r?\n/).forEach((line, index) => {
    if (!line.trim()) return;
    if (line.trimStart().startsWith("{")) {
      try { add(fromValue(JSON.parse(line)), index + 1); } catch { problems.push({ line: index + 1, message: "That line is not valid JSON" }); }
      return;
    }
    const [input, ...rest] = line.split("\t");
    add(fromValue(rest.length ? { input, expected: rest.join("\t") } : input), index + 1);
  });
  return { items, problems, truncated };
}

/** Lowercases and collapses whitespace so "Thursday. " and "thursday." count as the same answer. */
export function sameAnswer(output: string, expected: string) {
  const clean = (value: string) => value.trim().replace(/\s+/g, " ").toLowerCase();
  return clean(output) === clean(expected);
}
