import { createClient } from 'redis'
import { encode } from '@devprotocol/clubs-core'

export const config = async (
  site: string | number | undefined
): Promise<string> => {
  const client = createClient({
    url: process.env.REDIS_URL,
    username: process.env.REDIS_USERNAME ?? '',
    password: process.env.REDIS_PASSWORD ?? '',
  })
  await client.connect()

  client.on('error', (e) => {
    console.error('redis connection error: ', e)
  })

  if (!site) {
    throw new Error('No site passed')
  }

  const res = (await client.get(`${site}`)) as string
  return encode(JSON.parse(res))
}
