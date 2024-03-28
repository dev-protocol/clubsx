import { createClient } from 'redis'
import dotenv from 'dotenv'
import { decode } from '@devprotocol/clubs-core'

dotenv.config()

const app = async () => {
  try {
    const client = createClient({
      url: process.env.REDIS_URL,
      username: process.env.REDIS_USERNAME ?? '',
      password: process.env.REDIS_PASSWORD ?? '',
    })
    await client.connect()

    for await (const key of client.scanIterator()) {
      if (key.includes(':')) {
        // This is not a ClubsConfiguration
        console.log('Skipped:', key)
        continue
      }

      const encodedConfig = await client.get(key)
      const decodedConfig = decode(encodedConfig)
      await client.json.set(
        `doc::clubs:clubs::${decodedConfig.propertyAddress}`,
        '$',
        { id: key, propertyAddress: decodedConfig.propertyAddress },
      )

      console.log('Set:', key)
    }

    console.log('DB Upgraded')
    await client.quit()
    console.log('Closed the DB connection')
  } catch (error) {
    console.error('error upgrading db: ', error)
  }
}

app()
