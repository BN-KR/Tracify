import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const root = join(process.cwd(), "artifacts", "reference-parity");
const viewports = ["desktop-wide", "desktop-compact", "tablet-landscape", "tablet-portrait", "mobile-standard", "mobile-narrow"];
const surfaces = ["home", "tracing", "sessions", "users", "alerts", "prompts", "playground", "scores", "evaluators", "annotation", "datasets", "experiments", "settings", "dashboards"];
const threshold = 8;
const results = [];

for (const viewport of viewports) {
  const output = join(root, viewport);
  await mkdir(output, { recursive: true });
  for (const surface of surfaces) {
    const referencePath = join(output, `${surface}-reference.png`);
    const implementationPath = join(output, `${surface}-implementation.png`);
    const reference = await sharp(referencePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const implementation = await sharp(implementationPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    if (reference.info.width !== implementation.info.width || reference.info.height !== implementation.info.height) {
      throw new Error(`${viewport}/${surface}: dimensions differ (${reference.info.width}x${reference.info.height} vs ${implementation.info.width}x${implementation.info.height})`);
    }
    const diff = Buffer.alloc(reference.data.length);
    let different = 0;
    let maxDelta = 0;
    for (let i = 0; i < reference.data.length; i += 4) {
      const red = Math.abs(reference.data[i] - implementation.data[i]);
      const green = Math.abs(reference.data[i + 1] - implementation.data[i + 1]);
      const blue = Math.abs(reference.data[i + 2] - implementation.data[i + 2]);
      const delta = Math.max(red, green, blue);
      maxDelta = Math.max(maxDelta, delta);
      if (delta > threshold) different += 1;
      diff[i] = delta > threshold ? 255 : 0;
      diff[i + 1] = delta > threshold ? 40 : 0;
      diff[i + 2] = delta > threshold ? 40 : 0;
      diff[i + 3] = 255;
    }
    await sharp(diff, { raw: { width: reference.info.width, height: reference.info.height, channels: 4 } })
      .png()
      .toFile(join(output, `${surface}-diff.png`));
    results.push({ viewport, surface, width: reference.info.width, height: reference.info.height, mismatch: different / (reference.info.width * reference.info.height), maxDelta });
  }
}

await writeFile(join(root, "summary.json"), `${JSON.stringify(results, null, 2)}\n`, "utf8");
for (const result of results) console.log(`${result.viewport}\t${result.surface}\t${(result.mismatch * 100).toFixed(2)}%\t${result.width}x${result.height}`);
