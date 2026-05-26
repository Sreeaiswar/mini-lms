/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./App.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        canvas: "#f8fafc",
        ink: "#0f172a",
        muted: "#64748b",
        label: "#334155",
        body: "#475569",
        line: "#e2e8f0",
        "line-input": "#cbd5e1",
        brand: "#2563eb",
        "brand-dark": "#1d4ed8",
      },
      borderRadius: {
        card: "14px",
        control: "10px",
        chip: "999px",
      },
    },
  },
  plugins: [],
};
