const { tailwindPreset } = require('@devprotocol/clubs-core')
const typography = require('@tailwindcss/typography')

/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  presets: [tailwindPreset],
  plugins: [typography],
  theme: {
    extend: {
      animation: {
        'c-bash-spinner': 'c-bash-spinner 1s linear infinite',
      },
      keyframes: {
        'c-bash-spinner': {
          '0%': { content: '"/"' },
          '33%': { content: '"-"' },
          '66%': { content: '"\\005C"' },
          '100%': { content: '"|"' },
        },
      },
    },
  },
}
