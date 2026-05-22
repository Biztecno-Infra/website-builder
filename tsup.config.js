import { defineConfig } from "tsup";
import fs from "fs";
import path from "path";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  outDir: "dist",
  minify: true,
  sourcemap: true,
  splitting: false,
  external: ["react", "react-dom", "react-dnd", "react-dnd-html5-backend"],
  onSuccess: async () => {
    const srcAssets = path.resolve("src/assets");
    const distAssets = path.resolve("dist/assets");
    if (fs.existsSync(srcAssets)) {
      await fs.promises.cp(srcAssets, distAssets, { recursive: true });
      console.log("✓ Assets copied to dist/assets");
    }
  },
});
