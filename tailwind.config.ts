import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Leverteam accent — тёплый коралл (coral/orange).
        brand: {
          50: "#fff6f3",
          100: "#ffe9e1",
          200: "#ffd0c0",
          300: "#ffae94",
          400: "#ff8564",
          500: "#ff6240",
          600: "#ed4924",
          700: "#c53a1b",
          800: "#a1321a",
          900: "#842e1b",
        },
        // Тёплые нейтральные тона (песочный «холст» интерфейса).
        sand: {
          50: "#faf7f5",
          100: "#f4efeb",
          200: "#eae2db",
          300: "#d9ccc1",
        },
        // Графитовый — оставлен для тёмной темы.
        graphite: {
          800: "#1e232b",
          900: "#171a21",
          950: "#0f1116",
        },
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        // Мягкие, тёплые тени для «воздушного» минимала.
        card: "0 1px 2px rgb(24 16 12 / 0.04), 0 4px 16px -6px rgb(24 16 12 / 0.08)",
        "card-hover": "0 10px 34px -10px rgb(237 73 36 / 0.18)",
      },
      fontSize: {
        // Чуть крупнее базовая типографика.
        "2xl": ["1.6rem", { lineHeight: "1.2", letterSpacing: "-0.02em" }],
        "3xl": ["2rem", { lineHeight: "1.15", letterSpacing: "-0.025em" }],
      },
    },
  },
  // Niche/stage badge colors are built dynamically; keep their classes in the build.
  safelist: [
    {
      pattern:
        /(bg|text|border)-(slate|blue|indigo|violet|amber|emerald|rose|red|orange|pink|sky|fuchsia|cyan|green)-(50|100|200|300|400|500|600|700|800|900)/,
      variants: ["dark"],
    },
  ],
  plugins: [],
};

export default config;
