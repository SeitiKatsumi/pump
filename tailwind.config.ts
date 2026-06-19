import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        field: {
          50: '#f6f7f4',
          100: '#e7ebe1',
          500: '#71816d',
          700: '#3e4c43',
          900: '#17211d',
        },
        safety: '#c73e1d',
        steel: '#2f4050',
        signal: '#2f9e44',
      },
      boxShadow: {
        panel: '0 20px 60px rgba(15, 23, 20, 0.12)',
      },
    },
  },
  plugins: [],
} satisfies Config;
