import { defineConfig } from "tsup";
import sassPlugin from "esbuild-sass-plugin";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  outDir: "dist",
  minify: true,
  sourcemap: true,
  splitting: false,
  esbuildPlugins: [sassPlugin()]
});
