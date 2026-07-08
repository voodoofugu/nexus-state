// Emits per-directory package.json markers so Node resolves the dual build
// correctly: files under dist/esm are ES modules, files under dist/cjs are
// CommonJS — independent of the root package's "type" field.
import { writeFileSync, mkdirSync } from "node:fs";

mkdirSync("dist/esm", { recursive: true });
mkdirSync("dist/cjs", { recursive: true });

writeFileSync("dist/esm/package.json", JSON.stringify({ type: "module" }, null, 2) + "\n");
writeFileSync("dist/cjs/package.json", JSON.stringify({ type: "commonjs" }, null, 2) + "\n");

console.log("wrote dual-package markers");
