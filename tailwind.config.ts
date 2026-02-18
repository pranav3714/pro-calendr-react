import type { Config } from "tailwindcss";

export default {
  content: ["./packages/core/src/**/*.{ts,tsx}", "./stories/**/*.{ts,tsx}", "./demo/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
