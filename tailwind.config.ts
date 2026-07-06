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
        // Leverteam accent — индиго (indigo-600 как основной).
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
        },
        // Графитовый фон сайдбара.
        graphite: {
          800: "#1e232b",
          900: "#171a21",
          950: "#0f1116",
        },
      },
      borderRadius: {
        xl: "0.9rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)",
        "card-hover": "0 8px 24px -6px rgb(0 0 0 / 0.12)",
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
