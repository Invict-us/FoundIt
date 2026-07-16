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
        navy: {
          50: '#E8EDF4',
          100: '#C5D0E3',
          200: '#9EAFD0',
          300: '#7790BD',
          400: '#5978AE',
          500: '#3B619F',
          600: '#335491',
          700: '#294580',
          800: '#1E3A5F',
          900: '#0F2644',
          DEFAULT: '#1E3A5F',
        },
        teal: {
          50: '#E0F7F5',
          100: '#B3ECE6',
          200: '#80E0D5',
          300: '#4DD4C4',
          400: '#26CBB8',
          500: '#14B8A6',
          600: '#0FA89A',
          700: '#09968A',
          800: '#05847B',
          900: '#006560',
          DEFAULT: '#14B8A6',
        },
        sky: {
          50: '#E6F0FA',
          100: '#C0D9F3',
          200: '#96C0EB',
          300: '#6CA7E3',
          400: '#4A90E2',
          500: '#3A7BD5',
          600: '#326CC4',
          700: '#2859AE',
          800: '#1E4898',
          900: '#0E2F72',
          DEFAULT: '#4A90E2',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-lg': '0 12px 48px 0 rgba(31, 38, 135, 0.12)',
        'navy': '0 4px 14px 0 rgba(30, 58, 95, 0.1)',
        'navy-lg': '0 10px 30px 0 rgba(30, 58, 95, 0.15)',
        'teal': '0 4px 14px 0 rgba(20, 184, 166, 0.3)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'float-slower': 'float 10s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
        'gradient': 'gradient 8s ease infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: 0.6 },
          '50%': { opacity: 1 },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [],
};
