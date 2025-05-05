/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,jsx,ts,tsx}", "*.{js,ts,jsx,tsx,mdx}", "app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "var(--violet-500)",
          foreground: "hsl(var(--primary-foreground))",
          50: "var(--violet-50)",
          100: "var(--violet-100)",
          200: "var(--violet-200)",
          300: "var(--violet-300)",
          400: "var(--violet-400)",
          500: "var(--violet-500)",
          600: "var(--violet-600)",
          700: "var(--violet-700)",
          800: "var(--violet-800)",
          900: "var(--violet-900)",
          950: "var(--violet-950)",
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
        dark: {
          950: "#080010",
          900: "#0f0018",
          800: "#170025",
          700: "#1f0030",
          600: "#2a0045",
          500: "#3b0061",
        },
        // Definindo as cores de violet como azul e fuchsia como verde
        violet: {
          50: "#f0f7ff", // Azul muito claro (equivalente ao violet-50 original em opacidade)
          100: "#e0f0ff",
          200: "#c0e0ff",
          300: "#91c8ff",
          400: "#5aa6ff",
          500: "#1890ff", // Azul principal
          600: "#096dd9",
          700: "#0050b3",
          800: "#003a8c",
          900: "#002766", // Azul escuro
          950: "#001a4d",
        },
        fuchsia: {
          50: "#f0fff7", // Verde muito claro (equivalente ao fuchsia-50 original em opacidade)
          100: "#e0fff0",
          200: "#c0ffe0",
          300: "#91ffc8",
          400: "#5affa6",
          500: "#10b759", // Verde principal
          600: "#0a9447",
          700: "#077435",
          800: "#055526",
          900: "#033a1a", // Verde escuro
          950: "#01290f",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
