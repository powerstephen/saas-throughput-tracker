import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        slateBg: "#050816",
        slateCard: "#0B1020",
        slateCardSoft: "#10172A",
        accentGreen: "#34D399",
        accentRed: "#F97373"
      }
    }
  },
  plugins: []
};

export default config;
