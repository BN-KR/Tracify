import path from "node:path";
import { fileURLToPath } from "node:url";
import type { CollectionConfig } from "payload";

import { authenticated } from "../access";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export const Media: CollectionConfig = {
  slug: "media",
  admin: {
    useAsTitle: "alt",
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: () => true,
    update: authenticated,
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
    },
    {
      name: "caption",
      type: "text",
    },
  ],
  upload: {
    staticDir: path.resolve(dirname, "../../../public/media"),
    adminThumbnail: "thumbnail",
    focalPoint: true,
    imageSizes: [
      { name: "thumbnail", width: 320 },
      { name: "card", width: 800, height: 450, crop: "center" },
      { name: "hero", width: 1600 },
      { name: "og", width: 1200, height: 630, crop: "center" },
    ],
  },
};
