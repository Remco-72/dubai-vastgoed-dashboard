import { readdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join } from "node:path";
const directory = "out";
const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
if (
  base &&
  (!base.startsWith("/") ||
    base.endsWith("/") ||
    base.includes("..") ||
    /[?#\\]/.test(base))
)
  throw Error("Invalid NEXT_PUBLIC_BASE_PATH");
const scope = `${base}/`;
const manifest = {
  id: scope,
  name: "Apex Property Intelligence",
  short_name: "Apex",
  description: "Binghatti Apex · Unit 1107. Vastgoedadministratie op je iPad.",
  lang: "nl",
  start_url: scope,
  scope,
  display: "standalone",
  background_color: "#0c111b",
  theme_color: "#0c111b",
  icons: [
    {
      src: `${base}/icon-192.png`,
      sizes: "192x192",
      type: "image/png",
      purpose: "any",
    },
    {
      src: `${base}/icon-512.png`,
      sizes: "512x512",
      type: "image/png",
      purpose: "any",
    },
    {
      src: `${base}/icon-maskable.png`,
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable",
    },
  ],
};
await writeFile(
  join(directory, "manifest.webmanifest"),
  JSON.stringify(manifest, null, 2),
);
await writeFile(join(directory, ".nojekyll"), "");
async function walk(dir, prefix = "") {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const name = prefix + entry.name;
    if (entry.isDirectory())
      files.push(...(await walk(join(dir, entry.name), name + "/")));
    else files.push(name);
  }
  return files;
}
const files = (await walk(directory))
  .filter((p) => !p.endsWith(".map") && p !== "sw.js" && p !== ".nojekyll")
  .sort();
const hash = createHash("sha256");
for (const path of files) {
  hash.update(path);
  hash.update(await readFile(join(directory, path)));
}
const version = hash.digest("hex").slice(0, 20);
const urls = [scope, ...files.map((path) => `${base}/${path}`)];
const template = await readFile("scripts/service-worker-template.js", "utf8");
await writeFile(
  join(directory, "sw.js"),
  template.replace(
    "__CONFIG__",
    JSON.stringify({
      scope,
      prefix: `apex-offline:${scope}:`,
      cache: `apex-offline:${scope}:${version}`,
      urls,
    }),
  ),
);
console.log(
  `Offline package built: ${files.length} files, scope ${scope}, version ${version}`,
);
