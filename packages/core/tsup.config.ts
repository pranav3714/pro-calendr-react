import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "views/timeline": "src/views/timeline/index.ts",
    "views/week": "src/views/week/index.ts",
    "views/month": "src/views/month/index.ts",
    "views/day": "src/views/day/index.ts",
    "views/list": "src/views/list/index.ts",
    headless: "src/headless/index.ts",
    plugins: "src/plugins/index.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: true,
  treeshake: true,
  external: [
    "react",
    "react-dom",
    "react/jsx-runtime",
    "zustand",
    "date-fns",
    "date-fns-tz",
    "@tanstack/react-virtual",
  ],
  esbuildOptions(options) {
    options.jsx = "automatic";
  },
  outExtension({ format }) {
    return {
      js: format === "cjs" ? ".cjs" : ".js",
    };
  },
});
