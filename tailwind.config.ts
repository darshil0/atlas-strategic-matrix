import type { Config } from "tailwindcss";

const config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        atlas: {
          blue: "#3b82f6",
          indigo: "#6366f1",
          slate: "#0f172a",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
