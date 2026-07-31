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
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0095FF',
          600: '#0077E6',
          700: '#005FB8',
          800: '#0369A1',
          900: '#0C4A6E',
        },
        surface: {
          bg: '#F2FAFD',
          card: '#FFFFFF',
          sidebar: '#0F172A',
          accent: '#E0F4FB',
        },
        risk: {
          high: '#F43F5E',
          'high-bg': '#FFF1F2',
          medium: '#F59E0B',
          'medium-bg': '#FEF3C7',
          low: '#10B981',
          'low-bg': '#ECFDF5',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
