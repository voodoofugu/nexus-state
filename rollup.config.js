import path from "path";
import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  input: "./src/index.js",
  output: {
    file: path.resolve(__dirname, "dist/index.js"),
    format: "cjs",
    name: "nexusState",
    globals: {
      react: "React",
    },
  },
  external: ["react", "./nexusConfig.js"],
  plugins: [
    resolve({
      extensions: [".js", ".jsx"],
    }),
    commonjs(),
    babel({
      exclude: "node_modules/**",
      babelHelpers: "bundled",
      extensions: [".js", ".jsx"],
    }),
  ],
};
