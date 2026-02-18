import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  root: __dirname,
  plugins: [react()],
  resolve: {
    alias: {
      "@pro-calendr-react/core": resolve(__dirname, "../packages/core/src/index.ts"),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
