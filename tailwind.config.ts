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
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        brand: {
          50: "#f0f4ff",
          100: "#e0e9ff",
          500: "#3b5bdb",
          600: "#2f4ac8",
          700: "#2340b5",
          900: "#0f1d6b",
        },
        surface: {
          0: "#ffffff",
          50: "#f8f9fc",
          100: "#f1f3f9",
          200: "#e4e8f2",
          800: "#1e2235",
          900: "#131626",
        },
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)",
        lift: "0 4px 24px rgba(0,0,0,0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
