import { createClient } from 'redis'
import { decode } from '@devprotocol/clubs-core'

export const get = async () => {
  const client = createClient({
    url: process.env.REDIS_URL,
    username: process.env.REDIS_USERNAME ?? '',
    password: process.env.REDIS_PASSWORD ?? '',
  })
  await client.connect()

  client.on('error', (e) => {
    console.error('redis connection error: ', e)
  })

  const sites = []

  // scans the keys
  for await (const key of client.scanIterator()) {
    // use the key to fetch config
    const config = await client.get(key)
    if (!config) continue
    sites.push(decode(config))
  }

  return new Response(JSON.stringify(sites), { status: 200 })
}
