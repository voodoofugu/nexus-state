import path from "path";
import webpack from "webpack";
import { webpackSett } from "./conf/webpackSett";
import { BuildOptions } from "./conf/wbTypes";

export default () => {
  const paths: BuildOptions["paths"] = {
    output: path.resolve(__dirname, "dist"),
    entry: path.resolve(__dirname, "src/index.tsx"),
    src: path.resolve(__dirname, "titans_rc"),
  };

  const config: webpack.Configuration = webpackSett({
    paths,
  });

  return config;
};
