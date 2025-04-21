import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        poppins: ["var(--font-poppins)"],
        mono: ["var(--font-mono)", "monospace"],
      },
      animation: {
        fadeOut: "fadeOut 2s ease-in-out forwards",
        "fade-in-0": "fadeIn 300ms ease-in-out",
        "fade-in-50": "fadeIn 300ms ease-in-out both",
        "fade-out-50": "fadeOut 200ms ease-in-out both",
        "slide-in-from-top-2": "slideInFromTop 300ms ease-out",
        "slide-out-to-bottom-2": "slideOutToBottom 200ms ease-in",
      },
      keyframes: {
        fadeOut: {
          "0%": { opacity: "1" },
          "75%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideInFromTop: {
          "0%": { transform: "translateY(-0.5rem)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideOutToBottom: {
          "0%": { transform: "translateY(0)", opacity: "1" },
          "100%": { transform: "translateY(0.5rem)", opacity: "0" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
