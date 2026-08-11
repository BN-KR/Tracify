import type { CollectionConfig } from "payload";

import { authenticated } from "../access";

export const Users: CollectionConfig = {
  slug: "payload-users",
  admin: {
    useAsTitle: "email",
  },
  auth: {
    useAPIKey: true,
  },
  access: {
    admin: ({ req }) => Boolean(req.user),
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
  ],
};
