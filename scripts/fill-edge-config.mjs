import { createClient } from 'redis'
import dotenv from 'dotenv'
import { scanOnlyClubs } from './lib.scanOnlyClubs.mjs'
import { Redis } from '@upstash/redis'

dotenv.config()

const upstash = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
})

const app = async () => {
  try {
    const client = createClient({
      url: process.env.REDIS_URL,
      username: process.env.REDIS_USERNAME ?? '',
      password: process.env.REDIS_PASSWORD ?? '',
    })
    await client.connect()

    let updates = 0

    for await (const key of scanOnlyClubs(client)) {
      if (key.includes(':')) {
        // This is not a ClubsConfiguration
        console.log('Skipped:', key)
        continue
      }

      if (await upstash.exists(key)) {
        console.log('Already added', key)
        continue
      }

      console.log('Detect:', key)
      updates = updates + 1
      await upstash.set(key, 1)
    }

    await client.quit()
    console.log('Updates:', updates)
    console.log('Closed the DB connection')
  } catch (error) {
    console.error('error upgrading db: ', error)
  }
}

app()
