/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Nunito', 'sans-serif'] },
      colors: {
        brand: {
          purple: '#8B5CF6',
          green: '#A3E635',
          dark: '#0D0D1A',
        },
      },
    },
  },
  plugins: [],
}
