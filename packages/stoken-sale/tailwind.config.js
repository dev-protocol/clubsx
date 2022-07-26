module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        Syne: ['Syne', 'sans-serif'],
        DMSans: ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/aspect-ratio')],
}
