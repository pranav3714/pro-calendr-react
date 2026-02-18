import type { Config } from "tailwindcss";

export default {
  content: ["./packages/core/src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
