import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import del from "rollup-plugin-delete";
import commonjs from "@rollup/plugin-commonjs";
import dts from "rollup-plugin-dts";

const entries = {
  index: "./src/index.ts",
  react: "./src/react.ts",
  devtools: "./src/devtools.ts",
};

const external = (id) => /^react/.test(id);

const makePlugins = (clean) => [
  ...(clean ? [del({ targets: "dist/*" })] : []),
  resolve(),
  commonjs(),
  typescript({ tsconfig: "./tsconfig.json", declaration: false }),
  terser({
    ecma: 5,
    compress: {
      ecma: 5,
      passes: 2,
      unsafe: true,
      unsafe_comps: true,
      unsafe_math: true,
      drop_console: true,
      pure_funcs: ["console.log"],
    },
    mangle: { toplevel: true },
    output: { comments: false, ecma: 5 },
  }),
];

// Bundled, self-contained declarations per entry — each entry is built on its
// own so shared types are inlined (no internal relative imports), which resolves
// cleanly under both ESM and CJS type resolution.
const dtsBuilds = (dir, entryFileNames = "[name].d.ts") =>
  Object.entries(entries).map(([name, input]) => ({
    input: { [name]: input },
    output: { dir, format: "es", entryFileNames },
    plugins: [dts({ tsconfig: "./tsconfig.json" })],
    external,
  }));

export default [
  // ESM builds (index / react)
  {
    input: entries,
    output: {
      dir: "dist/esm",
      format: "esm",
      entryFileNames: "[name].js",
      generatedCode: "es5",
    },
    plugins: makePlugins(true),
    external,
  },
  // CJS builds (index / react)
  {
    input: entries,
    output: {
      dir: "dist/cjs",
      format: "cjs",
      entryFileNames: "[name].js",
      exports: "named",
      generatedCode: "es5",
    },
    plugins: makePlugins(false),
    external,
  },
  // Type declarations, bundled for both module systems
  ...dtsBuilds("dist/esm"),
  ...dtsBuilds("dist/cjs", "[name].d.cts"),
];
