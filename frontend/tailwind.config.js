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
          50: '#F0F9FF',
          100: '#0d0d0dff',
          200: '#032334ff',
          300: '#809097ff',
          400: '#38BDF8',
          500: '#0095FF',
          600: '#0077E6',
          700: '#005FB8',
          800: '#0369A1',
          900: '#0C4A6E',
        },
        surface: {
          bg: '#000000',
          card: '#0F172A',
          sidebar: '#030712',
          accent: '#1E293B',
        },
        risk: {
          high: '#F43F5E',
          'high-bg': '#31121A',
          medium: '#F59E0B',
          'medium-bg': '#33230A',
          low: '#10B981',
          'low-bg': '#08281E',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
