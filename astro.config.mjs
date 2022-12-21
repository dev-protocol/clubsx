import { config } from 'dotenv'
import { defineConfig } from 'astro/config'
import vercel from '@astrojs/vercel/serverless'
import tailwind from '@astrojs/tailwind'
import vue from '@astrojs/vue'
import react from '@astrojs/react'
import svelte from '@astrojs/svelte'
import prefetch from '@astrojs/prefetch'

config()

// https://astro.build/config
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL,
  server: {
    port: 3000,
  },
  output: 'server',
  adapter: vercel(),
  integrations: [
    {
      name: 'clubs:multi-tenant',
      hooks: {
        'astro:server:setup': ({ server }) => {
          server.middlewares.use((req, _, next) => {
            if (
              req.headers.accept?.includes('text/html') ||
              new URL(req.url, `http://${req.headers.host}`).pathname.includes(
                '.'
              ) === false
            ) {
              const host = req.headers.host.split('.')

              if (host.length > 1) {
                req.url = `/sites_/${host[0]}${req.url}`
              }
            }

            next()
          })
        },
      },
    },
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.includes('-'),
        },
      },
    }),
    react(),
    tailwind({
      config: {
        path: './tailwind.config.js',
      },
    }),
    svelte(),
    prefetch({
      throttle: 10,
    }),
  ],
  vite: {
    resolve: {
      conditions: [],
    },
  },
})
