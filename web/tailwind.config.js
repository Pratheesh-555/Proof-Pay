/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#111111',
        muted: '#626b76',
        canvas: '#f6f7f9',
        line: '#e5e7eb',
        brand: { DEFAULT: '#0066f5', dark: '#053782', soft: '#edf4ff' },
      },
      boxShadow: { panel: '0 2px 14px rgba(17, 24, 39, 0.05)' },
      fontFamily: { sans: ['Century Gothic', 'Avenir Next', 'Arial', 'sans-serif'] },
    },
  },
  plugins: [],
};

