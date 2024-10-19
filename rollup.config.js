import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import del from "rollup-plugin-delete";
import commonjs from "@rollup/plugin-commonjs";

export default [
  {
    input: "./src/index.ts",
    output: [
      {
        file: "dist/index.js",
        format: "es",
        exports: "named",
        globals: {
          react: "React",
        },
      },
    ],
    plugins: [
      del({ targets: "dist/*" }),
      resolve(),
      commonjs(),
      typescript(),
      terser(),
    ],
    external: ["react"],
  },
];
