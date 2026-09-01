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
        primary: "#A63D40",
        "primary-dark": "#863034",
        navy: "#12213D",
        charcoal: "#1C2B45",
        success: "#4C6B54",
        warning: "#F79009",
        "warning-dark": "#92400E",
        danger: "#9A2D2F",
        bg: "#F7F5F0",
        neutral: {
          50: "#F7F5F0",
          100: "#EFEBE3",
          200: "#E2E0D8",
          700: "#3E4654",
          900: "#141B28",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(11,31,58,0.05), 0 4px 16px rgba(11,31,58,0.06)",
      },
    },
  },
  plugins: [],
};
export default config;
