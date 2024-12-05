import defaultTheme from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Jura", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        dark: {
          50: "#D3D1FF",
          100: "#A19EFF",
          200: "#4942FF",
          300: "#0700E0",
          400: "#1f1d38",
          500: "#010020",
          600: "#010019",
          700: "#010014",
          800: "#01000F",
          900: "#000005",
          950: "#000005",
        },
        secondary: {
          50: "#fdfde9",
          100: "#fdfbc4",
          200: "#fbf38d",
          300: "#f9e54b",
          400: "#f5d31a",
          500: "#f1c40f",
          600: "#c59009",
          700: "#9d670b",
          800: "#825211",
          900: "#6f4314",
          950: "#412307",
        },
        primary: {
          50: "#fff4fd",
          100: "#fee9fb",
          200: "#fcd2f5",
          300: "#f9aeea",
          400: "#f47eda",
          500: "#e637bf",
          600: "#cd2ca6",
          700: "#a92285",
          800: "#8b1d6d",
          900: "#721d59",
          950: "#4b0736",
        },
      },
      keyframes: {
        'coin-pop': {
          '0%': { 
            transform: 'translateY(0) translateX(-50%) scale(0.5)',
            opacity: '0'
          },
          '50%': {
            transform: 'translateY(-20px) translateX(-50%) scale(1.2)',
            opacity: '1'
          },
          '100%': {
            transform: 'translateY(-40px) translateX(-50%) scale(1)',
            opacity: '0'
          }
        }
      },
      animation: {
        'coin-pop': 'coin-pop 0.6s ease-out'
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
  daisyui: {
    themes: ["synthwave"],
  },
};
