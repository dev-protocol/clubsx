import { config } from 'dotenv'
import { defineConfig } from 'astro/config'
import clubs from '@devprotocol/clubs-core'
import vercel from '@astrojs/vercel/serverless'
import tailwind from '@astrojs/tailwind'
import vue from '@astrojs/vue'
import react from '@astrojs/react'
import svelte from '@astrojs/svelte'

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
    clubs(),
    {
      name: 'clubs:multi-tenant',
      hooks: {
        'astro:server:setup': ({ server }) => {
          server.middlewares.use((req, _, next) => {
            if (req.headers.accept?.includes('text/html')) {
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
    tailwind(),
    svelte(),
  ],
  vite: {
    server: {
      hmr: {
        timeout: 360000,
      },
    },
    resolve: {
      alias: {
        'three/examples/jsm/controls/OrbitControls':
          '/node_modules/three/examples/jsm/controls/OrbitControls',
        '@devprotocol/clubs-core/src/layouts/AdminSidebar.astro':
          '/node_modules/@devprotocol/clubs-core/src/layouts/AdminSidebar.astro',
        '@devprotocol/clubs-core/src/layouts/AdminThemeCard.astro':
          '/node_modules/@devprotocol/clubs-core/src/layouts/AdminThemeCard.astro',
      },
    },
  },
})
