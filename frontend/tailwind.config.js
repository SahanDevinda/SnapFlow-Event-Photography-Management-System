/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['"Plus Jakarta Sans"', 'ui-serif', 'Georgia', 'serif'],
      },
      colors: {
        // Primary brand palette. Used across every page (navy-*).
        navy: {
          50:  '#f3f5f9',
          100: '#e4e8f1',
          200: '#c9d2e4',
          300: '#a2b1ce',
          400: '#7489b3',
          500: '#546a99',
          600: '#42537d',
          700: '#374465',
          800: '#2f3a55',
          900: '#1c2438',
          950: '#111726',
        },
        charcoal: {
          800: '#25252c',
          900: '#1E1E24',
          950: '#141418'
        },
        gold: {
          50:  '#fdf9ec',
          300: '#eed489',
          400: '#E5C158',
          500: '#D4AF37',
          600: '#B89325',
          700: '#94741c'
        }
      },
      borderWidth: {
        3: '3px',
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        'slide-in': {
          '0%':   { opacity: '0', transform: 'translateY(8px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      animation: {
        'slide-in': 'slide-in 0.18s ease-out',
      },
    },
  },
  plugins: [],
}
