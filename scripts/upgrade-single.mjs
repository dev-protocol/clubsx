import { createClient } from 'redis'
import dotenv from 'dotenv'
import { decode, encode } from '@devprotocol/clubs-core'

dotenv.config()

const KEY = 'xxx'

const upgrade = (config) => {
  const deocdedConfig = decode(config)
  const upgradedConfig = { ...deocdedConfig }

  /**
   * Write upgrading script here
   */

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

    const encodedConfig = await client.get(KEY)
    const upgradedConfig = upgrade(encodedConfig)

    if (encodedConfig === upgradedConfig) {
      console.log('Up-to-date', KEY)
    } else {
      await client.set(KEY, upgradedConfig)
      console.log('Upgraded:', KEY)
      console.log('DB Upgraded')
    }

    await client.quit()
    console.log('Closed the DB connection')
  } catch (error) {
    console.error('error upgrading db: ', error)
  }
}

app()
