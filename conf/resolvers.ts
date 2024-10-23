import { Configuration } from "webpack";
import { BuildOptions } from "./wbTypes";

export function resolvers(options: BuildOptions): Configuration["resolve"] {
  return {
    extensions: [".ts", ".js", ".tsx", ".jsx"],
    alias: {
      "@": options.paths.src,
    },
  };
}
