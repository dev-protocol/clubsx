import { config } from 'dotenv'
import { defineConfig } from 'astro/config'
import clubs from '@devprotocol/clubs-core'
import vercel from '@astrojs/vercel/serverless'
import tailwind from '@astrojs/tailwind'
import lit from '@astrojs/lit'
import vue from '@astrojs/vue'
import react from '@astrojs/react'
import svelte from '@astrojs/svelte'
// import commonjs from '@rollup/plugin-commonjs'

import builtInApiPaths from './built-in-api-paths'

config()

const singleMode = ((i) => (i > -1 ? process.argv[i + 1] : undefined))(
  process.argv.findIndex((a) => a === '--club'),
)

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
            if (
              req.headers.accept?.includes('text/html') ||
              (req.url.startsWith('/api/') &&
                builtInApiPaths.every((p) => !req.url.startsWith(p)))
            ) {
              const host = req.headers.host.split('.')

              if (host.length > 1 || singleMode) {
                req.url = `/sites_/${singleMode ?? host[0]}${req.url}`
              }
            }

            next()
          })
        },
      },
    },
    lit(),
    vue(),
    react(),
    tailwind(),
    svelte(),
  ],
  vite: {
    ssr: { noExternal: ['path-to-regexp'] },
    build: { sourcemap: true },
    plugins: [
      // commonjs({
      //   requireReturnsDefault: (id) => {
      //     return id.includes('qrcode')
      //   },
      // }),
    ],
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
        // TODO: workaround for until closed this -> https://github.com/eemeli/yaml/pull/560
        // yaml: '/node_modules/yaml/browser/index.js',
      },
    },
  },
})
