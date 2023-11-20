import type { APIRoute } from 'astro'
import { generateStatsId } from '@fixtures/api/keys'
import { createClient } from 'redis'

export const GET: APIRoute = async () => {
  const client = createClient({
    url: process.env.REDIS_URL,
    username: process.env.REDIS_USERNAME ?? '',
    password: process.env.REDIS_PASSWORD ?? '',
    socket: {
      keepAlive: 1,
      reconnectStrategy: () => {
        return 1000
      },
    },
  })
  await client.connect()
  const data = await client.get(generateStatsId('polygon'))
  await client.quit()

  return new Response(JSON.stringify({ data: JSON.parse(data ?? '[]') }), {
    status: 200,
  })
}
