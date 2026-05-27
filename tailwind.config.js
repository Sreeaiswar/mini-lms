/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./App.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        canvas: "#f8fafc",
        "canvas-dark": "#0F172A",
        surface: "#ffffff",
        "surface-dark": "#1E293B",
        ink: "#0f172a",
        "ink-dark": "#F8FAFC",
        muted: "#64748b",
        "muted-dark": "#94A3B8",
        label: "#334155",
        "label-dark": "#CBD5E1",
        body: "#475569",
        "body-dark": "#CBD5E1",
        line: "#e2e8f0",
        "line-dark": "#334155",
        "line-input": "#cbd5e1",
        "line-input-dark": "#475569",
        brand: "#2563eb",
        "brand-dark": "#1d4ed8",
        "brand-bright": "#3B82F6",
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
