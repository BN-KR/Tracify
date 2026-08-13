function collectText(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (!value || typeof value !== "object") return [];
  if (Array.isArray(value)) return value.flatMap(collectText);

  const record = value as Record<string, unknown>;
  const ownText = typeof record.text === "string" ? [record.text] : [];
  return [...ownText, ...Object.values(record).flatMap(collectText)];
}

export function getReadingTime(body: unknown): number {
  const text = collectText(body).join(" ");
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}
