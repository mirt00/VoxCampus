/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#1e3a5f", light: "#2d5a8e", dark: "#142840" },
        accent: "#f59e0b",
      },
    },
  },
  plugins: [],
};
