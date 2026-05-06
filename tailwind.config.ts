import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        // #F45D48 primary brand color
        brand: {
          50:  "#fff4f1",
          100: "#ffe4dc",
          200: "#ffc6b6",
          300: "#ffa08a",
          400: "#f88b7e",
          500: "#f67462",
          600: "#F45D48",
          700: "#cc3a18",
          800: "#a52f15",
          900: "#852915",
          950: "#480f06",
        },
        // #1658f6 accent blue
        accent: {
          50:  "#eff4fe",
          100: "#d9e6fd",
          200: "#b0cafc",
          300: "#7da6f9",
          400: "#4a82f8",
          500: "#2a6cf7",
          600: "#1e40af",
          700: "#1046cc",
          800: "#0d379f",
          900: "#0a2a79",
          950: "#061852",
        },
      },
    },
  },
  plugins: [],
};
export default config;
