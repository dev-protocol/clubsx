import { createClient } from 'redis'
import dotenv from 'dotenv'

dotenv.config()

const flushDb = async () => {
  try {
    const client = createClient({
      url: process.env.REDIS_URL,
      username: process.env.REDIS_USERNAME ?? '',
      password: process.env.REDIS_PASSWORD ?? '',
    })
    await client.connect()

    await client.flushAll()

    console.log('DB Flushed')
    await client.quit()
    console.log('Closed the DB connection')
  } catch (error) {
    console.error('error flushing db: ', error)
  }
}

flushDb()
