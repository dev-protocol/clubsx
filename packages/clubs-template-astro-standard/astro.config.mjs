import { config } from 'dotenv'
import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import vue from '@astrojs/vue'

config()

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL,
  server: {
    port: 3000,
  },
  integrations: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.includes('-'),
        },
      },
    }),
    tailwind({
      config: { path: './tailwind.config.js' },
    }),
  ],
  vite: {
    resolve: {
      conditions: [],
    },
  },
})