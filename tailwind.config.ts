import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["var(--font-dm-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-fira-code)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        health: {
          bg: "#0B1220",
          surface: "#0F172A",
          border: "#1E293B",
          slate: "#64748B",
          sage: "#059669",
          "sage-bright": "#10B981",
          text: "#E2E8F0",
          muted: "#94A3B8",
          success: "#22C55E",
          warning: "#EAB308",
          error: "#EF4444",
          info: "#0EA5E9",
        },
      },
    },
  },
  plugins: [],
};

export default config;
