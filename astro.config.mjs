import { config } from 'dotenv'
import { defineConfig } from 'astro/config'
import clubs from '@devprotocol/clubs-core'
import vercel from '@astrojs/vercel/serverless'
import tailwind from '@astrojs/tailwind'
import vue from '@astrojs/vue'
import react from '@astrojs/react'
import svelte from '@astrojs/svelte'
import prefetch from '@astrojs/prefetch'
import markdownIntegration from '@astropub/md'

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
    markdownIntegration(),
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
    prefetch({
      throttle: 10,
    }),
  ],
  markdown: {
    remarkPlugins: [],
    rehypePlugins: [],
    // syntaxHighlight: 'shiki'
    // syntaxHighlight: 'prism'
  },
  vite: {
    server: {
      hmr: {
        timeout: 180000,
      },
    },
  },
})
