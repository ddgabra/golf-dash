import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        fairway: {
          50: "#f0f7ec",
          100: "#dff0d5",
          200: "#b8d9a8",
          300: "#9ac36d",
          400: "#7aad4a",
          500: "#5d9430",
          600: "#4d7d22",
          700: "#376d31",
          800: "#1f5d2a",
          900: "#163513",
          950: "#10200f",
        },
        gold: {
          DEFAULT: "#f4c84b",
          dark: "#d4a82b",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      minHeight: {
        touch: "44px",
      },
      minWidth: {
        touch: "44px",
      },
    },
  },
  plugins: [],
};

export default config;
