/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          600: '#059669',
          700: '#047857',
        },
        stone: {
          50: '#fafaf9',
          200: '#e7e5e4',
        }
      },
      fontFamily: {
        'system': ['system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}