/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        app: {
          bg: '#121212',
          surface: '#1E1E1E',
          accent: '#CCFF00',
          light: '#F5F5F7',
          lightSurf: '#FFFFFF'
        }
      },
      boxShadow: {
        'neon': '0 0 15px rgba(204, 255, 0, 0.4)',
        'neon-sm': '0 0 8px rgba(204, 255, 0, 0.3)',
      }
    },
  },
  plugins: [],
}
