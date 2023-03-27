import { installablePlugins } from '@constants/plugins'

export const get = async () => {
  return new Response(JSON.stringify({ plugins: installablePlugins }), {
    status: 200,
  })
}
