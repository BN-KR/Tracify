import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { buildConfig } from "payload";
import sharp from "sharp";

import { Categories } from "./payload/collections/Categories";
import { Media } from "./payload/collections/Media";
import { Posts } from "./payload/collections/Posts";
import { Users } from "./payload/collections/Users";
import { blogEditor } from "./payload/editor";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
const isVercel = process.env.VERCEL === "1";
const payloadSecret = process.env.PAYLOAD_SECRET || (isVercel ? "" : "tracify-local-payload-development");
const localDatabaseUrl = pathToFileURL(path.resolve(dirname, "../payload-local.db")).href;

if (isVercel && (!databaseUrl || !payloadSecret)) {
  throw new Error("Payload requires DATABASE_URL (or POSTGRES_URL) and PAYLOAD_SECRET on Vercel.");
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  routes: {
    admin: "/cms",
    api: "/cms-api",
  },
  collections: [Posts, Categories, Media, Users],
  db: databaseUrl
    ? postgresAdapter({ pool: { connectionString: databaseUrl } })
    : sqliteAdapter({ client: { url: localDatabaseUrl } }),
  editor: blogEditor,
  plugins: blobToken
    ? [
        vercelBlobStorage({
          collections: { media: true },
          token: blobToken,
        }),
      ]
    : [],
  secret: payloadSecret,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
});
