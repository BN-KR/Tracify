import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";

const registryPath = "scripts/content/media-sources.json";
const mediaDirectory = "public/media/organic-series/";
const mediaDirectoryPath = resolve(mediaDirectory);
const mediaSources = JSON.parse(await readFile(registryPath, "utf8"));

for (const media of mediaSources) {
  const destination = media.localPath ? resolve(media.localPath) : null;
  if (!destination || relative(mediaDirectoryPath, destination).startsWith("..")) throw new Error(`${media.slug}: localPath must remain within ${mediaDirectory}.`);
  const temporaryDestination = `${destination}.tmp`;
  await mkdir(dirname(destination), { recursive: true });

  const response = await fetch(media.downloadUrl);
  if (!response.ok) throw new Error(`${media.slug}: download failed with HTTP ${response.status}.`);

  try {
    await writeFile(temporaryDestination, Buffer.from(await response.arrayBuffer()));
    await rename(temporaryDestination, destination);
  } catch (error) {
    await rm(temporaryDestination, { force: true });
    throw error;
  }

  console.log(`Downloaded ${media.slug} -> ${media.localPath}`);
}
