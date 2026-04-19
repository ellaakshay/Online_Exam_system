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
        primary: {
          DEFAULT: '#a78bfa',
          dark: '#7c3aed',
        },
        surface: {
          DEFAULT: 'rgba(255,255,255,0.05)',
          card: 'rgba(255,255,255,0.08)',
        },
        dark: {
          DEFAULT: '#0d0d1a',
          secondary: '#0f0c29',
          card: '#1a1740',
        },
        admin: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        student: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}