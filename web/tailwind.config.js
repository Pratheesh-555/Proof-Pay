/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#101828',
        muted: '#667085',
        canvas: '#f5f6f8',
        line: '#e5e7eb',
        brand: { DEFAULT: '#0070e0', dark: '#003087', soft: '#eaf2ff' },
      },
      boxShadow: { panel: '0 2px 14px rgba(16, 24, 40, 0.05)' },
      fontFamily: { sans: ['Outfit', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};

