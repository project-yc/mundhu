/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0F2854',
          800: '#132E5B',
          700: '#1C4D8D',
          600: '#2560A4',
          500: '#4988C4',
          400: '#6BA3D6',
          300: '#8EBDE4',
          200: '#BDE8F5',
          100: '#E0F3FA',
          50: '#F0F9FD',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      fontSize: {
        'display': ['2rem', { lineHeight: '2.5rem', letterSpacing: '-0.025em', fontWeight: '700' }],
        'heading': ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.015em', fontWeight: '600' }],
        'subheading': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.02em', fontWeight: '600' }],
        'body': ['0.875rem', { lineHeight: '1.5rem', fontWeight: '400' }],
        'caption': ['0.75rem', { lineHeight: '1rem', fontWeight: '500' }],
        'metric': ['2.25rem', { lineHeight: '2.75rem', letterSpacing: '-0.03em', fontWeight: '700' }],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(15, 40, 84, 0.04), 0 1px 2px -1px rgba(15, 40, 84, 0.06)',
        'card-hover': '0 4px 12px 0 rgba(15, 40, 84, 0.08), 0 2px 4px -2px rgba(15, 40, 84, 0.04)',
        'elevated': '0 8px 24px -4px rgba(15, 40, 84, 0.1), 0 2px 8px -2px rgba(15, 40, 84, 0.04)',
        'modal': '0 20px 60px -12px rgba(15, 40, 84, 0.18), 0 8px 24px -8px rgba(15, 40, 84, 0.08)',
        'button': '0 1px 2px 0 rgba(28, 77, 141, 0.12)',
        'button-hover': '0 2px 8px 0 rgba(28, 77, 141, 0.18)',
        'inset': 'inset 0 1px 2px 0 rgba(15, 40, 84, 0.06)',
      },
      borderRadius: {
        'card': '10px',
        'button': '8px',
        'input': '8px',
        'badge': '6px',
        'modal': '14px',
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease-out',
        slideUp: 'slideUp 0.2s ease-out',
        spin: 'spin 1s linear infinite',
      },
      keyframes: {
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        slideUp: {
          'from': { opacity: '0', transform: 'translateY(8px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
