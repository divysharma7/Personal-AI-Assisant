import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/contexts/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/shared/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "var(--bg-canvas)",
          elevated: "var(--bg-elevated)",
          card: "var(--bg-card)",
          hover: "var(--bg-hover)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          soft: "var(--accent-soft)",
          foreground: "var(--accent-foreground)",
          light: "var(--accent-light)",
          dim: "var(--accent-dim)",
          glow: "var(--accent-glow)",
        },
        item: {
          event: "var(--info)",
          task: "var(--success)",
          reminder: "var(--warning)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "scale-in": "scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "noise": "url('/noise.svg')",
      },
      boxShadow: {
        "glow-purple": "0 0 30px var(--accent-glow)",
        "glow-blue": "0 0 30px var(--accent-glow)",
        "card": "var(--shadow-card)",
        "elevated": "var(--shadow-elevated)",
        "float": "var(--shadow-modal)",
      },
    },
  },
  plugins: [],
};

export default config;
