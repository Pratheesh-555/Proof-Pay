/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#17211f',
        muted: '#75817d',
        canvas: '#f7f8f6',
        line: '#e8ece9',
        brand: { DEFAULT: '#216b58', dark: '#174d40', soft: '#e6f2ed' },
      },
      boxShadow: { panel: '0 2px 12px rgba(25, 46, 39, 0.045)' },
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};

