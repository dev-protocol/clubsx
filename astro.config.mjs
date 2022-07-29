import { config } from 'dotenv'
import { defineConfig } from 'astro/config'
import vercel from '@astrojs/vercel/serverless'
import tailwind from '@astrojs/tailwind'
import vue from '@astrojs/vue'
import react from '@astrojs/react'
import fs from 'fs-extra'

const path =
  './node_modules/@astrojs/vercel/dist/serverless/request-transform.js'
fs.outputFileSync(
  path,
  ((file) =>
    file.replace(
      'base + req.url',
      `headers['x-middleware-rewrite'] ? headers['x-middleware-rewrite'] : base + req.url`
    ))(fs.readFileSync(path, 'utf8'))
)

config()

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
            if (req.headers.accept?.includes('text/html')) {
              const [domain] = req.headers.host.split('.')
              req.url = `/_sites/${domain}`
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
      config: { path: './tailwind.config.js' },
    }),
  ],
  vite: {
    resolve: {
      conditions: [],
    },
  },
})
