import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import del from "rollup-plugin-delete";

export default {
  input: "src/index.tsx",

  output: [
    {
      file: "dist/nexus.js",
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
    typescript(),
    terser({
      output: {
        comments: false, // Удаляет все комментарии
      },
    }),
  ],
  external: ["react"],
};
