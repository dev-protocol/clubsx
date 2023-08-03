import { createClient } from 'redis'
import dotenv from 'dotenv'
// import { decode, encode } from '@devprotocol/clubs-core'

dotenv.config()

const app = async () => {
  const client = createClient({
    url: process.env.REDIS_URL,
    username: process.env.REDIS_USERNAME ?? '',
    password: process.env.REDIS_PASSWORD ?? '',
  })
  await client.connect()

  let count = 0
  for await (const key of client.scanIterator()) {
    if (/^[a-z]+::/i.test(key)) {
      // This key is not a tenant.
      continue
    }

    count++
    console.log({ key, count })
  }
  await client.quit()
}

app()
