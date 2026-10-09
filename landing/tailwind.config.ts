import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#050810",
          secondary: "#0a0f1e",
          tertiary: "#0f1629",
          elevated: "#141b2d",
        },
        text: {
          primary: "#f0f2f5",
          secondary: "#8b95a9",
          muted: "#5a6478",
        },
        accent: {
          DEFAULT: "#6366f1",
          hover: "#818cf8",
          soft: "rgba(99,102,241,0.12)",
          glow: "rgba(99,102,241,0.25)",
        },
        border: {
          DEFAULT: "rgba(255,255,255,0.06)",
          hover: "rgba(255,255,255,0.12)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      fontSize: {
        "hero": ["5rem", { lineHeight: "1.05", letterSpacing: "-0.03em" }],
        "hero-mobile": ["2.75rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "section": ["3rem", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
        "section-mobile": ["2rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
      },
      maxWidth: {
        content: "1200px",
        text: "680px",
      },
      spacing: {
        section: "140px",
        "section-mobile": "80px",
      },
      animation: {
        "fade-up": "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards",
        "fade-in": "fadeIn 0.5s ease forwards",
        "pulse-slow": "pulse 4s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;