import { createClient } from 'redis'

export const config = async (
  site: string | number | undefined,
): Promise<string> => {
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
    throw new Error('No site passed')
  }

  const res = (await client.get(`${site}`)) as string
  if (!res) {
    throw new Error(`No entry found ${site}`)
  }
  await client.quit()
  return res
}
