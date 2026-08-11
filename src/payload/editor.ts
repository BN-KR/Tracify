import type { TextFieldSingleValidation } from "payload";
import {
  BoldFeature,
  FixedToolbarFeature,
  HeadingFeature,
  InlineCodeFeature,
  InlineToolbarFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  ParagraphFeature,
  BlockquoteFeature,
  StrikethroughFeature,
  UnderlineFeature,
  UnorderedListFeature,
  UploadFeature,
  lexicalEditor,
  type LinkFields,
} from "@payloadcms/richtext-lexical";

export const blogEditor = lexicalEditor({
  features: [
    ParagraphFeature(),
    HeadingFeature({ enabledHeadingSizes: ["h2", "h3", "h4"] }),
    BoldFeature(),
    ItalicFeature(),
    UnderlineFeature(),
    StrikethroughFeature(),
    InlineCodeFeature(),
    BlockquoteFeature(),
    OrderedListFeature(),
    UnorderedListFeature(),
    UploadFeature({ collections: { media: { fields: [] } } }),
    LinkFeature({
      enabledCollections: ["posts"],
      fields: ({ defaultFields }) => {
        const fieldsWithoutUrl = defaultFields.filter(
          (field) => !("name" in field && field.name === "url"),
        );

        return [
          ...fieldsWithoutUrl,
          {
            name: "url",
            type: "text",
            admin: {
              condition: (_data, siblingData) => siblingData?.linkType !== "internal",
            },
            label: "URL",
            required: true,
            validate: ((value, options) => {
              if ((options?.siblingData as LinkFields)?.linkType === "internal") return true;
              return value ? true : "URL is required";
            }) as TextFieldSingleValidation,
          },
        ];
      },
    }),
    FixedToolbarFeature(),
    InlineToolbarFeature(),
  ],
});
