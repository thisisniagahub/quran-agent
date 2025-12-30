import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "pulse-glow": "#00F0FF",
        "pulse-accent": "#00F0FF",
        "pulse-deep": "#0077B6",
        "pulse-dark": "#020617",
        "bg-ocean": "#020617",
        "pulse-gold": "#D4AF37", // Islamic Gold
        "gold-light": "#F4E08F",
      },
      fontFamily: {
        sans: ['var(--font-jakarta)', 'sans-serif'],
        arabic: ['var(--font-amiri)', 'serif'],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
      },
      backgroundImage: {
        "islamic-pattern": "url('https://www.transparenttextures.com/patterns/arabesque.png')", // Subtle fallback or placeholder
      }
    },
  },
  plugins: [],
};
export default config;
