import type { APIRoute } from 'astro'
import type { Ticket } from '..'
import { createClient } from 'redis'

export const get: ({ ticket }: { ticket: Ticket }) => APIRoute =
  ({ ticket }) =>
  async ({ url }) => {
    const id = url.searchParams.get('id')
    const key = `${ticket.historyDbKey}#${id}`

    const client = createClient({
      url: process.env.REDIS_URL,
      username: process.env.REDIS_USERNAME ?? '',
      password: process.env.REDIS_PASSWORD ?? '',
      socket: {
        keepAlive: 1,
        reconnectStrategy: 1,
      },
    })
    await client.connect()

    client.on('error', (e) => {
      console.error('redis connection error: ', e)
    })

    const history = await client.get(key)

    await client.quit()

    return {
      status: history ? 200 : 400,
      body: history ?? '',
    }
  }
