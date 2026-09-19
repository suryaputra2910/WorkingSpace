/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: '#1C1B19',
        paper: '#FAF7F2',
        clay: '#B5652D',
        moss: '#3D5A3E',
        sand: '#E6DFD3',
        stone: '#8A8378',
        brick: '#A13D2C',
        cream: '#F5F0E8',
        forest: '#2C4A2D',
        sage: '#7A8F6E',
        wheat: '#D4C5A9',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      boxShadow: {
        soft: '0 1px 3px 0 rgba(28,27,25,0.04), 0 1px 2px -1px rgba(28,27,25,0.04)',
        card: '0 2px 8px -2px rgba(28,27,25,0.06), 0 1px 4px -2px rgba(28,27,25,0.04)',
        elevated: '0 8px 24px -8px rgba(28,27,25,0.1), 0 4px 8px -4px rgba(28,27,25,0.04)',
        modal: '0 20px 60px -12px rgba(28,27,25,0.2)',
      },
      fontSize: {
        'display-xl': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '600' }],
        'display-lg': ['2.75rem', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '600' }],
        'display-md': ['2rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
        'display-sm': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '500' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
