import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#165DFF",
        "primary-dark": "#0e3fb8",
        navy: "#0B1F3A",
        charcoal: "#1A2B45",
        success: "#12B76A",
        warning: "#F79009",
        danger: "#F04438",
        bg: "#F6F8FC",
        neutral: {
          50: "#F6F8FC",
          100: "#EEF2F7",
          200: "#E2E8F0",
          700: "#334155",
          900: "#0F172A",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(11,31,58,0.05), 0 4px 16px rgba(11,31,58,0.06)",
      },
    },
  },
  plugins: [],
};
export default config;
