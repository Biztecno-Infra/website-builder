import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: "page-builder/styles", replacement: path.resolve(__dirname, "../dist/index.css") },
      { find: "page-builder", replacement: path.resolve(__dirname, "../dist") }
    ]
  }
});
