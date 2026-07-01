/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2E7D32',
          dark: '#1B5E20',
          light: '#A5D6A7',
          50: '#E8F5E9',
          100: '#C8E6C9',
          200: '#A5D6A7',
          500: '#4CAF50',
          700: '#2E7D32',
          900: '#1B5E20',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
