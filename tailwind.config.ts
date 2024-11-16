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
      },
      animation: {
        'slow-pulse': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite', // adjust the duration as needed
        'color-gradient': 'color-shift 5s ease-in-out infinite',
        'color-gradient-bg': 'gradient-bg 4s ease-in-out infinite',
      },
      keyframes: {
        'color-shift': {
          '0%, 100%': { color: '#66a1ee' },
          '50%': { color: '#cb5eee' }, 
        },
        'gradient-bg': {
          '0%, 100%': { backgroundColor: '#3b82f6' },  // Blue start and end
          '50%': { backgroundColor: '#7c3aed' },        // Purple midway
        },
      },
      textGradientColors: {
        'color-static': 'linear-gradient(to right, #66a1ee, #cb5eee)',
      },
    },
  },
  plugins: [],
};
export default config;
