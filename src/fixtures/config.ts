import { createClient } from 'redis'
import { validate } from './site'
import { Redis } from '@upstash/redis'

const upstash = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_READ_ONLY_TOKEN,
})

export const config = async (
  site: string | number | undefined,
): Promise<string | null> => {
  if ((site ? validate(site.toString()) : false) === false) {
    return null
  }
  if ((await upstash.exists(site?.toString() ?? '')) === 0) {
    // TODO: This process should be moved to the middleware with the appropriate URL percing.
    return null
  }

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

  if (!site) {
    console.error('WARN:', new Error('No site passed'))
  }

  const res = await client.get(`${site}`)
  if (!res) {
    console.error('WARN:', new Error(`No entry found ${site}`))
  }
  await client.quit()
  return res
}
