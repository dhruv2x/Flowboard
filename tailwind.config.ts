import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        fg: { DEFAULT: '#18181B', secondary: '#4B4B53', muted: '#74747C', faint: '#A3A3AB' },
        surface: { DEFAULT: '#FFFFFF', subtle: '#F9F9FA', muted: '#F2F2F4' },
        line: { DEFAULT: '#E8E8EB', strong: '#D6D6DB' },
        accent: { DEFAULT: '#3358D4', hover: '#2A4BBF', subtle: '#EEF2FD' },
        danger: { DEFAULT: '#D1342F', subtle: '#FDEEEE' },
        status: { stone: '#8E8E96', amber: '#D4900A', sky: '#2F7FD8', green: '#2E9E5B' },
        priority: { urgent: '#DC3E2A', high: '#E07B16' },
        tone: { clay: '#F4E3D8', moss: '#DDEBD9', slate: '#DCE4F2' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['11px', '16px'],
        xs: ['12px', '16px'],
        sm: ['13px', '20px'],
        base: ['14px', '22px'],
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        md: '6px',
        lg: '8px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,16,20,0.04)',
        lift: '0 2px 6px -2px rgba(16,16,20,0.08), 0 10px 28px -8px rgba(16,16,20,0.18)',
        drawer: '-16px 0 40px -16px rgba(16,16,20,0.2)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(-4deg)' },
          '50%': { transform: 'translateY(-5px) rotate(-2deg)' },
        },
      },
      animation: {
        float: 'float 3.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
