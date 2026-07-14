/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#fcfcfb",
        plane: "#f9f9f7",
        ink: {
          primary: "#0b0b0b",
          secondary: "#52514e",
          muted: "#898781",
        },
        line: {
          grid: "#e1e0d9",
          axis: "#c3c2b7",
        },
        risk: {
          low: "#0ca30c",
          medium: "#fab219",
          high: "#ec835a",
          critical: "#d03b3b",
        },
        chart: {
          1: "#2a78d6",
          2: "#1baf7a",
          3: "#eda100",
          4: "#008300",
          5: "#4a3aa7",
          6: "#e34948",
          7: "#e87ba4",
          8: "#eb6834",
        },
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};
