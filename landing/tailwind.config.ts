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
          primary: "#f1f3f7",
          secondary: "#98a2b8",
          muted: "#7d889f",
        },
        accent: {
          DEFAULT: "#787cf8",
          hover: "#9398fa",
          soft: "rgba(120,124,248,0.12)",
          glow: "rgba(120,124,248,0.25)",
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
        display: ["clamp(48px, 6vw, 76px)", { lineHeight: "0.98", letterSpacing: "-0.035em" }],
        section: ["clamp(36px, 4vw, 52px)", { lineHeight: "1.08", letterSpacing: "-0.025em" }],
        subheading: ["22px", { lineHeight: "1.3", letterSpacing: "-0.01em" }],
        "body-lg": ["18px", { lineHeight: "1.55", letterSpacing: "0" }],
        body: ["16px", { lineHeight: "1.6", letterSpacing: "0" }],
        small: ["14px", { lineHeight: "1.45", letterSpacing: "0" }],
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