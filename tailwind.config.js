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
      },
      fontFamily: {
        'c-mono': ['IBM Plex Mono', 'monospace'],
        'c-body': ['Syne', 'sans-serif'],
        'c-serif': ['Bodoni Moda', 'serif'],
        'c-sans': ['DM Sans', 'sans-serif'],
      },
      spacing: {
        'c-hero': '48rem',
      },
    },
  },
}
