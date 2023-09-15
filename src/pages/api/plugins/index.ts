import { installablePlugins } from '@constants/plugins'

export const GET = async () => {
  return new Response(JSON.stringify({ plugins: installablePlugins }), {
    status: 200,
  })
}
