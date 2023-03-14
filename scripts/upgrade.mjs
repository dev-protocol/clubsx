import { createClient } from 'redis'
import dotenv from 'dotenv'
import { decode, encode } from '@devprotocol/clubs-core'

dotenv.config()

const upgrade = (key, config) => {
  const deocdedConfig = decode(config)
  const upgradedConfig = { ...deocdedConfig }

  if (upgradedConfig.url.includes('<USERS_SITE_NAME_HERE>')) {
    console.log(key, 'has <USERS_SITE_NAME_HERE> on `url`')

    upgradedConfig.url = `https://${key}.clubs.place`
  }
  return encode(upgradedConfig)
}

const app = async () => {
  try {
    const client = createClient({
      url: process.env.REDIS_URL,
      username: process.env.REDIS_USERNAME ?? '',
      password: process.env.REDIS_PASSWORD ?? '',
    })
    await client.connect()

    for await (const key of client.scanIterator()) {
      if (key.startsWith('id::')) {
        // This is not a ClubsConfiguration
        console.log('Skipped:', key)
        continue
      }

      const encodedConfig = await client.get(key)
      const upgradedConfig = upgrade(key, encodedConfig)
      if (encodedConfig === upgradedConfig) {
        console.log('Up-to-date', key)
        continue
      }

      console.log('Detect:', key)
      await client.set(key, upgradedConfig)
      console.log('Upgraded:', key)
    }

    console.log('DB Upgraded')
    await client.quit()
    console.log('Closed the DB connection')
    return
  } catch (error) {
    console.error('error upgrading db: ', error)
  }
}

app()
