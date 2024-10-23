import { Configuration } from "webpack";
import { EsbuildPlugin } from "esbuild-loader";

export function optimization(): Configuration["optimization"] {
  const optimizationConf: Configuration["optimization"] = {
    minimizer: [],
  };

  (optimizationConf.minimizer ??= []).push(
    new EsbuildPlugin({
      target: "es2015",
    })
  );

  return optimizationConf;
}
