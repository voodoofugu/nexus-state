import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import esbuild from "rollup-plugin-esbuild";
import del from "rollup-plugin-delete";

export default {
  input: "src/index.tsx",

  output: [
    {
      file: "dist/index.js",
      format: "cjs",
    },
    // {
    //   file: "dist/index.js",
    //   format: "esm",
    // },
  ],
  plugins: [
    del({ targets: "dist/*" }),
    resolve(),
    commonjs(),
    esbuild({
      target: "es6",
      jsx: "transform",
      minify: true,
      tsconfig: "tsconfig.json",
    }),
  ],
  external: ["react"],
};
