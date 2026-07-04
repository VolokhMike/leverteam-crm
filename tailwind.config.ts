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
        brand: {
          50: "#eef4ff",
          100: "#dbe6fe",
          200: "#bfd3fe",
          300: "#93b4fd",
          400: "#608bfa",
          500: "#3b64f6",
          600: "#2544eb",
          700: "#1d33d8",
          800: "#1e2caf",
          900: "#1e2b8a",
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
        /(bg|text|border)-(slate|blue|indigo|violet|amber|emerald|rose|red|orange|pink|sky|fuchsia|cyan|green)-(100|200|300|400|500|600|700|800|900)/,
      variants: ["dark"],
    },
  ],
  plugins: [],
};

export default config;
