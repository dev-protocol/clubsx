import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { vitePreprocess } from '@astrojs/svelte'
import vue from '@vitejs/plugin-vue'

const ext = ['.astro', '.png', '.jpg', '.gif', '.svg', '.css', '.scss']

export default defineConfig({
  plugins: [
    vue(),
    svelte({ preprocess: [vitePreprocess()] }),
    {
      name: 'ignore_static_files',
      load(id) {
        if (ext.every((e) => !id.includes(e))) {
          return
        }
        return ''
      },
    },
  ],
})
