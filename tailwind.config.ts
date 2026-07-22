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
        sans: ["ui-monospace", "SFMono-Regular", "monospace"],
        mono: ["ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        neon: {
          blue: "#0080FF",
          pink: "#FF006E",
          cyan: "#00FFFF",
          purple: "#5D34D0",
          silver: "#C0C0C0",
          gold: "#FFD700",
        },
        deep: {
          black: "#1A1A2E",
          dark: "#0D0D1A",
        },
      },
      boxShadow: {
        neon: "0 0 10px rgba(0,128,255,0.3), 0 0 20px rgba(0,128,255,0.15)",
        "neon-pink":
          "0 0 10px rgba(255,0,110,0.3), 0 0 20px rgba(255,0,110,0.15)",
        "neon-cyan":
          "0 0 10px rgba(0,255,255,0.3), 0 0 20px rgba(0,255,255,0.15)",
      },
    },
  },
  plugins: [],
};

export default config;
