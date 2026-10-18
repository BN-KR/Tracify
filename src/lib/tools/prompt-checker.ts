/**
 * Finds safe ways to shorten a prompt and shows what it costs per call.
 * Only changes that cannot alter meaning are applied automatically; riskier
 * ideas are listed as suggestions so a person decides.
 */

import type { Counter } from "./tokens.ts";
import { heuristicTokens } from "./tokens.ts";

export type PromptSuggestion = {
  id: string;
  title: string;
  detail: string;
  /** Tokens this change would save per call, measured, not guessed. Zero for advice that is not measurable. */
  savedTokens: number;
  /** Safe changes are already applied in the shortened prompt. */
  applied: boolean;
};

export type PromptAnalysis = {
  tokens: number;
  shortenedTokens: number;
  shortened: string;
  suggestions: PromptSuggestion[];
  stats: { characters: number; words: number; lines: number };
};

/** Exact phrase swaps that keep the meaning. Longest first so shorter ones do not clip them. */
const PHRASES: Array<[RegExp, string]> = [
  [/\bit is (?:very |extremely )?important (?:to note )?that\b\s*/gi, ""],
  [/\bplease (?:note|be aware|keep in mind|remember) that\b\s*/gi, ""],
  [/\bin order to\b/gi, "to"],
  [/\bdue to the fact that\b/gi, "because"],
  [/\bat this point in time\b/gi, "now"],
  [/\bin the event that\b/gi, "if"],
  [/\bfor the purpose of\b/gi, "for"],
  [/\bwith regard(?:s)? to\b/gi, "about"],
  [/\bin spite of the fact that\b/gi, "although"],
  [/\ba (?:large|great|good) number of\b/gi, "many"],
  [/\bthe majority of\b/gi, "most"],
  [/\bis able to\b/gi, "can"],
  [/\bare able to\b/gi, "can"],
  [/\bprior to\b/gi, "before"],
  [/\bsubsequent to\b/gi, "after"],
  [/\bin the case that\b/gi, "if"],
  [/\bI would like you to\b\s*/gi, ""],
  [/\bI want you to\b\s*/gi, ""],
  [/\bcould you please\b\s*/gi, ""],
];

/** Words that add length without adding instruction. Reported, never removed automatically. */
const FILLER = ["very", "really", "extremely", "basically", "actually", "just", "simply", "kind of", "sort of", "quite", "somewhat", "definitely"];

const MAX_CHARS = 2_000_000;

export function normalizeWhitespace(text: string): string {
  return text
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/(?<=\S)[ \t]{2,}(?=\S)/g, " ");
}

/** Removes the second and later copies of a long line (code blocks are left alone). */
export function dedupeLines(text: string): { text: string; removed: string[] } {
  const seen = new Set<string>();
  const removed: string[] = [];
  let inFence = false;
  const out: string[] = [];
  for (const line of text.split("\n")) {
    if (/^\s*```/.test(line)) inFence = !inFence;
    const key = line.trim().toLowerCase();
    if (!inFence && key.length >= 25 && !/^\s*```/.test(line)) {
      if (seen.has(key)) {
        removed.push(line.trim());
        continue;
      }
      seen.add(key);
    }
    out.push(line);
  }
  return { text: out.join("\n"), removed };
}

function applyPhrases(text: string): { text: string; count: number } {
  let count = 0;
  let out = text;
  for (const [re, to] of PHRASES) {
    out = out.replace(re, (match, offset: number, whole: string) => {
      count++;
      // Keep a capital letter at the start of a sentence.
      if (to === "" ) {
        const after = whole.slice(offset + match.length);
        const atStart = offset === 0 || /[.!?\n]\s*$/.test(whole.slice(0, offset));
        return atStart && after ? "\u0000" : "";
      }
      return /^[A-Z]/.test(match) ? to.charAt(0).toUpperCase() + to.slice(1) : to;
    });
  }
  // Re-capitalise after a removed opener.
  out = out.replace(/\u0000([a-z])/g, (_, c: string) => c.toUpperCase()).replace(/\u0000/g, "");
  return { text: out, count };
}

function prettyJsonBlocks(text: string): { text: string; blocks: number } {
  let blocks = 0;
  const out = text.replace(/```json\s*\n([\s\S]*?)```/gi, (full, body: string) => {
    try {
      const min = JSON.stringify(JSON.parse(body));
      if (min.length < body.trim().length * 0.85) {
        blocks++;
        return "```json\n" + min + "\n```";
      }
    } catch {
      /* leave invalid JSON alone */
    }
    return full;
  });
  return { text: out, blocks };
}

function dynamicHeadMatches(text: string): string[] {
  const head = text.slice(0, Math.max(200, Math.floor(text.length * 0.5)));
  const found: string[] = [];
  const checks: Array<[RegExp, string]> = [
    [/\b\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2})?\b/, "a date or time"],
    [/\b(?:today|current date|current time|now)\s*(?:is|:)/i, "“today is…”"],
    [/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i, "an id"],
    [/\b(?:user(?:name)?|customer|session|request)[ _-]?(?:id|name)\s*[:=]/i, "a user or session value"],
  ];
  for (const [re, label] of checks) if (re.test(head)) found.push(label);
  return found;
}

export function analyzePrompt(prompt: string, count: Counter = heuristicTokens): PromptAnalysis {
  const text = (prompt ?? "").slice(0, MAX_CHARS);
  const tokens = text ? count(text) : 0;
  const stats = { characters: text.length, words: (text.match(/\S+/g) ?? []).length, lines: text ? text.split(/\r?\n/).length : 0 };
  if (!text.trim()) return { tokens, shortenedTokens: tokens, shortened: text, suggestions: [], stats };

  const suggestions: PromptSuggestion[] = [];
  let current = text;
  let currentTokens = tokens;
  const step = (next: string) => {
    const t = count(next);
    const saved = Math.max(0, currentTokens - t);
    current = next;
    currentTokens = t;
    return saved;
  };

  // 1. whitespace
  const ws = normalizeWhitespace(current);
  if (ws !== current) {
    const saved = step(ws);
    suggestions.push({ id: "whitespace", title: "Tidy extra spaces and blank lines", detail: "Repeated spaces, trailing spaces and long runs of empty lines carry no meaning but still cost tokens.", savedTokens: saved, applied: true });
  }

  // 2. repeated lines
  const dup = dedupeLines(current);
  if (dup.removed.length > 0) {
    const saved = step(dup.text);
    suggestions.push({ id: "duplicates", title: `Remove ${dup.removed.length} repeated line${dup.removed.length === 1 ? "" : "s"}`, detail: `Said more than once: “${dup.removed[0].slice(0, 90)}${dup.removed[0].length > 90 ? "…" : ""}”. Repeating an instruction rarely makes a model follow it better.`, savedTokens: saved, applied: true });
  }

  // 3. wordy phrases
  const phr = applyPhrases(current);
  if (phr.count > 0 && phr.text !== current) {
    const saved = step(phr.text);
    suggestions.push({ id: "phrases", title: `Shorten ${phr.count} wordy phrase${phr.count === 1 ? "" : "s"}`, detail: "Swaps like “in order to” → “to” and “due to the fact that” → “because” keep the meaning exactly.", savedTokens: saved, applied: true });
  }

  // 4. pretty JSON in fences
  const js = prettyJsonBlocks(current);
  if (js.blocks > 0) {
    const saved = step(js.text);
    suggestions.push({ id: "json", title: `Compact ${js.blocks} JSON example${js.blocks === 1 ? "" : "s"}`, detail: "Indentation and line breaks in JSON are pure token cost. Models read compact JSON as well as pretty JSON.", savedTokens: saved, applied: true });
  }

  // 5. advice that needs a person
  const lower = text.toLowerCase();
  const fillerHits = FILLER.map((w) => ({ w, n: (lower.match(new RegExp(`\\b${w}\\b`, "g")) ?? []).length })).filter((x) => x.n > 0);
  const fillerTotal = fillerHits.reduce((a, x) => a + x.n, 0);
  if (fillerTotal >= 3) {
    suggestions.push({ id: "filler", title: `Cut filler words (${fillerTotal} found)`, detail: `Words like ${fillerHits.slice(0, 4).map((x) => `“${x.w}”`).join(", ")} rarely change the answer. Check each one and delete the ones that add nothing.`, savedTokens: 0, applied: false });
  }
  const shouting = (text.match(/\b[A-Z]{4,}\b/g) ?? []).filter((w) => !/^(JSON|HTTP|HTTPS|API|URL|SQL|HTML|CSV|XML|YAML|UTF|ASCII|NEVER|ALWAYS|MUST)$/.test(w));
  if (shouting.length >= 5) {
    suggestions.push({ id: "caps", title: "Reduce ALL-CAPS emphasis", detail: "Many shouted words dilute each other, and capitals often split into more tokens. Keep capitals for the one or two rules that really cannot be broken.", savedTokens: 0, applied: false });
  }
  const dynamic = dynamicHeadMatches(text);
  if (dynamic.length > 0) {
    suggestions.push({ id: "cache", title: "Move changing values to the end so caching works", detail: `The first half of the prompt contains ${dynamic.join(" and ")}. Providers can reuse (cache) an identical start of a prompt at a big discount, but only if nothing in the start changes between calls.`, savedTokens: 0, applied: false });
  }
  const paragraphs = text.split(/\n{2,}/);
  const bigBlock = paragraphs.map((p) => ({ p, t: p.length / 3.6 })).sort((a, b) => b.t - a.t)[0];
  if (bigBlock && bigBlock.t >= 1500 && bigBlock.t / Math.max(tokens, 1) >= 0.5) {
    suggestions.push({ id: "big-block", title: "One block is most of the prompt", detail: `A single section of about ${Math.round(bigBlock.t).toLocaleString("en-US")} tokens makes up over half of this prompt. If it is reference material, retrieve only the parts a question needs instead of sending all of it every time.`, savedTokens: 0, applied: false });
  }
  const examples = (text.match(/(?:^|\n)\s*(?:example|input|e\.g\.)\s*\d*\s*[:\-]/gi) ?? []).length;
  if (examples >= 6) {
    suggestions.push({ id: "examples", title: `You include about ${examples} examples`, detail: "Past three or four examples, extra ones usually add cost faster than quality. Test with fewer, keeping the most varied ones.", savedTokens: 0, applied: false });
  }
  if (!/\b(json|markdown|bullet|table|sentence|paragraph|words|format|schema|csv|yaml|xml)\b/i.test(text) && tokens > 40) {
    suggestions.push({ id: "format", title: "Say how long and in what format the answer should be", detail: "Output tokens cost several times more than input tokens. A line such as “Answer in at most 3 sentences” or a JSON schema keeps replies short.", savedTokens: 0, applied: false });
  }
  if (/^\s*you are (?:a|an) (?:very )?(?:helpful|friendly|smart|intelligent|expert)? ?(?:ai )?assistant\.?\s*$/im.test(text)) {
    suggestions.push({ id: "generic-role", title: "Replace the generic “helpful assistant” line", detail: "“You are a helpful assistant” is already the default behaviour. Spend those tokens on what this product actually needs.", savedTokens: 0, applied: false });
  }
  if (tokens >= 8000) {
    suggestions.push({ id: "long", title: "This is a very long prompt", detail: "Long prompts are slower as well as costly. Summarise older conversation turns and retrieve only what the current step needs.", savedTokens: 0, applied: false });
  }

  suggestions.sort((a, b) => Number(b.applied) - Number(a.applied) || b.savedTokens - a.savedTokens);
  return { tokens, shortenedTokens: currentTokens, shortened: current, suggestions, stats };
}
