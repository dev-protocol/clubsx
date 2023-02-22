import { createClient } from 'redis'

export const post = async () => {
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
  const keys = (await client.keys('*')).filter((key) => !key.startsWith('id::'))
  const data = []

  for (const key of keys) {
    const config = await client.get(key)
    if (!config) continue
    data.push(config)
  }
  await client.disconnect()
  return new Response(JSON.stringify(data), { status: 200 })
}
