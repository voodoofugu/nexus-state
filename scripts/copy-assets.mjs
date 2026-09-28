// Copies the JSDoc logo into the build. Editors resolve the image in a hover
// relative to the .d.ts that carries the doc comment, so the file has to ship
// with the package — a URL would mean a network request on every hover and
// would break whenever the repository layout changes.
//
// Only this one file is copied: src/assets also holds the README banner, which
// is an order of magnitude larger and has no business in the published package.
import { copyFileSync, mkdirSync } from "node:fs";

const LOGO = "nexus-state-logoText.svg";

mkdirSync("dist/assets", { recursive: true });
copyFileSync(`src/assets/${LOGO}`, `dist/assets/${LOGO}`);

console.log(`copied ${LOGO}`);
