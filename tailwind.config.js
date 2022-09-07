const {
  theme: { colors, fontFamily, screens },
} = require('@devprotocol/hashi/tailwind')

module.exports = {
  mode: 'jit',
  content: [
    './public/**/*.html',
    './src/**/*.{astro,js,jsx,svelte,ts,tsx,vue}',
    './node_modules/@devprotocol/clubs-core/**/*.{astro,js,jsx,svelte,ts,tsx,vue}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      screens,
      colors,
      fontFamily: Object.assign(
        {
          serif: ['Bodoni Moda', 'serif'],
        },
        fontFamily
      ),
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
