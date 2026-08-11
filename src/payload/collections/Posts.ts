import { revalidatePath } from "next/cache";
import { slugField, type CollectionConfig } from "payload";

import { authenticated, authenticatedOrPublished } from "../access";
import { blogEditor } from "../editor";

export const Posts: CollectionConfig = {
  slug: "posts",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "_status", "publishedAt", "updatedAt"],
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  defaultPopulate: {
    title: true,
    slug: true,
    excerpt: true,
    heroImage: true,
    publishedAt: true,
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    slugField(),
    {
      name: "excerpt",
      type: "textarea",
      required: true,
      maxLength: 220,
    },
    {
      name: "content",
      type: "richText",
      editor: blogEditor,
      required: true,
    },
    {
      name: "heroImage",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "categories",
      type: "relationship",
      relationTo: "categories",
      hasMany: true,
      admin: { position: "sidebar" },
    },
    {
      name: "relatedPosts",
      type: "relationship",
      relationTo: "posts",
      hasMany: true,
      admin: { position: "sidebar" },
      filterOptions: ({ id }) => ({ id: { not_in: [id] } }),
    },
    {
      name: "author",
      type: "text",
      defaultValue: "Tracify Team",
      required: true,
      admin: { position: "sidebar" },
    },
    {
      name: "publishedAt",
      type: "date",
      admin: {
        date: { pickerAppearance: "dayAndTime" },
        position: "sidebar",
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) =>
            siblingData._status === "published" && !value ? new Date().toISOString() : value,
        ],
      },
    },
    {
      name: "tags",
      type: "array",
      fields: [{ name: "tag", type: "text", required: true }],
    },
    {
      name: "seo",
      type: "group",
      fields: [
        { name: "metaTitle", type: "text", maxLength: 70 },
        { name: "metaDescription", type: "textarea", maxLength: 180 },
        { name: "image", type: "upload", relationTo: "media" },
        { name: "canonicalUrl", type: "text" },
      ],
    },
  ],
  hooks: {
    afterChange: [
      ({ doc, previousDoc, req }) => {
        if (req.context.disableRevalidate) return doc;
        revalidatePath("/blog");
        revalidatePath("/blog/rss.xml");
        if (doc.slug) revalidatePath(`/blog/${doc.slug}`);
        if (previousDoc?.slug && previousDoc.slug !== doc.slug) {
          revalidatePath(`/blog/${previousDoc.slug}`);
        }
        return doc;
      },
    ],
    afterDelete: [
      ({ doc }) => {
        revalidatePath("/blog");
        revalidatePath("/blog/rss.xml");
        if (doc?.slug) revalidatePath(`/blog/${doc.slug}`);
        return doc;
      },
    ],
  },
  versions: {
    drafts: {
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
};
