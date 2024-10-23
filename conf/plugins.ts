import webpack, { Configuration } from "webpack";

export function plugins(): Configuration["plugins"] {

  const pluginsConf: Configuration["plugins"] = [];


  pluginsConf.push(new webpack.ProgressPlugin());

  return pluginsConf;
}
