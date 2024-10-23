import webpack from "webpack";
import { loaders } from "./loaders";
import { optimization } from "./optimization";
import { plugins } from "./plugins";
import { resolvers } from "./resolvers";
import { BuildOptions } from "./wbTypes";

export function webpackSett(options: BuildOptions): webpack.Configuration {
  const { paths } = options;

  return {
    mode: "production",
    entry: paths.entry,
    output: {
      path: paths.output,
      filename: "index.js",
      clean: true,
    },
    optimization:  optimization(),
    plugins: plugins(),
    module: {
      rules: loaders(),
    },
    resolve: resolvers(options),
    externals: {
      react: "react",
    },
  };
}
