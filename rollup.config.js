import scss from "rollup-plugin-scss";

export default {
  input: "src/index.ts",
  output: {
    file: "dist/index.js",
    format: "esm",
  },
  plugins: [
    scss({
      output: "dist/styles.css", // Compiles to a single CSS file
    }),
  ],
};
