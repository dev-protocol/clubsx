import type { APIRoute } from 'astro'
import type { Ticket } from '..'
import { createClient } from 'redis'
import { genHistoryKey } from '../utils/gen-key'

export const get: (opts: {
  ticket: Ticket
  propertyAddress: string
}) => APIRoute =
  ({ ticket, propertyAddress }) =>
  async ({ url }) => {
    const id = url.searchParams.get('id')
    if (!id) {
      return new Response(JSON.stringify({ message: 'missing id' }), {
        status: 400,
      })
    }
    const dbKey = genHistoryKey(propertyAddress, ticket.payload, id)

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

    const history = await client.get(dbKey)

    await client.quit()

    return new Response(history, {
      status: history ? 200 : 400,
    })
  }
