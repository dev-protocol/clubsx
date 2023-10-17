import { createClient } from 'redis'
import dotenv from 'dotenv'
import fetch from 'cross-fetch'

dotenv.config()

const KEY = 'xxx'

const app = async () => {
  try {
    const client = createClient({
      url: process.env.REDIS_URL,
      username: process.env.REDIS_USERNAME ?? '',
      password: process.env.REDIS_PASSWORD ?? '',
    })
    await client.connect()

    const source = await fetch(`https://clubs.place/api/config/${KEY}`).then(
      (data) => data.json(),
    )
    console.log({ source })

    await client.set(KEY, source.content)
    console.log('Copied from production:', KEY)

    await client.quit()
    console.log('Closed the DB connection')
  } catch (error) {
    console.error('error upgrading db: ', error)
  }
}

app()
