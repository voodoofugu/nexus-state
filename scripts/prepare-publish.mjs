import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const publishDir = path.join(root, "publish");

const rootPackage = JSON.parse(
  await readFile(path.join(root, "package.json"), "utf8"),
);

const publishFields = [
  "name",
  "version",
  "description",
  "author",
  "license",
  "type",
  "main",
  "module",
  "types",
  "exports",
  "typesVersions",
  "sideEffects",
  "engines",
  "files",
  "keywords",
  "peerDependencies",
  "peerDependenciesMeta",
  "repository",
  "homepage",
  "bugs",
  "funding",
];

const publishPackage = Object.fromEntries(
  publishFields
    .filter((field) => rootPackage[field] !== undefined)
    .map((field) => [field, rootPackage[field]]),
);

await rm(publishDir, { recursive: true, force: true });
await mkdir(publishDir, { recursive: true });

await cp(path.join(root, "dist"), path.join(publishDir, "dist"), {
  recursive: true,
});
await cp(path.join(root, "README.md"), path.join(publishDir, "README.md"));
await cp(path.join(root, "LICENSE"), path.join(publishDir, "LICENSE"));

await writeFile(
  path.join(publishDir, "package.json"),
  `${JSON.stringify(publishPackage, null, 2)}\n`,
);

console.log(`Prepared publish package: ${publishDir}`);
