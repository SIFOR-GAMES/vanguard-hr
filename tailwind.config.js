/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fbf8f0',
          100: '#f6eed9',
          200: '#eddcb4',
          300: '#e2c687',
          400: '#d4ad5b',
          500: '#ba9547', // Royal Gold
          600: '#a17d34', // Deep Royal Gold
          700: '#846429', // Bronze Gold
          800: '#674e23',
          900: '#4d3a1b',
          950: '#2a1f0d',
        },
        gold: {
          50: '#fbf8f0',
          100: '#f6eed9',
          200: '#eddcb4',
          300: '#e2c687',
          400: '#d4ad5b',
          500: '#ba9547',
          600: '#a17d34',
          700: '#846429',
          800: '#674e23',
          900: '#4d3a1b',
          950: '#2a1f0d',
        },
        ivory: {
          50: '#ffffff',
          100: '#fdfcf9',
          200: '#faf7f2', // Stationery main background
          300: '#f4efe5',
          400: '#ebe3d4',
          500: '#dec7a9',
        },
        sand: {
          100: '#f4efe5',
          200: '#e7dec8', // Stationery divider / card border
          300: '#dfd5be',
          400: '#cfbe9e',
          500: '#b8a37d',
        },
        slate: {
          850: '#1d1916',
          900: '#171412',
          950: '#0f0d0b',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Cinzel"', 'Georgia', 'Cambria', 'serif'],
        arabic: ['"Amiri"', '"Noto Naskh Arabic"', 'Tahoma', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

