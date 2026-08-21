import fs from "node:fs";
import path from "node:path";

import Markdoc, { type Tag } from "@markdoc/markdoc";
import { parse as parseYaml } from "yaml";

export const blogMarkdocConfig = {
  tags: {
    "trace-scenario": {
      attributes: {
        title: { type: String, required: true },
        prompt: { type: String, required: true },
        outcome: { type: String, required: true },
      },
    },
  },
};

export type BlogImage = {
  src: string;
  alt: string;
  caption?: string;
  card?: string;
  hero?: string;
  og?: string;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  updatedAt?: string;
  author: string;
  draft: boolean;
  categories: string[];
  tags: string[];
  relatedPosts: string[];
  heroImage?: BlogImage;
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    image?: BlogImage;
    canonicalUrl?: string;
  };
  body: string;
  plainText: string;
  content: Tag;
};

type BlogRepository = {
  getAllPosts(): BlogPost[];
  getPublishedPosts(category?: string): BlogPost[];
  getPublishedPost(slug: string): BlogPost | null;
  getCategoryOptions(): Array<{ label: string; value: string }>;
};

const defaultContentDirectory = path.join(process.cwd(), "content", "blog");

function splitFrontmatter(source: string, filename: string) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/);
  if (!match) throw new Error(`${filename}: expected YAML frontmatter enclosed by ---`);
  return { frontmatter: parseYaml(match[1]) as unknown, body: match[2].trim() };
}

function requireRecord(value: unknown, filename: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${filename}: frontmatter must be a YAML object`);
  }
  return value as Record<string, unknown>;
}

function requireString(record: Record<string, unknown>, field: string, filename: string) {
  const value = record[field];
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${filename}: frontmatter field “${field}” must be a non-empty string`);
  }
  return value.trim();
}

function optionalString(record: Record<string, unknown>, field: string) {
  const value = record[field];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function stringArray(record: Record<string, unknown>, field: string, filename: string) {
  const value = record[field] ?? [];
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || !item.trim())) {
    throw new Error(`${filename}: frontmatter field “${field}” must be an array of strings`);
  }
  return value.map((item) => (item as string).trim());
}

function imageValue(value: unknown, field: string, filename: string): BlogImage | undefined {
  if (value === undefined || value === null) return undefined;
  const record = requireRecord(value, filename);
  return {
    src: requireString(record, "src", `${filename} ${field}`),
    alt: requireString(record, "alt", `${filename} ${field}`),
    caption: optionalString(record, "caption"),
    card: optionalString(record, "card"),
    hero: optionalString(record, "hero"),
    og: optionalString(record, "og"),
  };
}

function extractPlainText(ast: ReturnType<typeof Markdoc.parse>) {
  const text: string[] = [];
  for (const node of ast.walk()) {
    if (node.type === "text" && typeof node.attributes.content === "string") {
      text.push(node.attributes.content);
    }
  }
  return text.join(" ").replace(/\s+/g, " ").trim();
}

function parsePost(source: string, filename: string): BlogPost {
  const { frontmatter, body } = splitFrontmatter(source, filename);
  const data = requireRecord(frontmatter, filename);
  const title = requireString(data, "title", filename);
  const slug = requireString(data, "slug", filename);
  const excerpt = requireString(data, "excerpt", filename);
  const publishedAt = requireString(data, "publishedAt", filename);
  const author = requireString(data, "author", filename);
  if (Number.isNaN(Date.parse(publishedAt))) {
    throw new Error(`${filename}: frontmatter field “publishedAt” must be an ISO date`);
  }
  if (data.draft !== undefined && typeof data.draft !== "boolean") {
    throw new Error(`${filename}: frontmatter field “draft” must be a boolean`);
  }

  const ast = Markdoc.parse(body);
  const errors = Markdoc.validate(ast, blogMarkdocConfig);
  if (errors.length) {
    throw new Error(`${filename}: invalid Markdoc: ${errors.map((error) => error.error.message).join("; ")}`);
  }
  const content = Markdoc.transform(ast, blogMarkdocConfig);
  if (!Markdoc.Tag.isTag(content)) {
    throw new Error(`${filename}: expected a Markdoc document root`);
  }

  const seoRecord = data.seo === undefined ? {} : requireRecord(data.seo, filename);
  const heroImage = imageValue(data.heroImage, "heroImage", filename);

  return {
    id: path.basename(filename, path.extname(filename)),
    title,
    slug,
    excerpt,
    publishedAt: new Date(publishedAt).toISOString(),
    updatedAt: optionalString(data, "updatedAt"),
    author,
    draft: data.draft === true,
    categories: stringArray(data, "categories", filename),
    tags: stringArray(data, "tags", filename),
    relatedPosts: stringArray(data, "relatedPosts", filename),
    heroImage,
    seo: {
      metaTitle: optionalString(seoRecord, "metaTitle"),
      metaDescription: optionalString(seoRecord, "metaDescription"),
      image: imageValue(seoRecord.image, "seo.image", filename) ?? heroImage,
      canonicalUrl: optionalString(seoRecord, "canonicalUrl"),
    },
    body,
    plainText: extractPlainText(ast),
    content,
  };
}

export function createBlogRepository(contentDirectory = defaultContentDirectory): BlogRepository {
  let posts: BlogPost[] | undefined;

  function getAllPosts() {
    if (posts) return posts;
    if (!fs.existsSync(contentDirectory)) return [];
    posts = fs
      .readdirSync(contentDirectory, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith(".mdoc"))
      .map((entry) => {
        const filename = path.join(contentDirectory, entry.name);
        return parsePost(fs.readFileSync(filename, "utf8"), entry.name);
      });

    const seen = new Set<string>();
    for (const post of posts) {
      if (seen.has(post.slug)) throw new Error(`Duplicate blog slug: ${post.slug}`);
      seen.add(post.slug);
    }
    return posts;
  }

  function getPublishedPosts(category?: string) {
    return getAllPosts()
      .filter((post) => !post.draft && (!category || post.categories.includes(category)))
      .sort((left, right) => Date.parse(right.publishedAt) - Date.parse(left.publishedAt));
  }

  return {
    getAllPosts,
    getPublishedPosts,
    getPublishedPost(slug) {
      return getPublishedPosts().find((post) => post.slug === slug) ?? null;
    },
    getCategoryOptions() {
      return [...new Set(getPublishedPosts().flatMap((post) => post.categories))]
        .sort((left, right) => left.localeCompare(right))
        .map((category) => ({ label: category, value: category }));
    },
  };
}

const repository = createBlogRepository();

export const getAllPosts = repository.getAllPosts;
export const getPublishedPosts = repository.getPublishedPosts;
export const getPublishedPost = repository.getPublishedPost;
export const getCategoryOptions = repository.getCategoryOptions;
export function getPostDate(post: BlogPost) {
  return post.publishedAt;
}
