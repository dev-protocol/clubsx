const { clubs } = require('@devprotocol/clubs-core/tailwind')

module.exports = {
  mode: 'jit',
  presets: [clubs],
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
