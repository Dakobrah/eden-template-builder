/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'daoc': {
          'dark': '#0f0f1a',
          'darker': '#0a0a12',
          'blue': '#1e40af',
          'gold': '#d4af37',
        },
        'albion': '#dc2626',
        'hibernia': '#16a34a',
        'midgard': '#2563eb',
        'stat': {
          'capped': '#22c55e',
          'near': '#eab308',
          'normal': '#3b82f6',
          'over': '#f59e0b',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
