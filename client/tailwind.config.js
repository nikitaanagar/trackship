/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#2563EB',      // Primary Blue
          navy: '#0F172A',      // Dark Navy
          bg: '#F8FAFC',        // Light Background
          success: '#16A34A',   // Success Green
          warning: '#D97706',   // Warning Amber
          danger: '#DC2626',    // Danger Red
          muted: '#64748B',     // Muted Gray
          border: '#E2E8F0',    // Border Color
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'xl': '12px',
        'lg': '8px',
      }
    },
  },
  plugins: [],
}
