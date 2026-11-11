/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#111111',
        muted: '#686a6d',
        canvas: '#f5f6f8',
        line: '#e5e7eb',
        brand: { DEFAULT: '#0066f5', dark: '#053782', soft: '#edf4ff' },
      },
      boxShadow: { panel: '0 3px 18px rgba(17, 24, 39, 0.055)' },
      fontFamily: { sans: ['Arial', 'Helvetica Neue', 'sans-serif'] },
    },
  },
  plugins: [],
};

