import assert from "node:assert/strict";
import test from "node:test";

import { lexicalToMarkdoc } from "./lib/lexical-to-markdoc.mjs";

test("converts Lexical structure, inline formatting, links, lists, quotes, and uploads", () => {
  const lexical = {
    root: {
      type: "root",
      children: [
        {
          type: "heading",
          tag: "h2",
          children: [{ type: "text", text: "Heading", format: 0 }],
        },
        {
          type: "paragraph",
          children: [
            { type: "text", text: "Bold", format: 1 },
            { type: "text", text: " and ", format: 0 },
            {
              type: "link",
              fields: { url: "/docs" },
              children: [{ type: "text", text: "docs", format: 0 }],
            },
          ],
        },
        {
          type: "list",
          listType: "number",
          children: [
            {
              type: "listitem",
              children: [
                {
                  type: "paragraph",
                  children: [{ type: "text", text: "One", format: 0 }],
                },
              ],
            },
          ],
        },
        {
          type: "quote",
          children: [{ type: "text", text: "A quote", format: 0 }],
        },
        { type: "upload", value: 7 },
      ],
    },
  };

  assert.equal(
    lexicalToMarkdoc(lexical, (id) =>
      id === 7 ? { src: "/media/seven.jpg", alt: "Seven" } : null,
    ),
    "## Heading\n\n**Bold** and [docs](/docs)\n\n1. One\n\n> A quote\n\n![Seven](/media/seven.jpg)",
  );
});

test("escapes Markdown control characters in plain text", () => {
  const lexical = {
    root: {
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [{ type: "text", text: "Use * and [ safely", format: 0 }],
        },
      ],
    },
  };
  assert.equal(
    lexicalToMarkdoc(lexical, () => null),
    "Use \\* and \\[ safely",
  );
});
