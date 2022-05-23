module.exports = {
  mode: 'jit',
  content: [
    './public/**/*.html',
    './src/**/*.{astro,js,jsx,svelte,ts,tsx,vue}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        darkPrimary: '#0d0f12',
        darkSecondary: '#1E3A8A',
        darkThird: '#1F2937',
        accent: '#3A4158',
      },
      fontFamily: {
        'c-mono': ['IBM Plex Mono', 'monospace'],
        'c-body': ['Syne', 'sans-serif'],
        'c-serif': ['Bodoni Moda', 'serif'],
        'c-sans': ['DM Sans', 'sans-serif'],
      },
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
