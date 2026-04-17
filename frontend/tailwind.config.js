/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      colors: {
        brand: {
          50:  "#eef6ff",
          100: "#d9eaff",
          200: "#b8d6ff",
          300: "#8bbbff",
          400: "#5b96ff",
          500: "#2b6ffd",
          600: "#1753db",
          700: "#1242b0",
          800: "#123a8c",
          900: "#13336e",
        },
      },
    },
  },
  plugins: [],
};
