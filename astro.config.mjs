import { config } from 'dotenv'
import { defineConfig } from 'astro/config'
import clubs from '@devprotocol/clubs-core'
import vercel from '@astrojs/vercel/serverless'
import netlify from '@astrojs/netlify/functions'
import tailwind from '@astrojs/tailwind'
import vue from '@astrojs/vue'
import react from '@astrojs/react'
import svelte from '@astrojs/svelte'
import builtInApiPaths from './built-in-api-paths'

config()

// https://astro.build/config
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL,
  server: {
    port: 3000,
  },
  output: 'server',
  adapter: (process.env.NETLIFY ? netlify : vercel)(),
  integrations: [
    clubs(),
    {
      name: 'clubs:multi-tenant',
      hooks: {
        'astro:server:setup': ({ server }) => {
          server.middlewares.use((req, _, next) => {
            if (
              req.headers.accept?.includes('text/html') ||
              (req.url.startsWith('/api/') &&
                builtInApiPaths.every((p) => !req.url.startsWith(p)))
            ) {
              const host = req.headers.host.split('.')
              const [, ...primaryHost] = host

              if (host.length > 1) {
                req.headers.host = primaryHost.join('.')
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
        '@crossmint/client-sdk-react-ui/package.json':
          '/node_modules/@crossmint/client-sdk-react-ui/package.json',
      },
    },
  },
})
