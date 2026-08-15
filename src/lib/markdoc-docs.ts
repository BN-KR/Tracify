import fs from "node:fs";
import path from "node:path";
import Markdoc, { type Tag } from "@markdoc/markdoc";
import { parse as parseYaml } from "yaml";

export type DocArticle = { slug: string; title: string; description: string; section: string; order: number; content: Tag; body: string };
const directory = path.join(process.cwd(), "content", "docs");

function readArticle(filename: string): DocArticle {
  const source = fs.readFileSync(path.join(directory, filename), "utf8");
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/);
  if (!match) throw new Error(`${filename}: expected Markdoc frontmatter`);
  const data = parseYaml(match[1]) as Record<string, unknown>;
  for (const field of ["slug", "title", "description", "section"]) if (typeof data[field] !== "string" || !data[field]) throw new Error(`${filename}: missing ${field}`);
  const ast = Markdoc.parse(match[2].trim());
  const errors = Markdoc.validate(ast);
  if (errors.length) throw new Error(`${filename}: invalid Markdoc`);
  const content = Markdoc.transform(ast);
  if (!Markdoc.Tag.isTag(content)) throw new Error(`${filename}: invalid document root`);
  return { slug: data.slug as string, title: data.title as string, description: data.description as string, section: data.section as string, order: typeof data.order === "number" ? data.order : 0, content, body: match[2].trim() };
}

let cache: DocArticle[] | undefined;
export function getDocs() {
  if (!cache) cache = fs.readdirSync(directory).filter((name) => name.endsWith(".mdoc")).map(readArticle).sort((a, b) => a.order - b.order);
  return cache;
}
export function getDoc(slug: string) { return getDocs().find((doc) => doc.slug === slug) ?? null; }
