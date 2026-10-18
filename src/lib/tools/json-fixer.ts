/**
 * Forgiving JSON repair for the free JSON fixer tool.
 *
 * It reads the kinds of "almost JSON" that language models write: code fences,
 * chatty text around the data, single quotes, unquoted keys, trailing commas,
 * comments, Python values, smart quotes, missing commas, raw line breaks inside
 * strings and output that was cut off before it closed. It never invents data:
 * a cut-off value is closed where it stops, nothing is added after it.
 */

export type Fix = { label: string; count: number };

export type RepairResult =
  | { ok: true; text: string; minified: string; value: unknown; fixes: Fix[]; alreadyValid: boolean }
  | { ok: false; error: string; fixes: Fix[] };

/** Numbers outside the safe integer range keep their exact digits. */
class RawNumber {
  readonly raw: string;
  constructor(raw: string) {
    this.raw = raw;
  }
}

const MAX_DEPTH = 120;

class Parser {
  pos = 0;
  readonly fixes = new Map<string, number>();
  readonly src: string;
  constructor(src: string) {
    this.src = src;
  }

  note(label: string) {
    this.fixes.set(label, (this.fixes.get(label) ?? 0) + 1);
  }

  eof() {
    return this.pos >= this.src.length;
  }

  peek() {
    return this.src[this.pos];
  }

  skipSpace() {
    for (;;) {
      const c = this.src[this.pos];
      if (c === undefined) return;
      if (c === " " || c === "\n" || c === "\r" || c === "\t" || c === " " || c === "﻿" || c === " " || c === " ") {
        this.pos++;
      } else if (c === "/" && this.src[this.pos + 1] === "/") {
        this.note("Removed comments");
        while (!this.eof() && this.src[this.pos] !== "\n") this.pos++;
      } else if (c === "/" && this.src[this.pos + 1] === "*") {
        this.note("Removed comments");
        const end = this.src.indexOf("*/", this.pos + 2);
        this.pos = end === -1 ? this.src.length : end + 2;
      } else if (c === "#" && this.atLineStart()) {
        this.note("Removed comments");
        while (!this.eof() && this.src[this.pos] !== "\n") this.pos++;
      } else {
        return;
      }
    }
  }

  private atLineStart() {
    let i = this.pos - 1;
    while (i >= 0 && (this.src[i] === " " || this.src[i] === "\t")) i--;
    return i < 0 || this.src[i] === "\n";
  }

  parseValue(depth: number): unknown {
    if (depth > MAX_DEPTH) throw new Error("This is nested more than 120 levels deep, which is almost certainly not real data.");
    this.skipSpace();
    const c = this.peek();
    if (c === undefined) throw new Error("The text ends before a value starts.");
    if (c === "{") return this.parseObject(depth);
    if (c === "[") return this.parseArray(depth);
    if (isQuote(c)) return this.parseString();
    if (c === "-" || c === "+" || c === "." || (c >= "0" && c <= "9")) return this.parseNumber();
    return this.parseWord();
  }

  parseObject(depth: number) {
    this.pos++; // {
    const out: Record<string, unknown> = {};
    for (;;) {
      this.skipSpace();
      const c = this.peek();
      if (c === undefined) {
        this.note("Closed a cut-off object");
        return out;
      }
      if (c === "}") {
        this.pos++;
        return out;
      }
      if (c === ",") {
        this.pos++;
        this.note("Removed extra commas");
        continue;
      }
      if (c === "]") {
        // A stray closer: the object was meant to end here.
        this.note("Closed an object early");
        return out;
      }
      const key = this.parseKey();
      this.skipSpace();
      if (this.eof()) {
        this.note("Dropped a half-written entry at the end");
        return out;
      }
      if (this.peek() === ":" || this.peek() === "=") {
        this.pos++;
      } else {
        this.note("Added missing colons");
      }
      this.skipSpace();
      if (this.eof()) {
        this.note("Dropped a half-written entry at the end");
        return out;
      }
      let value: unknown;
      if (this.peek() === "," || this.peek() === "}") {
        this.note("Filled empty values with null");
        value = null;
      } else {
        value = this.parseValue(depth + 1);
      }
      if (Object.prototype.hasOwnProperty.call(out, key)) this.note("Kept the last of repeated keys");
      Object.defineProperty(out, key, { value, enumerable: true, writable: true, configurable: true });
      this.skipSpace();
      const n = this.peek();
      if (n === ",") {
        this.pos++;
        this.skipSpace();
        if (this.peek() === "}") this.note("Removed trailing commas");
      } else if (n !== "}" && n !== undefined && n !== "]") {
        this.note("Added missing commas");
      }
    }
  }

  parseArray(depth: number) {
    this.pos++; // [
    const out: unknown[] = [];
    for (;;) {
      this.skipSpace();
      const c = this.peek();
      if (c === undefined) {
        this.note("Closed a cut-off list");
        return out;
      }
      if (c === "]") {
        this.pos++;
        return out;
      }
      if (c === ",") {
        this.pos++;
        this.note("Removed extra commas");
        continue;
      }
      if (c === "}") {
        this.note("Closed a list early");
        return out;
      }
      out.push(this.parseValue(depth + 1));
      this.skipSpace();
      const n = this.peek();
      if (n === ",") {
        this.pos++;
        this.skipSpace();
        if (this.peek() === "]") this.note("Removed trailing commas");
      } else if (n !== "]" && n !== undefined && n !== "}") {
        this.note("Added missing commas");
      }
    }
  }

  parseKey(): string {
    const c = this.peek();
    if (c !== undefined && isQuote(c)) return this.parseString();
    // Unquoted key: read up to a colon, a line end or a delimiter.
    const start = this.pos;
    while (!this.eof()) {
      const ch = this.src[this.pos];
      if (ch === ":" || ch === "=" || ch === "," || ch === "}" || ch === "\n" || ch === "{" || ch === "[") break;
      this.pos++;
    }
    const raw = this.src.slice(start, this.pos).trim();
    if (!raw) {
      // Nothing usable: skip one character so we always make progress.
      this.pos++;
      this.note("Skipped stray characters");
      return "";
    }
    this.note("Quoted unquoted keys");
    return raw;
  }

  parseString(): string {
    const open = this.src[this.pos];
    this.pos++;
    if (open !== '"') this.note(open === "`" ? "Turned backticks into quotes" : open === "'" ? "Turned single quotes into double quotes" : "Turned curly quotes into straight quotes");
    let out = "";
    for (;;) {
      if (this.eof()) {
        this.note("Closed a cut-off string");
        return out;
      }
      const c = this.src[this.pos];
      if (c === "\\") {
        const n = this.src[this.pos + 1];
        if (n === undefined) {
          this.pos++;
          this.note("Closed a cut-off string");
          return out;
        }
        this.pos += 2;
        switch (n) {
          case "n": out += "\n"; break;
          case "t": out += "\t"; break;
          case "r": out += "\r"; break;
          case "b": out += "\b"; break;
          case "f": out += "\f"; break;
          case "/": out += "/"; break;
          case "\\": out += "\\"; break;
          case '"': out += '"'; break;
          case "'": out += "'"; break;
          case "u": {
            const hex = this.src.slice(this.pos, this.pos + 4);
            if (/^[0-9a-fA-F]{4}$/.test(hex)) {
              out += String.fromCharCode(parseInt(hex, 16));
              this.pos += 4;
            } else {
              out += "u";
              this.note("Fixed invalid escapes");
            }
            break;
          }
          default:
            out += n;
            this.note("Fixed invalid escapes");
        }
        continue;
      }
      if (closesString(open, c)) {
        if (this.looksLikeStringEnd()) {
          this.pos++;
          return out;
        }
        out += c;
        this.pos++;
        this.note("Escaped quotes inside text");
        continue;
      }
      if (c === "\n" || c === "\r" || c === "\t") {
        out += c;
        this.pos++;
        this.note("Escaped raw line breaks inside text");
        continue;
      }
      out += c;
      this.pos++;
    }
  }

  /** Decides whether a quote ends the string, by looking at what follows it. */
  private looksLikeStringEnd(): boolean {
    let i = this.pos + 1;
    while (i < this.src.length && /[ \t\r\n]/.test(this.src[i])) i++;
    const n = this.src[i];
    if (n === undefined) return true;
    if (n === "," || n === "}" || n === "]" || n === ":" || n === "=") return true;
    if (n === "/" && (this.src[i + 1] === "/" || this.src[i + 1] === "*")) return true;
    // A line break followed by a new key or value also ends it (a missing comma).
    if (/\n/.test(this.src.slice(this.pos + 1, i)) && (isQuote(n) || n === "{" || n === "[" || /[A-Za-z_]/.test(n))) return true;
    return false;
  }

  parseNumber(): unknown {
    const start = this.pos;
    let text = "";
    while (!this.eof() && /[0-9eE+\-.xXa-fA-F_]/.test(this.src[this.pos])) {
      // Stop before words that merely start with a hex letter, such as `-inf`.
      text += this.src[this.pos++];
    }
    if (/^[+-]?(inf|infinity)$/i.test(text)) {
      this.note("Replaced Infinity and NaN with null");
      return null;
    }
    let cleaned = text.replace(/_/g, "");
    if (/^[+-]?0[xX][0-9a-fA-F]+$/.test(cleaned)) {
      this.note("Converted hex numbers");
      const neg = cleaned.startsWith("-");
      const n = parseInt(cleaned.replace(/^[+-]/, ""), 16);
      return neg ? -n : n;
    }
    if (cleaned.startsWith("+")) {
      cleaned = cleaned.slice(1);
      this.note("Cleaned up numbers");
    }
    if (/^-?\.\d/.test(cleaned)) {
      cleaned = cleaned.replace(/^(-?)\./, "$10.");
      this.note("Cleaned up numbers");
    }
    if (/^-?\d+\.$/.test(cleaned)) {
      cleaned = cleaned.slice(0, -1);
      this.note("Cleaned up numbers");
    }
    if (/^-?0\d+$/.test(cleaned)) {
      cleaned = cleaned.replace(/^(-?)0+(\d)/, "$1$2");
      this.note("Cleaned up numbers");
    }
    if (!/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(cleaned)) {
      // Not a number after all, for example a date or a version like 1.2.3.
      this.pos = start;
      return this.parseBareString();
    }
    if (/^-?\d+$/.test(cleaned) && !Number.isSafeInteger(Number(cleaned))) return new RawNumber(cleaned);
    return Number(cleaned);
  }

  parseWord(): unknown {
    const start = this.pos;
    while (!this.eof() && /[A-Za-z0-9_$]/.test(this.src[this.pos])) this.pos++;
    const word = this.src.slice(start, this.pos);
    switch (word) {
      case "true": return true;
      case "false": return false;
      case "null": return null;
      case "True": this.note("Converted Python True, False and None"); return true;
      case "False": this.note("Converted Python True, False and None"); return false;
      case "None": this.note("Converted Python True, False and None"); return null;
      case "undefined": this.note("Replaced undefined with null"); return null;
      case "NaN": case "Infinity": this.note("Replaced Infinity and NaN with null"); return null;
    }
    this.pos = start;
    return this.parseBareString();
  }

  /** An unquoted word or phrase used as a value: read to the next delimiter. */
  parseBareString(): string {
    const start = this.pos;
    while (!this.eof()) {
      const ch = this.src[this.pos];
      if (ch === "," || ch === "}" || ch === "]" || ch === "\n") break;
      this.pos++;
    }
    const raw = this.src.slice(start, this.pos).trim();
    if (!raw) {
      this.pos++;
      this.note("Skipped stray characters");
      return "";
    }
    this.note("Quoted unquoted text values");
    return raw;
  }
}

function isQuote(c: string) {
  return c === '"' || c === "'" || c === "`" || c === "“" || c === "”" || c === "‘" || c === "’";
}

function closesString(open: string, c: string) {
  if (open === '"' || open === "“" || open === "”") return c === '"' || c === "”" || c === "“";
  if (open === "'" || open === "‘" || open === "’") return c === "'" || c === "’" || c === "‘";
  return c === open;
}

function stringify(value: unknown, indent: number | undefined, level = 0): string {
  if (value instanceof RawNumber) return value.raw;
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  const pad = indent === undefined ? "" : "\n" + " ".repeat(indent * (level + 1));
  const end = indent === undefined ? "" : "\n" + " ".repeat(indent * level);
  const sep = indent === undefined ? "," : ",";
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    return "[" + value.map((v) => pad + stringify(v, indent, level + 1)).join(sep) + end + "]";
  }
  const entries = Object.entries(value as Record<string, unknown>);
  if (entries.length === 0) return "{}";
  const colon = indent === undefined ? ":" : ": ";
  return "{" + entries.map(([k, v]) => pad + JSON.stringify(k) + colon + stringify(v, indent, level + 1)).join(sep) + end + "}";
}

/** Pulls the data out of a markdown code fence or chatty text around it. */
function extractCandidate(input: string, fixes: Map<string, number>): string {
  let text = input.replace(/^﻿/, "");
  const fence = text.match(/```[a-zA-Z0-9_-]*[ \t]*\r?\n?([\s\S]*?)(?:```|$)/);
  if (fence && /[{[]/.test(fence[1])) {
    text = fence[1];
    fixes.set("Removed the code fence", 1);
  }
  const trimmed = text.trim();
  const first = trimmed[0];
  if (first === "{" || first === "[") return trimmed;
  const idx = trimmed.search(/[{[]/);
  if (idx > 0) {
    fixes.set("Removed text around the data", 1);
    return trimmed.slice(idx);
  }
  return trimmed;
}

export function repairJson(input: string): RepairResult {
  if (!input || !input.trim()) return { ok: false, error: "Paste some JSON first.", fixes: [] };

  let valid = false;
  try {
    JSON.parse(input);
    valid = true;
  } catch {
    /* repair below */
  }

  const fixes = new Map<string, number>();
  const candidate = valid ? input.trim() : extractCandidate(input, fixes);
  const parser = new Parser(candidate);
  const values: unknown[] = [];
  try {
    for (;;) {
      parser.skipSpace();
      if (parser.eof()) break;
      const c = parser.peek();
      if (values.length > 0 && c !== "{" && c !== "[") {
        parser.note("Dropped text after the data");
        break;
      }
      values.push(parser.parseValue(0));
      // Skip separators between several top-level values (JSON lines or a stray comma).
      parser.skipSpace();
      if (parser.peek() === ",") parser.pos++;
    }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not read this text.", fixes: toFixes(fixes, parser.fixes) };
  }

  if (values.length === 0) return { ok: false, error: "Could not find any JSON in this text.", fixes: [] };

  // A lone word or number with no braces is almost never what someone meant to paste.
  if (values.length === 1 && (values[0] === null || typeof values[0] !== "object") && !/^\s*(["'`]|-?\d|true|false|null)/.test(candidate)) {
    return { ok: false, error: "This does not look like JSON. It needs curly braces { } for an object or square brackets [ ] for a list.", fixes: [] };
  }

  let value: unknown = values[0];
  if (values.length > 1) {
    value = values;
    parser.note("Combined several JSON values into one list");
  }
  const text = stringify(value, 2);
  // The result must parse with the strict parser, or it is not really fixed.
  try {
    JSON.parse(text);
  } catch {
    return { ok: false, error: "The text was too broken to repair safely.", fixes: toFixes(fixes, parser.fixes) };
  }
  const list = toFixes(fixes, parser.fixes);
  return { ok: true, text, minified: stringify(value, undefined), value, fixes: list, alreadyValid: valid && list.length === 0 };
}

function toFixes(...maps: Map<string, number>[]): Fix[] {
  const merged = new Map<string, number>();
  for (const map of maps) for (const [label, count] of map) merged.set(label, (merged.get(label) ?? 0) + count);
  return [...merged].map(([label, count]) => ({ label, count }));
}
