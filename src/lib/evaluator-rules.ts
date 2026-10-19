/** Code-rule evaluators, shared by the evaluator run API and the "try it" box on the Evaluators page. */

export const RULE_HELP = [
  { rule: "contains:<text>", text: "The answer includes the text (ignores capital letters)." },
  { rule: "equals_expected", text: "The answer matches the expected answer exactly." },
  { rule: "not_empty", text: "The answer is not blank." },
  { rule: "regex:/pattern/i", text: "The answer matches a regular expression." },
  { rule: "json_valid", text: "The answer is valid JSON." },
  { rule: 'json_schema:{"type":"object","required":["id"]}', text: "The answer is a JSON object with the listed keys." },
] as const;

function after(criteria: string, marker: string) {
  return criteria.slice(criteria.toLowerCase().indexOf(marker) + marker.length).trim();
}

function toRegex(source: string) {
  const match = source.match(/^\/(.*)\/([gimsuy]*)$/);
  return match ? new RegExp(match[1], match[2]) : new RegExp(source);
}

/** Runs one rule. Returns 1 for pass and 0 for fail; throws a plain-language error when the rule itself is unusable. */
export function runCodeRule(criteria: string, output: string, expectedOutput?: string): 0 | 1 {
  const rule = criteria.toLowerCase();
  if (rule.includes("contains:")) return output.toLowerCase().includes(after(criteria, "contains:").toLowerCase()) ? 1 : 0;
  if (rule.includes("equals_expected") || rule.includes("exact_match")) return expectedOutput !== undefined && output.trim() === expectedOutput.trim() ? 1 : 0;
  if (rule.includes("not_empty")) return output.trim() ? 1 : 0;
  if (rule.includes("regex:")) {
    let expression: RegExp;
    try { expression = toRegex(after(criteria, "regex:")); } catch { throw new Error("That regular expression is not valid."); }
    return expression.test(output) ? 1 : 0;
  }
  if (rule.includes("json_valid")) {
    try { JSON.parse(output); return 1; } catch { return 0; }
  }
  if (rule.includes("json_schema:")) {
    let schema: { required?: unknown; type?: unknown };
    try { schema = JSON.parse(after(criteria, "json_schema:")) as typeof schema; } catch { throw new Error("The json_schema part is not valid JSON."); }
    try {
      const parsed = JSON.parse(output) as unknown;
      const isObject = typeof parsed === "object" && parsed !== null && !Array.isArray(parsed);
      if (schema.type === "object" && !isObject) return 0;
      const required = Array.isArray(schema.required) ? schema.required.filter((key): key is string => typeof key === "string") : [];
      return isObject && required.every((key) => Object.prototype.hasOwnProperty.call(parsed, key)) ? 1 : required.length ? 0 : 1;
    } catch { return 0; }
  }
  throw new Error("Unsupported code rule. Use contains:<text>, equals_expected, not_empty, regex:/pattern/, json_valid or json_schema:{…}.");
}

/** Checks a rule without running it on anything. Returns a message for people, or null when the rule is usable. */
export function checkCodeRule(criteria: string): string | null {
  try { runCodeRule(criteria, "", ""); return null; } catch (error) { return error instanceof Error ? error.message : "That rule cannot be used."; }
}
