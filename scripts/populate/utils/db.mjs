import dotenv from 'dotenv'
import { createClient } from 'redis'

dotenv.config()

export const db = async () => {
  const client = createClient({
    url: process.env.REDIS_URL,
    username: process.env.REDIS_USERNAME ?? '',
    password: process.env.REDIS_PASSWORD ?? '',
  })
  await client.connect()
  return client
}
