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
      },
      keyframes: {
        "coin-pop": {
          "0%": {
            transform: "translateY(0) translateX(-50%) scale(0.5)",
            opacity: "0",
          },
          "50%": {
            transform: "translateY(-20px) translateX(-50%) scale(1.2)",
            opacity: "1",
          },
          "100%": {
            transform: "translateY(-40px) translateX(-50%) scale(1)",
            opacity: "0",
          },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
      },
      animation: {
        "coin-pop": "coin-pop 0.6s ease-out",
        "fade-in": "fade-in 0.5s ease-in forwards",
        "fade-out": "fade-out 0.5s linear forwards",
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
  daisyui: {
    themes: [
      "retro", 
      "synthwave", 
      "cyberpunk", 
      "dark", 
      "light", 
      "forest",
      "cupcake",
      "acid",
      "aqua",
      "black",
      "bumblebee",
      "corporate",
      "dracula",
      "emerald",
      "fantasy",
      "garden",
      "halloween",
      {
        mytheme: {
          "primary": "#a991f7",
          "secondary": "#f6d860",
          "accent": "#37cdbe",
          "neutral": "#3d4451",
          "base-100": "#ffffff",
        },
      },
      {
        mytheme2: {
          primary: "#000000",
          secondary: "#000000",
          accent: "#000000",
          neutral: "#000000",
          base: {
            100: "#000000",
            200: "#000000",
            300: "#000000",
            400: "#000000",
            500: "#000000",
          },
        },
      },
    ],
  },
};
