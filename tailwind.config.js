/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        sand: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
        flag: {
          green: '#10B981',
          yellow: '#F59E0B',
          red: '#EF4444',
          doubleRed: '#7F1D1D',
          purple: '#8B5CF6',
        }
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1', boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.7)' },
          '50%': { transform: 'scale(1.05)', opacity: '0.9', boxShadow: '0 0 0 15px rgba(239, 68, 68, 0)' },
        }
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s infinite',
      }
    },
  },
  plugins: [],
}
