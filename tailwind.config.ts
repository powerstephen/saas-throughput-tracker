/** tailwind.config.ts */
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navyBg: "#020617", // page background
        cardBg: "#020617", // dark card bg
        cardBorder: "#1f2937",
        heroGood: "#16a34a",
        heroWarn: "#ea580c",
        heroBad: "#b91c1c",
        heroText: "#e5e7eb",
        slateSoft: "#1e293b",
        slateSofter: "#0f172a",
      },
      boxShadow: {
        hero: "0 24px 60px rgba(15,23,42,0.65)",
      },
      borderRadius: {
        xlplus: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
