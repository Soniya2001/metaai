/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F8F8F5',
        surface: '#FFFFFF',
        'surface-subtle': '#F2F3F0',
        'primary-text': '#202421',
        'muted-text': '#777D79',
        border: '#E7E9E6',
        'border-strong': '#D0D4CD',
        accent: {
          DEFAULT: '#16877A',
          hover: '#126D62',
          light: '#D7E8E2',
          subtle: '#EBF4F1',
          glow: 'rgba(22, 135, 122, 0.15)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Geist', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card': '0 2px 8px -2px rgba(22, 36, 33, 0.05), 0 1px 3px 0 rgba(22, 36, 33, 0.03)',
        'dropdown': '0 10px 25px -5px rgba(22, 36, 33, 0.08), 0 8px 10px -6px rgba(22, 36, 33, 0.04)',
        'floating': '0 20px 30px -10px rgba(22, 36, 33, 0.1)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      animation: {
        'pulse-subtle': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wave': 'wave 1.2s ease-in-out infinite alternate',
      },
      keyframes: {
        wave: {
          '0%': { height: '20%' },
          '100%': { height: '100%' },
        }
      }
    },
  },
  plugins: [],
}

