/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#000",
        primaryGray: "#d1d5db", // gray-300
        primaryBlue: "#3b82f6", // blue-500, 原本#171C61
      },
    },
  },
  plugins: [],
};
