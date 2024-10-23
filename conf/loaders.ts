import { ModuleOptions } from "webpack";

export function loaders(): ModuleOptions["rules"] {
  const esbuildLoader = {
    test: /\.(ts|tsx|js|jsx)$/,
    exclude: /node_modules/,
    use: {
      loader: "esbuild-loader",
      options: {
        loader: "tsx",
        minify: true,
        target: "es2015",
        tsconfigRaw: {
          compilerOptions: {
            declaration: true,
          },
        },
      },
    },
  };

  return [esbuildLoader];
}
